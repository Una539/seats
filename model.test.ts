import { test } from 'node:test'
import assert from 'node:assert/strict'
import { initialState, parseStudents, assign, randomAssign, pendingStudents, resize, validateState } from './src/lib/model.ts'
import { createWorkbook } from './src/lib/export.ts'

test('52 人验收：12 人手动，40 人随机，禁用保护且每人仅出现一次', () => {
  let state = initialState()
  state.students = parseStudents(Array.from({ length: 52 }, (_, i) => `学生${i + 1}`).join('\n'))
  state.seats.slice(-4).forEach(s => { s.enabled = false })
  for (let i = 0; i < 12; i++) state = assign(state, Math.floor(i / 8), i % 8, state.students[i]!.id)
  const manual = state.seats.slice(0, 12).map(s => s.studentId)
  state = randomAssign(state)
  assert.deepEqual(state.seats.slice(0, 12).map(s => s.studentId), manual)
  assert.equal(pendingStudents(state).length, 0)
  assert.equal(new Set(state.seats.filter(s => s.studentId).map(s => s.studentId)).size, 52)
  assert.ok(state.seats.filter(s => !s.enabled).every(s => !s.studentId))
  assert.deepEqual(validateState(JSON.parse(JSON.stringify(state))), state)
  assert.throws(() => resize(state, 1, 1))
})

test('导入保留同名独立 ID；空白、BOM、各种换行被处理', () => {
  const students = parseStudents('\uFEFF 张明 \r\n\n张明\r李华 ')
  assert.deepEqual(students.map(s => s.name), ['张明', '张明', '李华'])
  assert.equal(new Set(students.map(s => s.id)).size, 3)
})

test('座位不足不修改数据；禁止重复安排或安排到禁用位置', () => {
  const state = resize(initialState(), 1, 1)
  state.students = parseStudents('甲\n乙')
  const before = JSON.stringify(state)
  assert.throws(() => randomAssign(state), /不足/)
  assert.equal(JSON.stringify(state), before)
  const occupied = assign(state, 0, 0, state.students[0]!.id)
  assert.throws(() => assign(occupied, 0, 0, state.students[0]!.id))
  state.seats[0]!.enabled = false
  assert.throws(() => assign(state, 0, 0, state.students[0]!.id))
  assert.throws(() => resize(state, 0, 3))
})

test('讲台视角同时颠倒行列、非对称过道镜像、XLSX 可重新读取且不改变源数据', async () => {
  let state = resize(initialState(), 2, 4)
  state.verticalAisles = [1]
  state.students = parseStudents('前左\n后右')
  state = assign(state, 0, 0, state.students[0]!.id)
  state = assign(state, 1, 3, state.students[1]!.id)
  state.seats.find(s => s.row === 0 && s.col === 1)!.enabled = false
  const before = JSON.stringify(state)
  const workbook = await createWorkbook(state)
  const bytes = await workbook.xlsx.writeBuffer()
  await workbook.xlsx.load(bytes)
  const sheet = workbook.worksheets[0]!
  assert.equal(sheet.getCell('B3').value, '后右')
  assert.equal(sheet.getCell('F4').value, '前左')
  assert.equal(sheet.getCell('E3').value, '过\n道')
  assert.equal(sheet.getCell('E4').master.address, 'E3')
  assert.equal(sheet.getCell('A2').value, '门')
  assert.equal(sheet.getCell('G2').value, '窗')
  assert.equal(sheet.getCell('B6').value, '讲台')
  assert.equal(sheet.pageSetup.orientation, 'landscape')
  assert.equal(JSON.stringify(state), before)
})
