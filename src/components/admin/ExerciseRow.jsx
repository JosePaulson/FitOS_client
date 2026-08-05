import { useEffect, useMemo, useRef, useState } from 'react'
import { useExerciseCatalog } from '../../hooks/useExerciseCatalog'
import { getCustomExercises, addCustomExercise, getAllCustomExercises } from '../../lib/customExercises'
import { computePR, formatPR } from '../../lib/exercisePR'

/**
 * One exercise entry in a PT session — muscle group chips, a name field
 * with catalog + custom-history suggestions (each tagged with this
 * member's PR when one exists), and the usual sets/reps/weight/notes
 * inputs. `history` is the member's past PT sessions, used to look up PRs.
 * `dragHandleProps`, if given, is spread onto a small grip icon rendered
 * inside this row's own top-left corner, to the left of the muscle group
 * chips — so the whole draggable row is visually self-contained.
 */
export default function ExerciseRow({ exercise, onChange, onRemove, history, dragHandleProps }) {
  const { muscleGroups: MUSCLE_GROUPS, catalog: EXERCISE_CATALOG } = useExerciseCatalog()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(exercise.name || '')
  const wrapRef = useRef(null)

  useEffect(() => { setQuery(exercise.name || '') }, [exercise.name])

  useEffect(() => {
    function onDocClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const suggestions = useMemo(() => {
    const group = exercise.muscleGroup
    const base = group
      ? [...(EXERCISE_CATALOG[group] || []), ...getCustomExercises(group)]
      : [...Object.values(EXERCISE_CATALOG).flat(), ...getAllCustomExercises()]
    const q = query.trim().toLowerCase()
    const filtered = q ? base.filter((n) => n.toLowerCase().includes(q)) : base
    return [...new Set(filtered)].slice(0, 16)
  }, [exercise.muscleGroup, query])

  function pickGroup(key) {
    onChange('muscleGroup', exercise.muscleGroup === key ? '' : key)
  }

  function selectSuggestion(name) {
    onChange('name', name)
    setQuery(name)
    setOpen(false)
  }

  function commitTyped() {
    const trimmed = query.trim()
    onChange('name', trimmed)
    if (!trimmed) return
    const group = exercise.muscleGroup
    const catalogHit = group && (EXERCISE_CATALOG[group] || []).some((n) => n.toLowerCase() === trimmed.toLowerCase())
    const customHit = getCustomExercises(group).some((n) => n.toLowerCase() === trimmed.toLowerCase())
    if (!catalogHit && !customHit) addCustomExercise(group, trimmed)
  }

  const pr = computePR(history, exercise.name)

  return (
    <div className="flex gap-2 items-start p-3 bg-white/[0.02] border border-white/[0.06] rounded-lg">
      <div className="flex-1 min-w-0">
        {/* Drag handle (if draggable) + muscle group chips, in one row */}
        <div className="flex items-center gap-1.5 pb-2">
          {dragHandleProps && (
            <span
              {...dragHandleProps}
              aria-label="Drag to reorder"
              title="Drag to reorder"
              className="flex items-center justify-center shrink-0 select-none rounded-md -m-1.5 p-1.5 text-lg leading-none transition-colors text-muted hover:text-cream hover:bg-white/10 active:bg-white/15"
              style={{ ...dragHandleProps.style, WebkitUserSelect: 'none', touchAction: 'none' }}
            >
              ⠿
            </span>
          )}
          <div className="flex gap-1.5 -mx-1 px-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {MUSCLE_GROUPS.map((g) => {
              const active = exercise.muscleGroup === g.key
              return (
                <button
                  key={g.key} type="button"
                  onClick={() => pickGroup(g.key)}
                  className={`px-2.5 py-1 text-[10px] font-semibold rounded-full whitespace-nowrap shrink-0 transition-all ${
                    active ? 'bg-lime text-black' : 'bg-white/[0.05] text-muted hover:text-cream'
                  }`}
                >
                  {g.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Name field + suggestions */}
        <div ref={wrapRef} className="relative">
          <div className="flex items-center gap-2">
            <input
              placeholder="Exercise name"
              value={query}
              onFocus={() => setOpen(true)}
              onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
              onBlur={commitTyped}
              className="flex-1 text-xs field-input"
            />
            {pr && (
              <span
                className="shrink-0 text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap bg-amber-400/10 text-amber-400 border border-amber-400/25"
                title="This member's personal record for this exercise"
              >
                {formatPR(pr)}
              </span>
            )}
          </div>

          {open && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 z-10 mt-1 overflow-y-auto rounded-lg shadow-lg max-h-56 bg-card border border-white/10">
              {!exercise.muscleGroup && (
                <p className="px-3 pt-2 pb-1 text-[10px] text-muted">
                  Tip: pick a muscle group above to narrow these down
                </p>
              )}
              {suggestions.map((name) => {
                const sPr = computePR(history, name)
                return (
                  <button
                    key={name} type="button"
                    onMouseDown={(e) => { e.preventDefault(); selectSuggestion(name) }}
                    className="flex items-center justify-between w-full gap-2 px-3 py-2 text-xs text-left transition-colors text-cream hover:bg-white/[0.05]"
                  >
                    <span>{name}</span>
                    {sPr && <span className="text-[10px] shrink-0 text-amber-400">{formatPR(sPr)}</span>}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 mt-2">
          <input placeholder="Sets" type="number" value={exercise.sets} onChange={(e) => onChange('sets', e.target.value)} className="text-xs field-input" />
          <input placeholder="Reps" value={exercise.reps} onChange={(e) => onChange('reps', e.target.value)} className="text-xs field-input" />
          <input placeholder="Weight (kg)" type="number" value={exercise.weight} onChange={(e) => onChange('weight', e.target.value)} className="text-xs field-input" />
          <input placeholder="Notes" value={exercise.notes} onChange={(e) => onChange('notes', e.target.value)} className="text-xs field-input" />
        </div>
      </div>

      <button type="button" onClick={onRemove} className="text-muted hover:text-red-400 text-lg leading-none mt-0.5 transition-colors">×</button>
    </div>
  )
}
