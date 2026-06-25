import { useEffect, useState } from 'react'
import { workoutApi, memberApi } from '../../api/index'

const GOALS = ['general', 'weight-loss', 'muscle-gain', 'endurance', 'flexibility']

export default function WorkoutPlans() {
  const [tab,       setTab]       = useState('workout')  // 'workout' | 'diet'
  const [plans,     setPlans]     = useState([])
  const [loading,   setLoading]   = useState(true)
  const [showForm,  setShowForm]  = useState(false)
  const [editing,   setEditing]   = useState(null)
  const [assigning, setAssigning] = useState(null)
  const [members,   setMembers]   = useState([])
  const [formErr,   setFormErr]   = useState('')
  const [formLoad,  setFormLoad]  = useState(false)

  async function load() {
    setLoading(true)
    try {
      const fn     = tab === 'workout' ? workoutApi.listWorkout : workoutApi.listDiet
      const { data } = await fn({ templates: false })
      setPlans(data)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [tab])
  useEffect(() => {
    memberApi.list({ limit: 200 }).then(({ data }) => setMembers(data.members)).catch(() => {})
  }, [])

  async function handleSave(form) {
    setFormErr(''); setFormLoad(true)
    try {
      if (tab === 'workout') {
        editing ? await workoutApi.updateWorkout(editing._id, form) : await workoutApi.createWorkout(form)
      } else {
        editing ? await workoutApi.updateDiet(editing._id, form) : await workoutApi.createDiet(form)
      }
      setShowForm(false); setEditing(null); load()
    } catch (err) { setFormErr(err.response?.data?.message || 'Failed to save') }
    finally { setFormLoad(false) }
  }

  async function handleAssign(planId, memberIds) {
    try {
      const fn = tab === 'workout' ? workoutApi.assignWorkout : workoutApi.assignDiet
      await fn(planId, memberIds)
      setAssigning(null); load()
    } catch { alert('Assignment failed') }
  }

  async function handleRemove(id) {
    if (!confirm('Remove this plan?')) return
    try {
      tab === 'workout' ? await workoutApi.removeWorkout(id) : await workoutApi.removeDiet(id)
      load()
    } catch { alert('Failed to remove') }
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Workout & Diet Plans</h1>
          <p className="text-muted text-sm mt-0.5">Build templates and assign them to members</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditing(null); setFormErr('') }}
          className="bg-lime text-black font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-lime-dark transition-all"
        >
          + New plan
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-card border border-white/[0.08] rounded-xl p-1 mb-6 w-fit">
        {['workout', 'diet'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              tab === t ? 'bg-lime text-black font-bold' : 'text-muted hover:text-cream'
            }`}
          >
            {t === 'workout' ? '🏋️ Workout' : '🥗 Diet'}
          </button>
        ))}
      </div>

      {/* Plans grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[1,2,3,4].map((i) => <div key={i} className="h-44 bg-card border border-white/[0.08] rounded-xl animate-pulse" />)}
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-20 text-muted text-sm">
          No {tab} plans yet. Create one to assign to members.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {plans.map((plan) => (
            <div key={plan._id} className="bg-card border border-white/[0.08] rounded-xl p-6 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold">{plan.name}</h3>
                  {plan.description && <p className="text-muted text-xs mt-0.5">{plan.description}</p>}
                </div>
                <span className="text-[10px] bg-lime/10 text-lime border border-lime/20 px-2 py-0.5 rounded-full capitalize shrink-0">
                  {plan.goal?.replace('-', ' ')}
                </span>
              </div>

              {/* Meta */}
              <div className="flex flex-wrap gap-3 text-xs text-muted">
                {tab === 'workout' && plan.durationWeeks && (
                  <span>📅 {plan.durationWeeks} weeks</span>
                )}
                {tab === 'workout' && plan.days?.length > 0 && (
                  <span>💪 {plan.days.length} training days</span>
                )}
                {tab === 'diet' && plan.targetCalories && (
                  <span>🔥 {plan.targetCalories} kcal/day</span>
                )}
                {tab === 'diet' && plan.targetProtein && (
                  <span>🥩 {plan.targetProtein}g protein</span>
                )}
              </div>

              {/* Assigned members */}
              {plan.assignedTo?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {plan.assignedTo.slice(0, 4).map((m) => (
                    <span key={m._id || m} className="text-[10px] bg-white/[0.05] border border-white/10 px-2 py-0.5 rounded-full text-muted">
                      {m.name || 'Member'}
                    </span>
                  ))}
                  {plan.assignedTo.length > 4 && (
                    <span className="text-[10px] text-muted px-1">+{plan.assignedTo.length - 4} more</span>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 mt-auto pt-1">
                <button
                  onClick={() => setAssigning(plan)}
                  className="flex-1 text-xs text-lime border border-lime/20 py-1.5 rounded-lg hover:bg-lime/10 transition-all"
                >
                  Assign to member
                </button>
                <button
                  onClick={() => { setEditing(plan); setShowForm(true); setFormErr('') }}
                  className="text-xs text-muted border border-white/10 px-3 py-1.5 rounded-lg hover:text-cream hover:border-white/20 transition-all"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleRemove(plan._id)}
                  className="text-xs text-red-400/60 border border-white/10 px-3 py-1.5 rounded-lg hover:text-red-400 hover:border-red-400/20 transition-all"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / edit modal */}
      {showForm && (
        <Modal title={`${editing ? 'Edit' : 'New'} ${tab} plan`} onClose={() => { setShowForm(false); setEditing(null) }}>
          {tab === 'workout'
            ? <WorkoutForm initial={editing} error={formErr} loading={formLoad} onSubmit={handleSave} onClose={() => { setShowForm(false); setEditing(null) }} />
            : <DietForm    initial={editing} error={formErr} loading={formLoad} onSubmit={handleSave} onClose={() => { setShowForm(false); setEditing(null) }} />
          }
        </Modal>
      )}

      {/* Assign modal */}
      {assigning && (
        <AssignModal
          plan={assigning}
          members={members}
          onAssign={(memberIds) => handleAssign(assigning._id, memberIds)}
          onClose={() => setAssigning(null)}
        />
      )}
    </div>
  )
}

/* ── Sub-components ──────────────────────────────────────────────────────── */

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4 py-8 overflow-y-auto">
      <div className="bg-card border border-white/[0.1] rounded-2xl w-full max-w-lg p-7 relative my-auto">
        <button onClick={onClose} className="absolute top-4 right-5 text-muted hover:text-cream text-2xl leading-none">×</button>
        <h2 className="font-bold text-lg mb-5 capitalize">{title}</h2>
        {children}
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted">{label}</label>
      {children}
    </div>
  )
}

function WorkoutForm({ initial, error, loading, onSubmit, onClose }) {
  const [form, setForm] = useState({
    name:          initial?.name          || '',
    description:   initial?.description   || '',
    goal:          initial?.goal          || 'general',
    durationWeeks: initial?.durationWeeks || 4,
    isTemplate:    initial?.isTemplate    || false,
  })
  const [days, setDays] = useState(initial?.days || [])

  const set = (f) => (e) => setForm((v) => ({ ...v, [f]: e.target.value }))

  function addDay() {
    setDays((d) => [...d, { day: `Day ${d.length + 1}`, focus: '', exercises: [] }])
  }
  function removeDay(i) { setDays((d) => d.filter((_, idx) => idx !== i)) }
  function setDay(i, field, val) {
    setDays((d) => d.map((day, idx) => idx === i ? { ...day, [field]: val } : day))
  }
  function addExercise(dayIdx) {
    setDays((d) => d.map((day, i) => i === dayIdx
      ? { ...day, exercises: [...day.exercises, { name: '', sets: 3, reps: '10', restSec: 60 }] }
      : day
    ))
  }
  function setExercise(dayIdx, exIdx, field, val) {
    setDays((d) => d.map((day, i) => i === dayIdx
      ? { ...day, exercises: day.exercises.map((ex, j) => j === exIdx ? { ...ex, [field]: val } : ex) }
      : day
    ))
  }
  function removeExercise(dayIdx, exIdx) {
    setDays((d) => d.map((day, i) => i === dayIdx
      ? { ...day, exercises: day.exercises.filter((_, j) => j !== exIdx) }
      : day
    ))
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit({ ...form, days }) }} className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto pr-1">
      {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">{error}</p>}

      <Field label="Plan name *">
        <input type="text" value={form.name} onChange={set('name')} className="field-input" placeholder="Push / Pull / Legs" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Goal">
          <select value={form.goal} onChange={set('goal')} className="field-input">
            {GOALS.map((g) => <option key={g} value={g}>{g.replace('-', ' ')}</option>)}
          </select>
        </Field>
        <Field label="Duration (weeks)">
          <input type="number" min="1" value={form.durationWeeks} onChange={set('durationWeeks')} className="field-input" />
        </Field>
      </div>
      <Field label="Description">
        <textarea rows={2} value={form.description} onChange={set('description')} className="field-input resize-none" />
      </Field>

      {/* Training days */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-muted">Training days</label>
          <button type="button" onClick={addDay} className="text-xs text-lime hover:text-lime-dark">+ Add day</button>
        </div>
        {days.map((day, di) => (
          <div key={di} className="bg-black border border-white/[0.06] rounded-xl p-4 mb-3">
            <div className="flex gap-2 mb-3">
              <input value={day.day} onChange={(e) => setDay(di, 'day', e.target.value)}
                className="field-input flex-1 text-xs" placeholder="Day label" />
              <input value={day.focus} onChange={(e) => setDay(di, 'focus', e.target.value)}
                className="field-input flex-1 text-xs" placeholder="Focus (e.g. Chest)" />
              <button type="button" onClick={() => removeDay(di)} className="text-red-400/60 hover:text-red-400 text-lg leading-none px-1">×</button>
            </div>
            {day.exercises.map((ex, ei) => (
              <div key={ei} className="flex gap-2 mb-2 items-center">
                <input value={ex.name} onChange={(e) => setExercise(di, ei, 'name', e.target.value)}
                  className="field-input flex-[2] text-xs" placeholder="Exercise" />
                <input value={ex.sets} onChange={(e) => setExercise(di, ei, 'sets', e.target.value)}
                  className="field-input w-14 text-xs" placeholder="Sets" type="number" min="1" />
                <input value={ex.reps} onChange={(e) => setExercise(di, ei, 'reps', e.target.value)}
                  className="field-input w-16 text-xs" placeholder="Reps" />
                <button type="button" onClick={() => removeExercise(di, ei)} className="text-red-400/50 hover:text-red-400 text-base px-1">×</button>
              </div>
            ))}
            <button type="button" onClick={() => addExercise(di)} className="text-xs text-muted hover:text-lime mt-1">+ Exercise</button>
          </div>
        ))}
      </div>

      <div className="flex gap-3 mt-2 sticky bottom-0 bg-card py-2">
        <button type="button" onClick={onClose} className="flex-1 border border-white/10 text-muted py-2.5 rounded-lg text-sm hover:text-cream transition-all">Cancel</button>
        <button type="submit" disabled={loading} className="flex-[2] bg-lime text-black font-bold py-2.5 rounded-lg text-sm hover:bg-lime-dark transition-all disabled:opacity-60">
          {loading ? 'Saving…' : (initial ? 'Update plan' : 'Create plan')}
        </button>
      </div>
    </form>
  )
}

function DietForm({ initial, error, loading, onSubmit, onClose }) {
  const [form, setForm] = useState({
    name:           initial?.name           || '',
    description:    initial?.description    || '',
    goal:           initial?.goal           || 'general',
    targetCalories: initial?.targetCalories || '',
    targetProtein:  initial?.targetProtein  || '',
    targetCarbs:    initial?.targetCarbs    || '',
    targetFat:      initial?.targetFat      || '',
  })
  const set = (f) => (e) => setForm((v) => ({ ...v, [f]: e.target.value }))

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form) }} className="flex flex-col gap-4">
      {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">{error}</p>}
      <Field label="Plan name *">
        <input type="text" value={form.name} onChange={set('name')} className="field-input" placeholder="High Protein Fat Loss" />
      </Field>
      <Field label="Goal">
        <select value={form.goal} onChange={set('goal')} className="field-input">
          {['general','weight-loss','muscle-gain','maintenance'].map((g) => <option key={g} value={g}>{g.replace('-',' ')}</option>)}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Target calories / day"><input type="number" value={form.targetCalories} onChange={set('targetCalories')} className="field-input" placeholder="2000" /></Field>
        <Field label="Protein (g)"><input type="number" value={form.targetProtein} onChange={set('targetProtein')} className="field-input" placeholder="150" /></Field>
        <Field label="Carbs (g)"><input type="number" value={form.targetCarbs} onChange={set('targetCarbs')} className="field-input" placeholder="200" /></Field>
        <Field label="Fat (g)"><input type="number" value={form.targetFat} onChange={set('targetFat')} className="field-input" placeholder="60" /></Field>
      </div>
      <Field label="Description / notes">
        <textarea rows={3} value={form.description} onChange={set('description')} className="field-input resize-none" placeholder="Meal timing, notes for the member…" />
      </Field>
      <div className="flex gap-3 mt-1">
        <button type="button" onClick={onClose} className="flex-1 border border-white/10 text-muted py-2.5 rounded-lg text-sm hover:text-cream transition-all">Cancel</button>
        <button type="submit" disabled={loading} className="flex-[2] bg-lime text-black font-bold py-2.5 rounded-lg text-sm hover:bg-lime-dark transition-all disabled:opacity-60">
          {loading ? 'Saving…' : (initial ? 'Update plan' : 'Create plan')}
        </button>
      </div>
    </form>
  )
}

function AssignModal({ plan, members, onAssign, onClose }) {
  const [selected, setSelected] = useState(
    new Set((plan.assignedTo || []).map((m) => m._id || m))
  )
  const [search, setSearch] = useState('')

  const filtered = members.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) || m.phone.includes(search)
  )

  function toggle(id) {
    setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
      <div className="bg-card border border-white/[0.1] rounded-2xl w-full max-w-md p-7">
        <button onClick={onClose} className="absolute top-4 right-5 text-muted hover:text-cream text-2xl leading-none">×</button>
        <h2 className="font-bold text-lg mb-1">Assign plan</h2>
        <p className="text-muted text-sm mb-4">{plan.name}</p>

        <input type="text" placeholder="Search member…" value={search} onChange={(e) => setSearch(e.target.value)} className="field-input w-full mb-3" />

        <div className="max-h-52 overflow-y-auto flex flex-col gap-1 mb-5">
          {filtered.map((m) => (
            <button key={m._id} type="button" onClick={() => toggle(m._id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${
                selected.has(m._id) ? 'bg-lime/10 border border-lime/20' : 'hover:bg-white/[0.04] border border-transparent'
              }`}>
              <span className={`w-4 h-4 rounded border flex items-center justify-center text-xs shrink-0 ${
                selected.has(m._id) ? 'bg-lime border-lime text-black font-bold' : 'border-white/20'
              }`}>{selected.has(m._id) ? '✓' : ''}</span>
              <div>
                <div className="text-sm font-medium">{m.name}</div>
                <div className="text-xs text-muted">{m.phone}</div>
              </div>
            </button>
          ))}
          {filtered.length === 0 && <p className="text-muted text-sm text-center py-4">No members found</p>}
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 border border-white/10 text-muted py-2.5 rounded-lg text-sm hover:text-cream transition-all">Cancel</button>
          <button onClick={() => onAssign([...selected])} className="flex-[2] bg-lime text-black font-bold py-2.5 rounded-lg text-sm hover:bg-lime-dark transition-all">
            Assign to {selected.size} member{selected.size !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  )
}
