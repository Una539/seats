import { test } from 'node:test'
import assert from 'node:assert/strict'
import { assign, initialState, randomAssign, resize, validateState } from './src/lib/model.ts'
import type { ClassroomState } from './src/lib/model.ts'
import { parsePreferenceRules, randomAssignWithPreferences, scorePreferences } from './src/lib/preferences.ts'
import type { PreferenceRule } from './src/lib/preferences.ts'

function seed(value = 12345) {
  return () => { value = (Math.imul(value, 1664525) + 1013904223) >>> 0; return value / 4294967296 }
}
function room(rows: number, cols: number, count: number): ClassroomState {
  const state = resize(initialState(), rows, cols)
  state.verticalAisles = []
  state.students = Array.from({ length: count }, (_, i) => ({ id: `id${i}`, name: `学生${i}` }))
  return state
}
const together: PreferenceRule = { type: 'together', students: ['id0', 'id1'] }
const apart: PreferenceRule = { type: 'apart', students: ['id0', 'id1'] }

test('version 1 导入逐条过滤，trim、未知、重名、自身、类型、严格二人和无向去重', () => {
  const students = [...room(1, 4, 3).students, { id: 'duplicate', name: ' 学生2 ' }]
  const value = { version: 1, rules: [
    { type: 'together', students: [' 学生0 ', '学生1'] },
    { type: 'together', students: ['学生1', '学生0'] },
    { type: 'apart', students: ['学生1', '学生0'] },
    null, 1, {}, { type: 'other', students: ['学生0', '学生1'] },
    { type: 'apart', students: ['学生0', '未知'] },
    { type: 'apart', students: ['学生0', '学生2'] },
    { type: 'apart', students: ['学生0', ' 学生0 '] },
    { type: 'apart', students: ['学生0'] },
    { type: 'apart', students: ['学生0', '学生1', '学生2'] },
    { type: 'apart', students: ['学生0', 1] },
    { type: 'apart', students: '学生0,学生1' },
  ] }
  const before = JSON.stringify({ value, students })
  assert.deepEqual(parsePreferenceRules(value, students), [together, { type: 'apart', students: ['id1', 'id0'] }])
  for (const invalid of [null, [], {}, { version: '1', rules: [] }, { version: 2, rules: [] }, { version: 1, rules: {} }]) {
    assert.deepEqual(parsePreferenceRules(invalid, students), [])
  }
  assert.equal(JSON.stringify({ value, students }), before)
})

test('together 奖励同排相邻且无过道；无法同桌时偏好靠近', () => {
  let state = room(2, 4, 2)
  state = assign(assign(state, 0, 0, 'id0'), 0, 1, 'id1')
  const neighbours = scorePreferences(state, [together])
  const across = { ...state, verticalAisles: [1] }
  assert.ok(neighbours > scorePreferences(across, [together]) + 1)
  const far = { ...across, seats: across.seats.map(s => ({ ...s, studentId: s.row === 0 && s.col === 0 ? 'id0' : s.row === 1 && s.col === 3 ? 'id1' : null })) }
  assert.ok(scorePreferences(across, [together]) > scorePreferences(far, [together]))
})

test('apart 使用包含行距和过道宽的归一欧式距离', () => {
  let state = room(3, 4, 2)
  state.verticalAisles = [1, 3]
  state = assign(assign(state, 0, 0, 'id0'), 1, 1, 'id1')
  assert.ok(Math.abs(scorePreferences(state, [apart]) - Math.hypot(1, 2) / Math.hypot(2, 5)) < 1e-12)
})

test('12 人手动、40 人随机，禁用不重复、固定保护、输入不变，评分不差于初始', async () => {
  let state = initialState()
  state.students = room(7, 8, 52).students
  state.seats.slice(-4).forEach(s => { s.enabled = false })
  for (let i = 0; i < 12; i++) state = assign(state, Math.floor(i / 8), i % 8, `id${i}`)
  const rules: PreferenceRule[] = Array.from({ length: 51 }, (_, i) => ({ type: i % 2 ? 'apart' : 'together', students: [`id${i}`, `id${i + 1}`] }))
  const before = JSON.stringify({ state, rules })
  const baseline = randomAssign(state, seed())
  const result = await randomAssignWithPreferences(state, rules, seed())
  assert.deepEqual(result.seats.slice(0, 12), state.seats.slice(0, 12))
  assert.ok(result.seats.filter(s => !s.enabled).every(s => s.studentId === null))
  assert.equal(new Set(result.seats.filter(s => s.studentId).map(s => s.studentId)).size, 52)
  assert.deepEqual(validateState(result), result)
  assert.ok(scorePreferences(result, rules) >= scorePreferences(baseline, rules) - 1e-10)
  assert.equal(JSON.stringify({ state, rules }), before)
})

test('空位参与交换，少人数也可以到后排', async () => {
  let state = room(4, 4, 2)
  state = assign(state, 0, 0, 'id0')
  const result = await randomAssignWithPreferences(state, [apart], seed())
  assert.equal(result.seats.find(s => s.studentId === 'id1')!.row, 3)
  assert.equal(result.seats.find(s => s.studentId === 'id1')!.col, 3)
  assert.equal(result.seats[0]!.studentId, 'id0')
})

test('固定冲突和相互冲突是软规则，不移动固定座位也不抛错', async () => {
  let state = room(2, 3, 3)
  state = assign(assign(state, 0, 0, 'id0'), 1, 2, 'id1')
  const rules = [together, apart]
  const result = await randomAssignWithPreferences(state, rules, seed())
  assert.equal(result.seats[0]!.studentId, 'id0')
  assert.equal(result.seats[5]!.studentId, 'id1')
  const full = assign(state, 0, 1, 'id2')
  assert.deepEqual(await randomAssignWithPreferences(full, rules, seed()), full)
})

test('无规则严格保留原算法输出、随机数消耗和不足座位错误', async () => {
  const state = room(3, 4, 8)
  let calls = 0, originalCalls = 0
  const a = seed(), b = seed()
  assert.deepEqual(await randomAssignWithPreferences(state, [], () => { calls++; return a() }),
    randomAssign(state, () => { originalCalls++; return b() }))
  assert.equal(calls, originalCalls)
  const insufficient = room(1, 1, 2)
  await assert.rejects(randomAssignWithPreferences(insufficient, [], seed()), /空座位不足/)
  await assert.rejects(randomAssignWithPreferences(insufficient, [apart], seed()), /空座位不足/)
})

test('together 优化优先选择真正同桌而非跨过道相邻', async () => {
  let state = room(1, 4, 2)
  state.verticalAisles = [1]
  state = assign(state, 0, 1, 'id0')
  const result = await randomAssignWithPreferences(state, [together], seed())
  assert.equal(result.seats.find(s => s.studentId === 'id1')!.col, 2)
  assert.equal(result.seats[1]!.studentId, 'id0')
})

test('大量合法规则不截断，优化不降低全量评分', async () => {
  const state = room(3, 4, 8)
  const rules = Array.from({ length: 25000 }, (_, i) => i % 2 ? together : apart)
  const before = randomAssign(state, seed())
  const result = await randomAssignWithPreferences(state, rules, seed())
  assert.ok(scorePreferences(result, rules) >= scorePreferences(before, rules) - 1e-8)
})
