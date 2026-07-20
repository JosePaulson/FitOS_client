import { useEffect, useState } from 'react'
import { staffApi, trainerAvailabilityApi } from '../../api/index'
import Select from '../../components/ui/Select'
import { useAuth } from '../../context/AuthContext'

const ROLE_COLORS = {
  owner: 'bg-lime/10 text-lime border-lime/20',
  manager: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
  trainer: 'bg-purple-400/10 text-purple-400 border-purple-400/20',
  receptionist: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
}

export default function Staff() {
  const { user: me } = useAuth()
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formErr, setFormErr] = useState('')
  const [formLoad, setFormLoad] = useState(false)
  const [availabilityFor, setAvailabilityFor] = useState(null)

  async function load() {
    setLoading(true)
    try { const { data } = await staffApi.list(); setStaff(data) }
    catch { /* ignore */ }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function handleAdd(form) {
    setFormErr(''); setFormLoad(true)
    try {
      await staffApi.create(form)
      setShowForm(false); load()
    } catch (err) { setFormErr(err.response?.data?.message || 'Failed to add staff') }
    finally { setFormLoad(false) }
  }

  async function toggleActive(member) {
    if (member._id === me?._id) return
    try { await staffApi.update(member._id, { isActive: !member.isActive }); load() }
    catch { alert('Failed to update') }
  }

  async function changeRole(member, role) {
    try { await staffApi.update(member._id, { role }); load() }
    catch { alert('Failed to change role') }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Staff</h1>
          <p className="text-muted text-sm mt-0.5">{staff.length} team members</p>
        </div>
        {me?.role === 'owner' && (
          <button
            onClick={() => { setShowForm(true); setFormErr('') }}
            className="bg-lime text-black font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-lime-dark transition-all"
          >
            + Add staff
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-card border border-white/[0.08] rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="bg-card border border-white/[0.08] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-left">
                <th className="px-5 py-3 text-xs font-semibold tracking-wider uppercase text-muted">Name</th>
                <th className="px-5 py-3 text-xs font-semibold tracking-wider uppercase text-muted">Email</th>
                <th className="px-5 py-3 text-xs font-semibold tracking-wider uppercase text-muted">Role</th>
                <th className="px-5 py-3 text-xs font-semibold tracking-wider uppercase text-muted">Status</th>
                {me?.role === 'owner' && (
                  <th className="px-5 py-3 text-xs font-semibold tracking-wider uppercase text-muted">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {staff.map((s) => (
                <tr key={s._id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 text-xs font-bold border rounded-full bg-lime/10 border-lime/20 text-lime shrink-0">
                        {s.name?.[0]?.toUpperCase()}
                      </div>
                      <span className="font-medium">
                        {s.name}
                        {s._id === me?._id && <span className="ml-1 text-xs text-muted">(you)</span>}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-muted">{s.email}</td>
                  <td className="px-5 py-3.5">
                    {me?.role === 'owner' && s._id !== me?._id ? (
                      <Select
                        value={s.role}
                        onChange={(val) => changeRole(s, val)}
                        options={[
                          { value: 'manager', label: 'Manager' },
                          { value: 'trainer', label: 'Trainer' },
                          { value: 'receptionist', label: 'Receptionist' },
                        ]}
                        placeholder="Select role"
                      />
                    ) : (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${ROLE_COLORS[s.role] || ''}`}>
                        {s.role}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.isActive ? 'bg-lime/10 text-lime' : 'bg-red-400/10 text-red-400'
                      }`}>
                      {s.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  {me?.role === 'owner' && (
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {['trainer', 'owner'].includes(s.role) && (
                          <button onClick={() => setAvailabilityFor(s)}
                            className="text-xs font-medium text-muted hover:text-cream transition-colors">
                            Availability
                          </button>
                        )}
                        {s._id !== me?._id && (
                          <button
                            onClick={() => toggleActive(s)}
                            className={`text-xs font-medium transition-colors ${s.isActive ? 'text-red-400/70 hover:text-red-400' : 'text-lime hover:text-lime-dark'
                              }`}
                          >
                            {s.isActive ? 'Deactivate' : 'Reactivate'}
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* Add staff modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70">
          <div className="bg-card border border-white/[0.1] rounded-2xl w-full max-w-md p-7">
            <button onClick={() => setShowForm(false)} className="absolute text-2xl leading-none top-4 right-5 text-muted hover:text-cream">×</button>
            <h2 className="mb-5 text-lg font-bold">Add staff member</h2>
            <AddStaffForm error={formErr} loading={formLoad} onSubmit={handleAdd} onClose={() => setShowForm(false)} />
          </div>
        </div>
      )}

      {availabilityFor && (
        <TrainerAvailabilityModal trainer={availabilityFor} onClose={() => setAvailabilityFor(null)} />
      )}
    </div>
  )
}

function AddStaffForm({ error, loading, onSubmit, onClose }) {
  const [form, setForm] = useState({ name: '', email: '', role: 'trainer', password: '' })
  const set = (f) => (e) => setForm((v) => ({ ...v, [f]: e.target.value }))

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form) }} className="flex flex-col gap-4">
      {error && <p className="px-3 py-2 text-sm text-red-400 border rounded-lg bg-red-500/10 border-red-500/20">{error}</p>}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted">Full name *</label>
        <input type="text" value={form.name} onChange={set('name')} className="field-input" placeholder="Trainer Name" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted">Email *</label>
        <input type="email" value={form.email} onChange={set('email')} className="field-input" placeholder="trainer@gym.com" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted">Role *</label>
        <Select
          value={form.role}
          onChange={(val) => setForm((v) => ({ ...v, role: val }))}
          options={[
            { value: 'manager', label: 'Manager' },
            { value: 'trainer', label: 'Trainer' },
            { value: 'receptionist', label: 'Receptionist' },
          ]}
          placeholder="Select role"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted">Temporary password *</label>
        <input type="password" value={form.password} onChange={set('password')} className="field-input" placeholder="Min. 6 characters" />
        <p className="text-xs text-muted">They can change this after first login.</p>
      </div>
      <div className="flex gap-3 mt-1">
        <button type="button" onClick={onClose} className="flex-1 border border-white/10 text-muted py-2.5 rounded-lg text-sm hover:text-cream transition-all">Cancel</button>
        <button type="submit" disabled={loading} className="flex-[2] bg-lime text-black font-bold py-2.5 rounded-lg text-sm hover:bg-lime-dark transition-all disabled:opacity-60">
          {loading ? 'Adding…' : 'Add staff member'}
        </button>
      </div>
    </form>
  )
}

const DAYS = [
  ['monday', 'Mon'], ['tuesday', 'Tue'], ['wednesday', 'Wed'], ['thursday', 'Thu'],
  ['friday', 'Fri'], ['saturday', 'Sat'], ['sunday', 'Sun'],
]

// Ensures every day has a `shifts` array to work with in the UI, even for
// availability docs saved before multi-shift support (which had a single
// start/end per day instead).
function normalizeWeeklyHours(weeklyHours) {
  const out = {}
  for (const [key] of DAYS) {
    const d = weeklyHours?.[key] || {}
    const shifts = Array.isArray(d.shifts) && d.shifts.length > 0
      ? d.shifts
      : (d.start && d.end ? [{ start: d.start, end: d.end }] : [{ start: '06:00', end: '20:00' }])
    out[key] = { isOff: !!d.isOff, shifts }
  }
  return out
}

/** Weekly working hours + specific-day time-off for one trainer — gates what members can book. */
function TrainerAvailabilityModal({ trainer, onClose }) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [weeklyHours, setWeeklyHours] = useState(null)
  const [slotDurationMinutes, setSlotDurationMinutes] = useState(60)

  const [timeOff, setTimeOff] = useState([])
  const [newOffStart, setNewOffStart] = useState('')
  const [newOffEnd, setNewOffEnd] = useState('')
  const [newOffReason, setNewOffReason] = useState('')
  const [addingOff, setAddingOff] = useState(false)

  useEffect(() => {
    Promise.all([
      trainerAvailabilityApi.get(trainer._id),
      trainerAvailabilityApi.timeOff(trainer._id),
    ])
      .then(([availRes, offRes]) => {
        setWeeklyHours(normalizeWeeklyHours(availRes.data.weeklyHours))
        setSlotDurationMinutes(availRes.data.slotDurationMinutes || 60)
        setTimeOff(offRes.data || [])
      })
      .catch(() => setError('Could not load availability'))
      .finally(() => setLoading(false))
  }, [trainer._id])

  function updateDay(day, field, value) {
    setWeeklyHours((v) => ({ ...v, [day]: { ...v[day], [field]: value } }))
  }

  function updateShift(day, index, field, value) {
    setWeeklyHours((v) => {
      const shifts = [...v[day].shifts]
      shifts[index] = { ...shifts[index], [field]: value }
      return { ...v, [day]: { ...v[day], shifts } }
    })
  }
  function addShift(day) {
    setWeeklyHours((v) => ({ ...v, [day]: { ...v[day], shifts: [...v[day].shifts, { start: '17:00', end: '20:00' }] } }))
  }
  function removeShift(day, index) {
    setWeeklyHours((v) => ({ ...v, [day]: { ...v[day], shifts: v[day].shifts.filter((_, i) => i !== index) } }))
  }

  async function save() {
    setSaving(true); setError('')
    try {
      await trainerAvailabilityApi.update(trainer._id, { weeklyHours, slotDurationMinutes: Number(slotDurationMinutes) })
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save availability')
    } finally { setSaving(false) }
  }

  async function addTimeOff() {
    if (!newOffStart) return
    setAddingOff(true)
    try {
      const { data } = await trainerAvailabilityApi.addTimeOff(trainer._id, {
        startDate: newOffStart, endDate: newOffEnd || newOffStart, reason: newOffReason,
      })
      setTimeOff((v) => [data, ...v])
      setNewOffStart(''); setNewOffEnd(''); setNewOffReason('')
    } catch {
      setError('Failed to add time off')
    } finally { setAddingOff(false) }
  }

  async function removeTimeOff(id) {
    try {
      await trainerAvailabilityApi.removeTimeOff(trainer._id, id)
      setTimeOff((v) => v.filter((t) => t._id !== id))
    } catch { alert('Failed to remove') }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70">
      <div className="bg-card border border-white/[0.1] rounded-2xl w-full max-w-lg p-7 relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute text-2xl leading-none top-4 right-5 text-muted hover:text-cream">×</button>
        <h2 className="mb-1 text-lg font-bold">{trainer.name}'s availability</h2>
        <p className="mb-5 text-xs text-muted">Members can only book PT sessions within these hours, and not on days marked unavailable below.</p>

        {loading ? (
          <div className="py-10 text-sm text-center text-muted">Loading…</div>
        ) : (
          <>
            {error && <p className="px-3 py-2 mb-4 text-sm text-red-400 border rounded-lg bg-red-500/10 border-red-500/20">{error}</p>}

            {/* Weekly hours */}
            <div className="flex flex-col gap-3 mb-3">
              {DAYS.map(([key, label]) => {
                const d = weeklyHours[key] || { isOff: false, shifts: [] }
                return (
                  <div key={key} className="pb-3 border-b border-white/[0.06] last:border-0">
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className="text-xs font-semibold text-muted w-[40px]">{label}</span>
                      <label className="flex items-center gap-1.5 text-xs text-muted">
                        <input type="checkbox" checked={!d.isOff} onChange={(e) => updateDay(key, 'isOff', !e.target.checked)} />
                        Open
                      </label>
                      {!d.isOff && (
                        <button onClick={() => addShift(key)} className="text-xs font-semibold text-lime hover:text-lime-dark ml-auto">
                          + Add shift
                        </button>
                      )}
                    </div>
                    {!d.isOff && (
                      <div className="flex flex-col gap-1.5 pl-[52px]">
                        {d.shifts.map((shift, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <input type="time" value={shift.start} onChange={(e) => updateShift(key, i, 'start', e.target.value)}
                              className="field-input flex-1" />
                            <span className="text-xs text-muted">–</span>
                            <input type="time" value={shift.end} onChange={(e) => updateShift(key, i, 'end', e.target.value)}
                              className="field-input flex-1" />
                            {d.shifts.length > 1 && (
                              <button onClick={() => removeShift(key, i)} className="text-xs text-red-400/70 hover:text-red-400 px-1">×</button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="flex items-center gap-3 mb-6">
              <label className="text-xs text-muted">Slot length</label>
              <Select value={String(slotDurationMinutes)} onChange={(v) => setSlotDurationMinutes(v)}
                options={[{ value: '30', label: '30 min' }, { value: '45', label: '45 min' }, { value: '60', label: '60 min' }, { value: '90', label: '90 min' }]} />
              <button onClick={save} disabled={saving}
                className="ml-auto bg-lime text-black font-bold text-sm px-4 py-2 rounded-lg hover:bg-lime-dark transition-all disabled:opacity-60">
                {saving ? 'Saving…' : 'Save hours'}
              </button>
            </div>

            {/* Time off */}
            <h3 className="mb-2 text-sm font-bold">Time off / unavailable days</h3>
            <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 mb-3">
              <input type="date" value={newOffStart} onChange={(e) => setNewOffStart(e.target.value)} className="field-input" placeholder="Start" />
              <input type="date" value={newOffEnd} onChange={(e) => setNewOffEnd(e.target.value)} className="field-input" placeholder="End (optional)" />
              <input type="text" value={newOffReason} onChange={(e) => setNewOffReason(e.target.value)} className="field-input" placeholder="Reason (optional)" />
              <button onClick={addTimeOff} disabled={addingOff || !newOffStart}
                className="px-3 text-sm font-semibold border rounded-lg border-white/10 text-cream hover:border-white/20 disabled:opacity-40">
                + Add
              </button>
            </div>
            <div className="flex flex-col gap-1.5">
              {timeOff.length === 0 && <p className="text-xs text-muted">No time off scheduled.</p>}
              {timeOff.map((t) => (
                <div key={t._id} className="flex items-center justify-between px-3 py-2 text-xs rounded-lg bg-white/[0.03]">
                  <span className="text-cream">
                    {new Date(t.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' })}
                    {t.endDate && t.endDate !== t.startDate && ` – ${new Date(t.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' })}`}
                    {t.reason && <span className="ml-2 text-muted">· {t.reason}</span>}
                  </span>
                  <button onClick={() => removeTimeOff(t._id)} className="text-red-400/70 hover:text-red-400">Remove</button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}