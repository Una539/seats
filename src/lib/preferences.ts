import { randomAssign } from './model.ts'
import type { ClassroomState, Seat, Student } from './model.ts'

export interface PreferenceRule {
  type: 'apart' | 'together'
  students: [string, string]
}

export function parsePreferenceRules(value: unknown, students: Student[]): PreferenceRule[] {
  if (!value || typeof value !== 'object' || !('version' in value) || value.version !== 1 ||
      !('rules' in value) || !Array.isArray(value.rules)) return []
  const names = new Map<string, string | null>()
  for (const student of students) {
    const name = student.name.trim()
    names.set(name, names.has(name) ? null : student.id)
  }
  const seen = new Set<string>()
  const result: PreferenceRule[] = []
  for (const entry of value.rules) {
    if (!entry || typeof entry !== 'object' || (entry.type !== 'apart' && entry.type !== 'together') ||
        !Array.isArray(entry.students) || entry.students.length !== 2 ||
        !entry.students.every((name: unknown) => typeof name === 'string')) continue
    const a = names.get(entry.students[0].trim()), b = names.get(entry.students[1].trim())
    if (!a || !b || a === b) continue
    const key = JSON.stringify([entry.type, ...[a, b].sort()])
    if (seen.has(key)) continue
    seen.add(key)
    result.push({ type: entry.type, students: [a, b] })
  }
  return result
}

function geometry(state: ClassroomState) {
  const aisles = new Set(state.verticalAisles)
  const x = (col: number) => col + state.verticalAisles.filter(boundary => boundary <= col).length
  const diameter = Math.max(1, Math.hypot(state.rows - 1, x(state.cols - 1) - x(0)))
  return (rule: PreferenceRule, a: Seat | undefined, b: Seat | undefined): number => {
    if (!a || !b) return 0
    const distance = Math.hypot(a.row - b.row, x(a.col) - x(b.col)) / diameter
    if (rule.type === 'apart') return distance
    // A real desk neighbour gets an extra reward, not merely a small distance advantage.
    const neighbours = a.row === b.row && Math.abs(a.col - b.col) === 1 && !aisles.has(Math.max(a.col, b.col))
    return 1 - distance + (neighbours ? 1 : 0)
  }
}

export function scorePreferences(state: ClassroomState, rules: PreferenceRule[]): number {
  const positions = new Map(state.seats.filter(s => s.studentId !== null).map(s => [s.studentId!, s]))
  const score = geometry(state)
  return rules.reduce((sum, rule) => sum + score(rule, positions.get(rule.students[0]), positions.get(rule.students[1])), 0)
}

export async function randomAssignWithPreferences(
  state: ClassroomState, rules: PreferenceRule[], random = Math.random,
): Promise<ClassroomState> {
  if (rules.length === 0) return randomAssign(state, random)
  const started = performance.now()
  const assigned = randomAssign(state, random)
  const seats = assigned.seats.map(seat => ({ ...seat }))
  const movable = state.seats.flatMap((seat, index) => seat.enabled && seat.studentId === null ? [index] : [])
  if (movable.length < 2) return assigned
  const positions = new Map(seats.filter(s => s.studentId !== null).map(s => [s.studentId!, s]))
  const byStudent = new Map<string, number[]>()
  rules.forEach((rule, index) => {
    for (const id of new Set(rule.students)) {
      const indices = byStudent.get(id) ?? []
      indices.push(index)
      byStudent.set(id, indices)
    }
  })
  const score = geometry(state)
  const evaluate = (index: number) => {
    const rule = rules[index]!
    return score(rule, positions.get(rule.students[0]), positions.get(rule.students[1]))
  }
  // Cache every rule; the work budget limits proposals, never drops legal rules.
  const scores = rules.map((_, index) => evaluate(index))
  let work = 0
  for (let iteration = 0; iteration < 6000; iteration++) {
    if (performance.now() - started >= 120 || work >= 200_000) break
    if (iteration > 0 && iteration % 200 === 0) {
      await new Promise<void>(resolve => setTimeout(resolve, 0))
      if (performance.now() - started >= 120) break
    }
    const a = seats[movable[Math.floor(random() * movable.length)]!]!
    const b = seats[movable[Math.floor(random() * movable.length)]!]!
    if (a === b || a.studentId === b.studentId) continue
    const affected = new Set<number>()
    for (const id of [a.studentId, b.studentId]) {
      if (id !== null) for (const index of byStudent.get(id) ?? []) affected.add(index)
    }
    if (work + affected.size > 200_000 || performance.now() - started >= 120) break
    work += affected.size
    const swap = () => {
      ;[a.studentId, b.studentId] = [b.studentId, a.studentId]
      if (a.studentId !== null) positions.set(a.studentId, a)
      if (b.studentId !== null) positions.set(b.studentId, b)
    }
    swap()
    let delta = 0
    const next: [number, number][] = []
    for (const index of affected) {
      const value = evaluate(index)
      delta += value - scores[index]!
      next.push([index, value])
    }
    if (delta > 1e-12) {
      for (const [index, value] of next) scores[index] = value
    } else swap()
  }
  return { ...assigned, seats }
}
