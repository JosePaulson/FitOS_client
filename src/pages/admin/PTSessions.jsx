import { useEffect, useState, useCallback } from 'react'
import { ptApi, memberApi, staffApi } from '../../api/index'
import Select from '../../components/ui/Select'
import { useAuth } from '../../context/AuthContext'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

const STATUS_STYLES = {
  scheduled: 'bg-blue-400/10 text-blue-400',
  completed: 'bg-lime/10 text-lime',
  missed: 'bg-red-400/10 text-red-400',
  cancelled: 'bg-white/5 text-muted',
}
const STATUS_OPTIONS = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'completed', label: 'Completed' },
  { value: 'missed', label: 'Missed' },
  { value: 'cancelled', label: 'Cancelled' },
]

function fmt(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
function fmtISO(d) {
  if (!d) return ''
  return new Date(d).toISOString().split('T')[0]
}

export default function PTSessions() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  // Filters
  const [filterMember, setFilterMember] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  // Members + staff lists for selects
  const [members, setMembers] = useState([])
  const [trainers, setTrainers] = useState([])

  // Modals
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)   // session being edited
  const [weightTarget, setWeightTarget] = useState(null) // session for weight log
  const [detail, setDetail] = useState(null)   // session detail view
  const [progTarget, setProgTarget] = useState(null)   // member for progress chart
  const [progData, setProgData] = useState([])

  const LIMIT = 15
  const isTrainer = user?.role === 'trainer'

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: LIMIT }
      if (filterMember) params.memberId = filterMember
      if (filterStatus) params.status = filterStatus
      const { data } = await ptApi.list(params)
      setSessions(data.sessions)
      setTotal(data.total)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [page, filterMember, filterStatus])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    memberApi.list({ limit: 100 }).then(({ data }) => setMembers(data.members || [])).catch(() => { })
    if (!isTrainer) {
      staffApi.list().then(({ data }) => {
        setTrainers((data.length ? data : []).filter((s) => s.role === 'trainer' || s.role === 'owner'))
      }).catch(() => { })
    }
  }, [])

  async function openProgress(memberId, memberName) {
    setProgTarget(memberName)
    const { data } = await ptApi.progress(memberId)
    setProgData(data)
  }

  const memberOptions = members.map((m) => ({ value: m._id, label: `${m.name} (${m.phone})` }))
  const trainerOptions = trainers.map((t) => ({ value: t._id, label: t.name }))

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">PT Sessions</h1>
          <p className="text-muted text-sm mt-0.5">{total} session{total !== 1 ? 's' : ''} · schedule, track workouts and body weight</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true) }}
          className="bg-lime text-black font-bold px-5 py-2.5 rounded-lg text-sm hover:bg-lime-dark transition-all">
          + Schedule session
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <Select
          value={filterMember}
          onChange={(v) => { setFilterMember(v); setPage(1) }}
          options={memberOptions}
          placeholder="All members"
          isClearable
          className="w-56"
        />
        <Select
          value={filterStatus}
          onChange={(v) => { setFilterStatus(v); setPage(1) }}
          options={STATUS_OPTIONS}
          placeholder="All statuses"
          isClearable
          className="w-44"
        />
      </div>

      {/* Table */}
      <div className="bg-card border border-white/[0.08] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-left">
                {['Date', 'Member', 'Trainer', 'Session', 'Body weight', 'Status', 'Ack.', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs font-semibold tracking-wider uppercase text-muted whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 8 }).map((_, j) => (
                    <td key={j} className="px-4 py-4"><div className="h-4 bg-white/[0.05] rounded animate-pulse" /></td>
                  ))}</tr>
                ))
              ) : sessions.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-sm text-center text-muted">
                  No PT sessions found. Schedule one using the button above.
                </td></tr>
              ) : sessions.map((s) => (
                <tr key={s._id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="text-sm font-medium">{fmt(s.date)}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="text-sm font-medium">{s.memberId?.name}</div>
                    <div className="text-xs text-muted">{s.memberId?.phone}</div>
                  </td>
                  <td className="px-4 py-3.5 text-muted text-xs">{s.trainerId?.name || '—'}</td>
                  <td className="px-4 py-3.5">
                    <div className="text-sm font-medium">{s.title || 'PT Session'}</div>
                    {s.exercises?.length > 0 && <div className="text-xs text-muted mt-0.5">{s.exercises.length} exercises</div>}
                  </td>
                  <td className="px-4 py-3.5">
                    {s.bodyWeight ? (
                      <div>
                        <span className="font-semibold">{s.bodyWeight} kg</span>
                        {s.bodyFat && <span className="ml-1 text-xs text-muted">· {s.bodyFat}% fat</span>}
                      </div>
                    ) : (
                      <button onClick={() => setWeightTarget(s)}
                        className="px-2 py-1 text-xs transition-all border rounded-lg text-muted hover:text-cream border-white/10 hover:border-lime/30">
                        + Log
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[s.status] || ''}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    {s.acknowledgedByMember
                      ? <span className="text-xs text-lime">✓ {fmt(s.acknowledgedAt)}</span>
                      : <span className="text-xs text-muted">Pending</span>
                    }
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <button onClick={() => setDetail(s)}
                        className="text-xs transition-colors text-muted hover:text-cream">View</button>
                      {!s.acknowledgedByMember && <button onClick={() => { setEditing(s); setShowForm(true) }}
                        className="text-xs transition-colors text-lime hover:text-lime-dark">Edit</button>}
                      <button onClick={() => openProgress(s.memberId?._id, s.memberId?.name)}
                        className="text-xs text-blue-400 transition-colors hover:text-blue-300">Progress</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {total > LIMIT && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.06]">
            <span className="text-xs text-muted">{(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}
                className="text-xs px-3 py-1.5 border border-white/10 rounded-lg text-muted disabled:opacity-40 hover:text-cream transition-all">← Prev</button>
              <button disabled={page * LIMIT >= total} onClick={() => setPage((p) => p + 1)}
                className="text-xs px-3 py-1.5 border border-white/10 rounded-lg text-muted disabled:opacity-40 hover:text-cream transition-all">Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showForm && (
        <SessionFormModal
          session={editing}
          memberOptions={memberOptions}
          trainerOptions={trainerOptions}
          isTrainer={isTrainer}
          userId={user?._id}
          onClose={() => { setShowForm(false); setEditing(null) }}
          onSaved={() => { setShowForm(false); setEditing(null); load() }}
        />
      )}
      {weightTarget && (
        <WeightModal
          session={weightTarget}
          onClose={() => setWeightTarget(null)}
          onSaved={() => { setWeightTarget(null); load() }}
        />
      )}
      {detail && <DetailModal session={detail} onClose={() => setDetail(null)} />}
      {progTarget && (
        <ProgressModal name={progTarget} data={progData} onClose={() => { setProgTarget(null); setProgData([]) }} />
      )}
    </div>
  )
}

/* ── Session form modal ──────────────────────────────────────────────────── */

function SessionFormModal({ session, memberOptions, trainerOptions, isTrainer, userId, onClose, onSaved }) {
  const [form, setForm] = useState({
    memberId: session?.memberId?._id || '',
    trainerId: session?.trainerId?._id || '',
    date: session?.date ? new Date(session.date) : new Date(),
    title: session?.title || '',
    notes: session?.notes || '',
    status: session?.status || 'scheduled',
    bodyWeight: session?.bodyWeight || '',
    bodyFat: session?.bodyFat || '',
    exercises: session?.exercises || [],
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (f) => (e) => setForm((v) => ({ ...v, [f]: e.target.value }))
  const setVal = (f) => (v) => setForm((prev) => ({ ...prev, [f]: v }))

  function addExercise() {
    setForm((v) => ({ ...v, exercises: [...v.exercises, { name: '', sets: '', reps: '', weight: '', notes: '' }] }))
  }

  function updateExercise(i, field, val) {
    setForm((v) => {
      const ex = [...v.exercises]
      ex[i] = { ...ex[i], [field]: val }
      return { ...v, exercises: ex }
    })
  }

  function removeExercise(i) {
    setForm((v) => ({ ...v, exercises: v.exercises.filter((_, idx) => idx !== i) }))
  }

  async function save() {
    setError('')
    setSaving(true)
    try {
      const payload = {
        ...form,
        date: form.date ? new Date(form.date).toISOString() : '',
        exercises: form.exercises.filter((e) => e.name.trim()),
        bodyWeight: form.bodyWeight ? Number(form.bodyWeight) : undefined,
        bodyFat: form.bodyFat ? Number(form.bodyFat) : undefined,
      }
      if (isTrainer) payload.trainerId = userId
      if (session) await ptApi.update(session._id, payload)
      else await ptApi.create(payload)
      onSaved()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title={session ? 'Edit session' : 'Schedule PT session'} onClose={onClose} wide>
      <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto pr-1">
        {error && <p className="px-3 py-2 text-sm text-red-400 border rounded-lg bg-red-500/10 border-red-500/20">{error}</p>}

        <div className="grid grid-cols-2 gap-3">
          <Field label="Member *">
            <Select value={form.memberId} onChange={setVal('memberId')} options={memberOptions} placeholder="Select member" />
          </Field>
          {!isTrainer && (
            <Field label="Trainer">
              <Select value={form.trainerId} onChange={setVal('trainerId')} options={trainerOptions} placeholder="Select trainer" isClearable />
            </Field>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Date *">
            <DatePicker
              selected={form.date}
              onChange={(date) => setForm((prev) => ({ ...prev, date }))}
              dateFormat="dd/MM/yyyy"
              placeholderText="DD/MM/YYYY"
              className="field-input"
            />
          </Field>
          <Field label="Status">
            <Select
              value={form.status}
              onChange={setVal('status')}
              options={[
                { value: 'scheduled', label: 'Scheduled' },
                { value: 'completed', label: 'Completed' },
                { value: 'missed', label: 'Missed' },
                { value: 'cancelled', label: 'Cancelled' },
              ]}
            />
          </Field>
        </div>

        <Field label="Session title / focus">
          <input type="text" value={form.title} onChange={set('title')} className="field-input" placeholder="e.g. Upper body strength" />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Body weight (kg)">
            <input type="number" value={form.bodyWeight} onChange={set('bodyWeight')} className="field-input" placeholder="72.5" step="0.1" />
          </Field>
          <Field label="Body fat % (optional)">
            <input type="number" value={form.bodyFat} onChange={set('bodyFat')} className="field-input" placeholder="18" step="0.1" />
          </Field>
        </div>

        <Field label="Session notes">
          <textarea rows={2} value={form.notes} onChange={set('notes')} className="resize-none field-input" placeholder="Observations, member feedback, intensity…" />
        </Field>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-muted">Exercises</label>
            <button
              type="button"
              onClick={addExercise}
              className="text-xs transition-colors text-lime hover:text-lime-dark"
            >
              + Add exercise
            </button>
          </div>

          {form.exercises.length === 0 && (
            <p className="text-xs text-muted bg-white/[0.02] border border-white/[0.06] rounded-lg px-3 py-2">
              No exercises added — click "+ Add exercise" to build the session programme
            </p>
          )}

          {form.exercises.map((ex, i) => (
            <div key={i} className="flex gap-2 items-start mb-2 p-3 bg-white/[0.02] border border-white/[0.06] rounded-lg">
              <div className="grid flex-1 grid-cols-2 gap-2">
                <input
                  placeholder="Exercise name"
                  value={ex.name}
                  onChange={(e) => updateExercise(i, 'name', e.target.value)}
                  className="col-span-2 text-xs field-input"
                />
                <input
                  placeholder="Sets"
                  type="number"
                  value={ex.sets}
                  onChange={(e) => updateExercise(i, 'sets', e.target.value)}
                  className="text-xs field-input"
                />
                <input
                  placeholder="Reps"
                  value={ex.reps}
                  onChange={(e) => updateExercise(i, 'reps', e.target.value)}
                  className="text-xs field-input"
                />
                <input
                  placeholder="Weight (kg)"
                  type="number"
                  value={ex.weight}
                  onChange={(e) => updateExercise(i, 'weight', e.target.value)}
                  className="text-xs field-input"
                />
                <input
                  placeholder="Notes"
                  value={ex.notes}
                  onChange={(e) => updateExercise(i, 'notes', e.target.value)}
                  className="text-xs field-input"
                />
              </div>
              <button onClick={() => removeExercise(i)} className="text-muted hover:text-red-400 text-lg leading-none mt-0.5 transition-colors">
                ×
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-3 pt-2 border-t border-white/[0.06]">
          <button onClick={onClose} className="flex-1 border border-white/10 text-muted py-2.5 rounded-lg text-sm hover:text-cream transition-all">
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="flex-[2] bg-lime text-black font-bold py-2.5 rounded-lg text-sm hover:bg-lime-dark transition-all disabled:opacity-60"
          >
            {saving ? 'Saving…' : session ? 'Update session' : 'Schedule session'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

/* ── Weight log modal ────────────────────────────────────────────────────── */
function WeightModal({ session, onClose, onSaved }) {
  const [weight, setWeight] = useState('')
  const [fat, setFat] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function save() {
    if (!weight) { setError('Enter body weight'); return }
    setSaving(true)
    try {
      await ptApi.logWeight(session._id, { bodyWeight: Number(weight), bodyFat: fat ? Number(fat) : undefined })
      onSaved()
    } catch (err) { setError(err.response?.data?.message || 'Failed to save') }
    finally { setSaving(false) }
  }

  return (
    <Modal title="Log body weight" onClose={onClose}>
      <p className="mb-5 text-sm text-muted">
        Recording for <span className="font-medium text-cream">{session.memberId?.name}</span> · {fmt(session.date)}
      </p>
      {error && <p className="px-3 py-2 mb-4 text-xs text-red-400 border rounded-lg bg-red-500/10 border-red-500/20">{error}</p>}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Field label="Body weight (kg) *">
          <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)}
            className="field-input" placeholder="72.5" step="0.1" autoFocus />
        </Field>
        <Field label="Body fat % (optional)">
          <input type="number" value={fat} onChange={(e) => setFat(e.target.value)}
            className="field-input" placeholder="18" step="0.1" />
        </Field>
      </div>
      <div className="flex gap-3">
        <button onClick={onClose} className="flex-1 border border-white/10 text-muted py-2.5 rounded-lg text-sm hover:text-cream transition-all">Cancel</button>
        <button onClick={save} disabled={saving}
          className="flex-[2] bg-lime text-black font-bold py-2.5 rounded-lg text-sm disabled:opacity-60 transition-all">
          {saving ? 'Saving…' : 'Save weight'}
        </button>
      </div>
    </Modal>
  )
}

/* ── Session detail modal ────────────────────────────────────────────────── */
function DetailModal({ session: s, onClose }) {
  return (
    <Modal title="Session details" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold">{s.title || 'PT Session'}</p>
            <p className="text-sm text-muted">{s.memberId?.name} · {fmt(s.date)}</p>
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[s.status] || ''}`}>{s.status}</span>
        </div>

        {(s.bodyWeight || s.bodyFat) && (
          <div className="flex gap-6 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3">
            {s.bodyWeight && <div><p className="text-xs text-muted">Body weight</p><p className="text-xl font-bold">{s.bodyWeight} kg</p></div>}
            {s.bodyFat && <div><p className="text-xs text-muted">Body fat</p><p className="text-xl font-bold">{s.bodyFat}%</p></div>}
          </div>
        )}

        {s.exercises?.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold tracking-wider uppercase text-muted">Exercises</p>
            <div className="flex flex-col gap-1.5">
              {s.exercises.map((ex, i) => (
                <div key={i} className="flex items-center justify-between bg-white/[0.02] border border-white/[0.06] rounded-lg px-3 py-2">
                  <span className="text-sm font-medium">{ex.name}</span>
                  <div className="flex gap-3 text-xs text-muted">
                    {ex.sets && <span>{ex.sets} sets</span>}
                    {ex.reps && <span>× {ex.reps}</span>}
                    {ex.weight && <span>@ {ex.weight}kg</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {s.notes && (
          <div>
            <p className="mb-1 text-xs font-semibold tracking-wider uppercase text-muted">Notes</p>
            <p className="text-sm text-cream/80">{s.notes}</p>
          </div>
        )}

        <div className="flex gap-4 text-xs text-muted pt-2 border-t border-white/[0.06]">
          <span>Trainer: {s.trainerId?.name || '—'}</span>
          <span>Member ack.: {s.acknowledgedByMember ? `✓ ${fmt(s.acknowledgedAt)}` : 'Pending'}</span>
        </div>

        <button onClick={onClose}
          className="w-full border border-white/10 text-muted py-2.5 rounded-lg text-sm hover:text-cream transition-all mt-1">
          Close
        </button>
      </div>
    </Modal>
  )
}

/* ── Progress chart modal ────────────────────────────────────────────────── */
function ProgressModal({ name, data, onClose }) {
  const max = data.length ? Math.max(...data.map((d) => d.bodyWeight)) : 100
  const min = data.length ? Math.min(...data.map((d) => d.bodyWeight)) : 60
  const range = max - min || 1

  return (
    <Modal title={`Body weight progress — ${name}`} onClose={onClose} wide>
      {data.length === 0 ? (
        <p className="py-6 text-sm text-center text-muted">No body weight data recorded for this member yet.</p>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="flex items-end h-40 gap-2 px-2">
            {data.map((d, i) => {
              const pct = ((d.bodyWeight - min) / range) * 100
              const barH = Math.max(12, Math.round((pct / 100) * 120))
              return (
                <div key={i} className="flex flex-col items-center flex-1 gap-1">
                  <span className="text-[10px] text-lime font-semibold">{d.bodyWeight}</span>
                  <div className="w-full rounded-t bg-lime/30" style={{ height: barH }} />
                  <span className="text-[9px] text-muted" style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)', maxHeight: 40, overflow: 'hidden' }}>
                    {new Date(d.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="flex gap-6 text-sm">
            <div><p className="text-xs text-muted">Starting weight</p><p className="font-bold">{data[0].bodyWeight} kg</p></div>
            <div><p className="text-xs text-muted">Latest weight</p><p className="font-bold">{data.at(-1).bodyWeight} kg</p></div>
            <div>
              <p className="text-xs text-muted">Change</p>
              <p className={`font-bold ${data.at(-1).bodyWeight < data[0].bodyWeight ? 'text-lime' : 'text-red-400'}`}>
                {(data.at(-1).bodyWeight - data[0].bodyWeight > 0 ? '+' : '')}{(data.at(-1).bodyWeight - data[0].bodyWeight).toFixed(1)} kg
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-1 overflow-y-auto max-h-40">
            {[...data].reverse().map((d, i) => (
              <div key={i} className="flex justify-between text-xs py-1.5 border-b border-white/[0.04]">
                <span className="text-muted">{fmt(d.date)}</span>
                <span className="font-semibold">{d.bodyWeight} kg{d.bodyFat ? ` · ${d.bodyFat}% fat` : ''}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <button onClick={onClose} className="w-full border border-white/10 text-muted py-2.5 rounded-lg text-sm hover:text-cream transition-all mt-4">Close</button>
    </Modal>
  )
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function Modal({ title, children, onClose, wide }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70">
      <div className={`bg-card border border-white/[0.1] rounded-2xl w-full ${wide ? 'max-w-2xl' : 'max-w-md'} p-7 max-h-[90vh] overflow-y-auto relative`}>
        <button onClick={onClose} className="absolute text-2xl leading-none top-4 right-5 text-muted hover:text-cream">×</button>
        <h2 className="mb-5 text-lg font-bold">{title}</h2>
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
