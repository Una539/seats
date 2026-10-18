export interface Student { id: string; name: string }
export interface Seat { row: number; col: number; enabled: boolean; studentId: string | null }
export interface ClassroomState { rows: number; cols: number; students: Student[]; seats: Seat[]; verticalAisles: number[] }
export const STORAGE_KEY = 'classroom-seating-v1'
export function initialState(): ClassroomState {
  return { rows: 7, cols: 8, students: [], seats: makeSeats(7, 8), verticalAisles: [2, 6] }
}
function makeSeats(rows: number, cols: number): Seat[] {
  return Array.from({ length: rows * cols }, (_, i) => ({ row: Math.floor(i / cols), col: i % cols, enabled: true, studentId: null }))
}
export function parseStudents(text: string): Student[] {
  return text.replace(/^\uFEFF/, '').split(/\r\n|\n|\r/).map(name => name.trim()).filter(Boolean).map(name => ({ id: crypto.randomUUID(), name }))
}
export function pendingStudents(state: ClassroomState): Student[] {
  const assigned = new Set(state.seats.map(s => s.studentId))
  return state.students.filter(s => !assigned.has(s.id))
}
export function resize(state: ClassroomState, rows: number, cols: number): ClassroomState {
  if (!Number.isInteger(rows) || !Number.isInteger(cols) || rows < 1 || cols < 1 || rows > 20 || cols > 20) throw new Error('行数和列数请输入 1–20 的整数。')
  if (state.seats.some(s => (s.row >= rows || s.col >= cols) && s.studentId)) throw new Error('缩小范围内有已安排的学生，请先取消这些座位的安排。')
  return { ...state, rows, cols, seats: makeSeats(rows, cols).map(s => state.seats.find(old => old.row === s.row && old.col === s.col) ?? s), verticalAisles: state.verticalAisles.filter(b => b < cols) }
}
export function assign(state: ClassroomState, row: number, col: number, studentId: string): ClassroomState {
  if (!pendingStudents(state).some(s => s.id === studentId)) throw new Error('该学生已安排或不存在。')
  const target = state.seats.find(s => s.row === row && s.col === col)
  if (!target?.enabled || target.studentId) throw new Error('请选择有效空座位。')
  return { ...state, seats: state.seats.map(s => s === target ? { ...s, studentId } : s) }
}
export function randomAssign(state: ClassroomState, random = Math.random): ClassroomState {
  const students = [...pendingStudents(state)]
  const empty = state.seats.filter(s => s.enabled && !s.studentId)
  if (empty.length < students.length) throw new Error(`空座位不足：待安排 ${students.length} 人，仅有 ${empty.length} 个有效空座位。`)
  for (let i = students.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1)); [students[i], students[j]] = [students[j]!, students[i]!]
  }
  let index = 0
  return { ...state, seats: state.seats.map(s => s.enabled && !s.studentId && index < students.length ? { ...s, studentId: students[index++]!.id } : s) }
}
export function validateState(value: unknown): ClassroomState {
  const s = value as ClassroomState
  if (!s || !Number.isInteger(s.rows) || !Number.isInteger(s.cols) || s.rows < 1 || s.rows > 20 || s.cols < 1 || s.cols > 20 || !Array.isArray(s.students) || !Array.isArray(s.seats) || !Array.isArray(s.verticalAisles)) throw new Error('保存的数据格式无效。')
  const ids = new Set<string>(), assigned = new Set<string>(), positions = new Set<string>()
  for (const student of s.students) {
    if (!student || typeof student.id !== 'string' || !student.id || typeof student.name !== 'string' || !student.name.trim() || ids.has(student.id)) throw new Error('学生数据无效。')
    ids.add(student.id)
  }
  for (const seat of s.seats) {
    if (!seat || !Number.isInteger(seat.row) || !Number.isInteger(seat.col) || seat.row < 0 || seat.row >= s.rows || seat.col < 0 || seat.col >= s.cols || typeof seat.enabled !== 'boolean' || (seat.studentId !== null && typeof seat.studentId !== 'string')) throw new Error('座位数据无效。')
    const key = `${seat.row},${seat.col}`
    if (positions.has(key)) throw new Error('座位重复。')
    positions.add(key)
    if (seat.studentId) {
      if (!seat.enabled || !ids.has(seat.studentId) || assigned.has(seat.studentId)) throw new Error('座位分配数据无效。')
      assigned.add(seat.studentId)
    }
  }
  if (positions.size !== s.rows * s.cols || new Set(s.verticalAisles).size !== s.verticalAisles.length || s.verticalAisles.some(b => !Number.isInteger(b) || b < 1 || b >= s.cols)) throw new Error('布局数据无效。')
  return s
}
export function saveState(state: ClassroomState): void { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) }
export function loadState(): ClassroomState | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw ? validateState(JSON.parse(raw)) : null
}
