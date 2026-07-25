// ─────────────────────────────────────────────────────────────────────────
// Personal-record lookup: given a history of past exercise entries (workout
// logs and/or PT sessions — anything with an `exercises: [{name, weight,
// reps}]` shape) and an exercise name, finds the heaviest weight ever
// logged for that exercise (case-insensitive match), plus the reps done at
// that weight.
// ─────────────────────────────────────────────────────────────────────────

export function computePR(history, exerciseName) {
  const target = (exerciseName || '').trim().toLowerCase()
  if (!target || !Array.isArray(history)) return null

  let best = null
  for (const entry of history) {
    const exercises = entry?.exercises
    if (!Array.isArray(exercises)) continue
    for (const ex of exercises) {
      if (!ex?.name || ex.name.trim().toLowerCase() !== target) continue
      const weight = Number(ex.weight)
      if (!Number.isFinite(weight) || weight <= 0) continue
      if (!best || weight > best.weight) {
        best = { weight, reps: ex.reps || null, date: entry.date || entry.createdAt || null }
      }
    }
  }
  return best
}

export function formatPR(pr) {
  if (!pr) return ''
  return `${pr.weight}kg`
}

// ─────────────────────────────────────────────────────────────────────────
// Groups a logged/session exercise list by muscle group for display, in
// the same order as MUSCLE_GROUPS (chest, back, shoulders, ...). Exercises
// with no muscle group tagged sort last. Stable within each group — original
// entry order is preserved for exercises sharing a group.
// ─────────────────────────────────────────────────────────────────────────

export function sortByMuscleGroup(exercises, muscleGroupOrder) {
  if (!Array.isArray(exercises)) return []
  const order = new Map((muscleGroupOrder || []).map((g, i) => [g.key, i]))
  const rank = (ex) => {
    const key = ex?.muscleGroup
    return order.has(key) ? order.get(key) : order.size
  }
  return exercises
    .map((ex, i) => ({ ex, i }))
    .sort((a, b) => rank(a.ex) - rank(b.ex) || a.i - b.i)
    .map(({ ex }) => ex)
}
