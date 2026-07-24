import { useState } from 'react'

function fmtEntryDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function exerciseSummary(ex) {
  const parts = []
  if (ex.sets) parts.push(`${ex.sets} sets`)
  if (ex.reps) parts.push(`× ${ex.reps}`)
  if (ex.weight) parts.push(`@ ${ex.weight}kg`)
  return parts.join(' ')
}

/**
 * Two-step picker layered on top of the session form: first choose a past
 * PT session for this member, then choose which of its exercises to copy
 * into the session currently being built.
 *
 * `history` is the same member-scoped past-sessions list the form already
 * fetches for PR lookups (see SessionFormModal) — passed in as-is, so this
 * needs no fetch of its own. Entries without any exercises are filtered out
 * since there'd be nothing to copy.
 */
export default function CopyExercisesModal({ history, onClose, onCopy }) {
  const [entry, setEntry] = useState(null) // selected source session; null = still on the list step
  const [checked, setChecked] = useState(new Set())

  const withExercises = (history || []).filter((h) => h.exercises?.length > 0)

  function openEntry(h) {
    setEntry(h)
    setChecked(new Set(h.exercises.map((_, i) => i))) // pre-select all — copying the whole session is the common case
  }

  function toggle(i) {
    setChecked((s) => {
      const next = new Set(s)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  function toggleAll() {
    if (!entry) return
    setChecked((s) => (s.size === entry.exercises.length ? new Set() : new Set(entry.exercises.map((_, i) => i))))
  }

  function confirmCopy() {
    if (!entry) return
    const picked = entry.exercises
      .filter((_, i) => checked.has(i))
      .map((ex) => ({
        name: ex.name || '',
        sets: ex.sets ?? '',
        reps: ex.reps ?? '',
        weight: ex.weight ?? '',
        notes: ex.notes ?? '',
        muscleGroup: ex.muscleGroup ?? '',
      }))
    if (picked.length === 0) return
    onCopy(picked)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-black/70">
      <div className="bg-card border border-white/[0.1] rounded-2xl w-full max-w-lg p-6 relative max-h-[85vh] overflow-y-auto flex flex-col">
        <button onClick={onClose} className="absolute text-2xl leading-none top-4 right-5 text-muted hover:text-cream">×</button>

        {!entry ? (
          <>
            <h2 className="pr-6 mb-1 text-lg font-bold">Copy from a previous session</h2>
            <p className="mb-4 text-xs text-muted">Pick a past session, then choose which exercises to bring in.</p>

            {withExercises.length === 0 ? (
              <p className="text-sm text-center text-muted bg-white/[0.02] border border-white/[0.06] rounded-lg px-3 py-6">
                No previous sessions with exercises found for this member yet.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {withExercises.map((h) => (
                  <button
                    key={h._id}
                    type="button"
                    onClick={() => openEntry(h)}
                    className="flex items-center justify-between gap-3 px-4 py-3 text-left transition-all border rounded-lg border-white/10 hover:border-lime/30 hover:bg-white/[0.03]"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{h.title || 'PT Session'}</p>
                      <p className="mt-0.5 text-xs text-muted">{fmtEntryDate(h.date)}</p>
                    </div>
                    <span className="text-xs font-medium shrink-0 text-muted">
                      {h.exercises.length} exercise{h.exercises.length !== 1 ? 's' : ''}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => { setEntry(null); setChecked(new Set()) }}
              className="self-start mb-3 text-xs transition-colors text-muted hover:text-cream"
            >
              ← Choose a different session
            </button>

            <div className="flex items-start justify-between gap-3 pr-6">
              <div>
                <h2 className="text-lg font-bold">{entry.title || 'PT Session'}</h2>
                <p className="mt-0.5 text-xs text-muted">{fmtEntryDate(entry.date)}</p>
              </div>
              <button type="button" onClick={toggleAll} className="text-xs font-semibold shrink-0 text-lime hover:text-lime-dark whitespace-nowrap mt-1">
                {checked.size === entry.exercises.length ? 'Deselect all' : 'Select all'}
              </button>
            </div>

            <div className="flex flex-col gap-1.5 my-4">
              {entry.exercises.map((ex, i) => {
                const summary = exerciseSummary(ex)
                return (
                  <label
                    key={i}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-all ${
                      checked.has(i) ? 'border-lime/30 bg-lime/[0.06]' : 'border-white/[0.06] hover:border-white/15'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked.has(i)}
                      onChange={() => toggle(i)}
                      className="w-4 h-4 shrink-0 accent-lime"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{ex.name}</p>
                      {summary && <p className="mt-0.5 text-xs text-muted">{summary}</p>}
                    </div>
                  </label>
                )
              })}
            </div>

            <div className="flex gap-3 pt-3 mt-auto border-t border-white/[0.06]">
              <button type="button" onClick={onClose} className="flex-1 border border-white/10 text-muted py-2.5 rounded-lg text-sm hover:text-cream transition-all">
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmCopy}
                disabled={checked.size === 0}
                className="flex-[2] bg-lime text-black font-bold py-2.5 rounded-lg text-sm hover:bg-lime-dark transition-all disabled:opacity-50"
              >
                Copy {checked.size} exercise{checked.size !== 1 ? 's' : ''}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
