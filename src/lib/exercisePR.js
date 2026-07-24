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
  return pr.reps ? `${pr.weight}kg × ${pr.reps}` : `${pr.weight}kg`
}
