import { useEffect, useState, useCallback, useMemo } from 'react'
import { timetableApi, staffApi, memberPTPlanApi } from '../../api/index'
import Select from '../../components/ui/Select'
import { useAuth } from '../../context/AuthContext'

const WEEKDAYS = [
  { key: 'monday', label: 'Mon' },
  { key: 'tuesday', label: 'Tue' },
  { key: 'wednesday', label: 'Wed' },
  { key: 'thursday', label: 'Thu' },
  { key: 'friday', label: 'Fri' },
  { key: 'saturday', label: 'Sat' },
  { key: 'sunday', label: 'Sun' },
]

function cap(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s
}

export default function Timetable() {
  const { user } = useAuth()
  const isTrainer = user?.role === 'trainer'

  const [trainers, setTrainers] = useState([])
  const [trainerId, setTrainerId] = useState(isTrainer ? user._id : '')
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  const [activePlans, setActivePlans] = useState([]) // MemberPTPlan[], for the assign modal's member picker
  const [assignTarget, setAssignTarget] = useState(null) // slot being assigned
  const [declineTarget, setDeclineTarget] = useState(null) // slot whose request is being declined
  const [deleteTarget, setDeleteTarget] = useState(null) // slot pending delete confirmation
  const [buildConfirmOpen, setBuildConfirmOpen] = useState(false)
  const [addSlotsOpen, setAddSlotsOpen] = useState(false)
  const [busyId, setBusyId] = useState(null)

  useEffect(() => {
    if (!isTrainer) {
      staffApi.list().then(({ data }) => {
        setTrainers((data || []).filter((s) => s.role === 'trainer'))
      }).catch(() => {})
    }
  }, [isTrainer])

  const load = useCallback(async () => {
    if (!trainerId) { setSlots([]); setLoading(false); return }
    setLoading(true)
    setError('')
    try {
      const [{ data: slotData }, { data: planData }] = await Promise.all([
        timetableApi.list({ trainerId }),
        memberPTPlanApi.list({ status: 'active' }),
      ])
      setSlots(slotData || [])
      setActivePlans((planData || []).filter((p) => String(p.trainerId?._id || p.trainerId) === String(trainerId)))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load timetable')
    } finally {
      setLoading(false)
    }
  }, [trainerId])

  useEffect(() => { load() }, [load])

  async function buildTimetable() {
    setBuildConfirmOpen(false)
    setGenerating(true)
    setError('')
    try {
      const { data } = await timetableApi.generate(trainerId)
      setSlots(data.slots || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to build timetable')
    } finally {
      setGenerating(false)
    }
  }

  async function deleteSlot(slot) {
    setBusyId(slot._id)
    setError('')
    try {
      await timetableApi.remove(slot._id)
      setSlots((prev) => prev.filter((s) => s._id !== slot._id))
      setDeleteTarget(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete slot')
    } finally {
      setBusyId(null)
    }
  }

  async function emptySlot(slot) {
    setBusyId(slot._id)
    setError('')
    try {
      const { data } = await timetableApi.empty(slot._id)
      setSlots((prev) => prev.map((s) => (s._id === data._id ? data : s)))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to clear slot')
    } finally {
      setBusyId(null)
    }
  }

  async function approveRequest(slot) {
    setBusyId(slot._id)
    setError('')
    try {
      const { data } = await timetableApi.approveRequest(slot._id)
      setSlots((prev) => prev.map((s) => (s._id === data._id ? data : s)))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve request')
    } finally {
      setBusyId(null)
    }
  }

  async function declineRequest(slot, reason) {
    setBusyId(slot._id)
    setError('')
    try {
      const { data } = await timetableApi.declineRequest(slot._id, reason)
      setSlots((prev) => prev.map((s) => (s._id === data._id ? data : s)))
      setDeclineTarget(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to decline request')
    } finally {
      setBusyId(null)
    }
  }

  // Rows = every distinct start time this trainer has slots at, so the
  // grid lines up like a real timetable even though different days can
  // have different working windows.
  const times = useMemo(
    () => [...new Set(slots.map((s) => s.startTime))].sort(),
    [slots]
  )
  const grid = useMemo(() => {
    const g = {}
    slots.forEach((s) => {
      g[s.startTime] = g[s.startTime] || {}
      g[s.startTime][s.weekday] = s
    })
    return g
  }, [slots])

  const pendingCount = slots.filter((s) => s.pendingRequest?.memberId).length

  const trainerOptions = trainers.map((t) => ({ value: t._id, label: t.name }))

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Timetable</h1>
          <p className="text-muted text-sm mt-0.5">Standing weekly PT slots — one hour each, built from working hours</p>
        </div>
        <div className="flex items-center gap-3">
          {!isTrainer && (
            <Select
              value={trainerId}
              onChange={setTrainerId}
              options={trainerOptions}
              placeholder="Select trainer"
              className="w-56"
            />
          )}
          {trainerId && (
            <>
              <button onClick={() => setAddSlotsOpen(true)}
                className="border border-white/10 text-cream font-semibold px-5 py-2.5 rounded-lg text-sm hover:bg-white/[0.04] transition-all whitespace-nowrap">
                + Add slot(s)
              </button>
              <button onClick={() => setBuildConfirmOpen(true)} disabled={generating}
                className="bg-lime text-black font-bold px-5 py-2.5 rounded-lg text-sm hover:bg-lime-dark transition-all disabled:opacity-60 whitespace-nowrap">
                {generating ? 'Building…' : '↻ Build from working hours'}
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 mb-4 text-sm text-red-400 border rounded-lg bg-red-500/10 border-red-500/20">
          {error}
        </div>
      )}

      {!trainerId && !isTrainer && (
        <div className="bg-card border border-white/[0.08] rounded-xl p-8 text-center text-muted text-sm">
          Select a trainer above to view or build their timetable.
        </div>
      )}

      {trainerId && loading && (
        <div className="bg-card border border-white/[0.08] rounded-xl p-8 text-center text-muted text-sm">Loading…</div>
      )}

      {trainerId && !loading && (
        <>
          {/* Pending requests */}
          {pendingCount > 0 && (
            <div className="bg-amber-400/[0.06] border border-amber-400/20 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg text-amber-400">🙋</span>
                <h2 className="text-sm font-bold">
                  {pendingCount} slot request{pendingCount !== 1 ? 's' : ''} awaiting a decision
                </h2>
              </div>
              <div className="flex flex-col gap-2">
                {slots.filter((s) => s.pendingRequest?.memberId).map((s) => (
                  <div key={s._id} className="flex items-center justify-between gap-3 bg-black/20 border border-white/[0.06] rounded-lg px-3.5 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">
                        {s.pendingRequest.memberId?.name}
                        <span className="font-normal text-muted"> · {cap(s.weekday)} {s.startTime}–{s.endTime}</span>
                      </p>
                      {s.pendingRequest.memberPTPlanId?.name && (
                        <p className="text-xs text-muted mt-0.5">{s.pendingRequest.memberPTPlanId.name}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => approveRequest(s)} disabled={busyId === s._id}
                        className="text-xs font-semibold bg-lime text-black px-3 py-1.5 rounded-lg hover:bg-lime-dark transition-all disabled:opacity-60">
                        Approve
                      </button>
                      <button onClick={() => setDeclineTarget(s)} disabled={busyId === s._id}
                        className="text-xs font-semibold text-red-400 border border-red-400/30 px-3 py-1.5 rounded-lg hover:bg-red-400/10 transition-all">
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {slots.length === 0 ? (
            <div className="bg-card border border-white/[0.08] rounded-xl p-10 text-center">
              <p className="text-muted text-sm mb-4">No timetable yet for this trainer.</p>
              <div className="flex items-center justify-center gap-3">
                <button onClick={() => setAddSlotsOpen(true)}
                  className="border border-white/10 text-cream font-semibold px-5 py-2.5 rounded-lg text-sm hover:bg-white/[0.04] transition-all">
                  + Add slot(s) manually
                </button>
                <button onClick={() => setBuildConfirmOpen(true)} disabled={generating}
                  className="bg-lime text-black font-bold px-5 py-2.5 rounded-lg text-sm hover:bg-lime-dark transition-all disabled:opacity-60">
                  {generating ? 'Building…' : 'Build from working hours'}
                </button>
              </div>
              <p className="text-muted text-xs mt-3">Building from working hours needs trainer availability set up under Staff first.</p>
            </div>
          ) : (
            <div className="bg-card border border-white/[0.08] rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-white/[0.08]">
                      <th className="text-left px-3 py-3 text-xs font-semibold text-muted whitespace-nowrap">Time</th>
                      {WEEKDAYS.map((d) => (
                        <th key={d.key} className="text-left px-3 py-3 text-xs font-semibold text-muted whitespace-nowrap">{d.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {times.map((t) => (
                      <tr key={t} className="border-b border-white/[0.04] last:border-0">
                        <td className="px-3 py-2 text-xs text-muted whitespace-nowrap align-top">{t}</td>
                        {WEEKDAYS.map((d) => {
                          const slot = grid[t]?.[d.key]
                          return (
                            <td key={d.key} className="px-2 py-2 align-top min-w-[150px]">
                              {!slot ? (
                                <span className="text-white/10 text-xs">—</span>
                              ) : (
                                <SlotCell
                                  slot={slot}
                                  busy={busyId === slot._id}
                                  onAssign={() => setAssignTarget(slot)}
                                  onEmpty={() => emptySlot(slot)}
                                  onDelete={() => setDeleteTarget(slot)}
                                />
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {assignTarget && (
        <AssignModal
          slot={assignTarget}
          plans={activePlans}
          onClose={() => setAssignTarget(null)}
          onAssigned={(updated) => {
            setSlots((prev) => prev.map((s) => (s._id === updated._id ? updated : s)))
            setAssignTarget(null)
          }}
        />
      )}

      {addSlotsOpen && (
        <AddSlotsModal
          trainerId={trainerId}
          onClose={() => setAddSlotsOpen(false)}
          onAdded={(data) => setSlots(data.slots || [])}
        />
      )}

      {declineTarget && (
        <DeclineModal
          slot={declineTarget}
          busy={busyId === declineTarget._id}
          onClose={() => setDeclineTarget(null)}
          onDecline={(reason) => declineRequest(declineTarget, reason)}
        />
      )}

      {buildConfirmOpen && (
        <ConfirmModal
          title="Build from working hours?"
          body="This adds any missing slots based on this trainer's saved working hours. Existing slots and bookings are left exactly as they are."
          confirmLabel={generating ? 'Building…' : 'Build'}
          busy={generating}
          onClose={() => setBuildConfirmOpen(false)}
          onConfirm={buildTimetable}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Delete this slot?"
          body={
            <>
              {cap(deleteTarget.weekday)} · {deleteTarget.startTime}–{deleteTarget.endTime}
              {deleteTarget.status === 'booked' && deleteTarget.memberId?.name ? (
                <> — <strong>{deleteTarget.memberId.name}</strong> is currently booked into this slot and will lose their recurring booking.</>
              ) : (
                <> This removes the slot from the timetable entirely — you can always add it back later.</>
              )}
            </>
          }
          confirmLabel={busyId === deleteTarget._id ? 'Deleting…' : 'Delete slot'}
          danger
          busy={busyId === deleteTarget._id}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => deleteSlot(deleteTarget)}
        />
      )}
    </div>
  )
}

function SlotCell({ slot, busy, onAssign, onEmpty, onDelete }) {
  if (slot.status === 'booked') {
    return (
      <div className="bg-lime/[0.06] border border-lime/20 rounded-lg px-2.5 py-2 relative group">
        <button onClick={onDelete} disabled={busy} title="Delete slot"
          className="absolute top-1.5 right-1.5 text-[11px] text-muted hover:text-red-400 opacity-60 hover:opacity-100 disabled:opacity-30">
          🗑
        </button>
        <p className="text-xs font-semibold truncate pr-4">{slot.memberId?.name}</p>
        {slot.memberPTPlanId?.name && (
          <p className="text-[11px] text-muted truncate">{slot.memberPTPlanId.name}</p>
        )}
        <button onClick={onEmpty} disabled={busy}
          className="mt-1.5 text-[11px] font-semibold text-red-400 hover:text-red-300 disabled:opacity-60">
          {busy ? 'Clearing…' : 'Clear slot'}
        </button>
      </div>
    )
  }

  const requested = !!slot.pendingRequest?.memberId
  return (
    <div className={`rounded-lg px-2.5 py-2 border relative group ${requested ? 'bg-amber-400/[0.06] border-amber-400/20' : 'bg-white/[0.02] border-white/[0.06]'}`}>
      <button onClick={onDelete} disabled={busy} title="Delete slot"
        className="absolute top-1.5 right-1.5 text-[11px] text-muted hover:text-red-400 opacity-60 hover:opacity-100 disabled:opacity-30">
        🗑
      </button>
      <p className="text-[11px] text-muted mb-1 pr-4">{requested ? 'Requested' : 'Open'}</p>
      <button onClick={onAssign} disabled={busy}
        className="text-[11px] font-semibold text-lime hover:text-lime-dark disabled:opacity-60">
        + Assign member
      </button>
    </div>
  )
}

function ConfirmModal({ title, body, confirmLabel = 'Confirm', danger = false, busy, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70">
      <div className="bg-card border border-white/[0.1] rounded-2xl w-full max-w-sm p-7 relative">
        <button onClick={onClose} className="absolute text-xl leading-none top-4 right-5 text-muted hover:text-cream">×</button>
        <h2 className="mb-2 text-lg font-bold">{title}</h2>
        <p className="text-sm text-muted mb-6 leading-relaxed">{body}</p>
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 border border-white/10 text-muted py-2.5 rounded-lg text-sm hover:text-cream transition-all">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={busy}
            className={`flex-[2] font-bold py-2.5 rounded-lg text-sm transition-all disabled:opacity-60 ${
              danger ? 'bg-red-500/90 text-white hover:bg-red-500' : 'bg-lime text-black hover:bg-lime-dark'
            }`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

function AssignModal({ slot, plans, onClose, onAssigned }) {
  const [memberPTPlanId, setMemberPTPlanId] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const options = plans.map((p) => ({
    value: p._id,
    label: `${p.memberId?.name || 'Member'} — ${p.name}`,
  }))

  async function submit() {
    if (!memberPTPlanId) { setError('Pick a member'); return }
    const plan = plans.find((p) => p._id === memberPTPlanId)
    if (!plan) return
    setSaving(true)
    setError('')
    try {
      const { data } = await timetableApi.assign(slot._id, {
        memberId: plan.memberId?._id || plan.memberId,
        memberPTPlanId: plan._id,
      })
      onAssigned(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign member')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70">
      <div className="bg-card border border-white/[0.1] rounded-2xl w-full max-w-sm p-7 relative">
        <button onClick={onClose} className="absolute text-xl leading-none top-4 right-5 text-muted hover:text-cream">×</button>
        <h2 className="mb-1 text-lg font-bold">Assign slot</h2>
        <p className="text-xs text-muted mb-5">{cap(slot.weekday)} · {slot.startTime}–{slot.endTime}</p>

        {error && <p className="px-3 py-2 mb-4 text-sm text-red-400 border rounded-lg bg-red-500/10 border-red-500/20">{error}</p>}

        <div className="flex flex-col gap-1.5 mb-5">
          <label className="text-xs font-medium text-muted">Member (active PT plan)</label>
          <Select
            value={memberPTPlanId}
            onChange={setMemberPTPlanId}
            options={options}
            placeholder={options.length ? 'Select member' : 'No members with an active PT plan under this trainer'}
          />
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 border border-white/10 text-muted py-2.5 rounded-lg text-sm hover:text-cream transition-all">Cancel</button>
          <button onClick={submit} disabled={saving || !memberPTPlanId}
            className="flex-[2] bg-lime text-black font-bold py-2.5 rounded-lg text-sm hover:bg-lime-dark transition-all disabled:opacity-60">
            {saving ? 'Assigning…' : 'Assign'}
          </button>
        </div>
      </div>
    </div>
  )
}

function AddSlotsModal({ trainerId, onClose, onAdded }) {
  const [weekdays, setWeekdays] = useState([])
  const [times, setTimes] = useState(['06:00'])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null) // { created, skipped }

  const allSelected = weekdays.length === WEEKDAYS.length

  function toggleDay(key) {
    setWeekdays((prev) => (prev.includes(key) ? prev.filter((d) => d !== key) : [...prev, key]))
  }
  function toggleAllDays() {
    setWeekdays(allSelected ? [] : WEEKDAYS.map((d) => d.key))
  }
  function setTimeAt(i, val) {
    setTimes((prev) => prev.map((t, idx) => (idx === i ? val : t)))
  }
  function addTimeRow() {
    setTimes((prev) => [...prev, '06:00'])
  }
  function removeTimeRow(i) {
    setTimes((prev) => prev.filter((_, idx) => idx !== i))
  }

  async function submit() {
    setError('')
    if (weekdays.length === 0) { setError('Pick at least one day'); return }
    if (times.length === 0) { setError('Pick at least one time'); return }
    setSaving(true)
    try {
      const { data } = await timetableApi.addSlots(trainerId, { weekdays, times, durationMinutes: 60 })
      setResult({ created: data.created, skipped: data.skipped })
      onAdded(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add slots')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70">
      <div className="bg-card border border-white/[0.1] rounded-2xl w-full max-w-md p-7 relative">
        <button onClick={onClose} className="absolute text-xl leading-none top-4 right-5 text-muted hover:text-cream">×</button>
        <h2 className="mb-1 text-lg font-bold">Add slot(s)</h2>
        <p className="text-xs text-muted mb-5">One-hour sessions — pick every day and time you want, added in one go.</p>

        {error && <p className="px-3 py-2 mb-4 text-sm text-red-400 border rounded-lg bg-red-500/10 border-red-500/20">{error}</p>}

        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-muted">Days</label>
            <button type="button" onClick={toggleAllDays} className="text-xs font-semibold text-lime hover:text-lime-dark">
              {allSelected ? 'Clear all' : 'Select all'}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {WEEKDAYS.map((d) => (
              <button key={d.key} type="button" onClick={() => toggleDay(d.key)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                  weekdays.includes(d.key)
                    ? 'bg-lime text-black border-lime'
                    : 'bg-white/[0.03] text-muted border-white/10 hover:text-cream'
                }`}>
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="text-xs font-medium text-muted block mb-2">Times</label>
          <div className="flex flex-col gap-2">
            {times.map((t, i) => (
              <div key={i} className="flex items-center gap-2">
                <input type="time" value={t} onChange={(e) => setTimeAt(i, e.target.value)}
                  className="field-input flex-1" />
                {times.length > 1 && (
                  <button type="button" onClick={() => removeTimeRow(i)}
                    className="text-muted hover:text-red-400 text-lg leading-none px-1">×</button>
                )}
              </div>
            ))}
          </div>
          <button type="button" onClick={addTimeRow} className="text-xs font-semibold text-lime hover:text-lime-dark mt-2">
            + Add another time
          </button>
        </div>

        {result && (
          <p className="text-xs text-muted mb-4">
            Added {result.created} slot{result.created !== 1 ? 's' : ''}
            {result.skipped > 0 ? ` · ${result.skipped} already existed` : ''}.
          </p>
        )}

        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 border border-white/10 text-muted py-2.5 rounded-lg text-sm hover:text-cream transition-all">
            {result ? 'Done' : 'Cancel'}
          </button>
          {!result && (
            <button onClick={submit} disabled={saving}
              className="flex-[2] bg-lime text-black font-bold py-2.5 rounded-lg text-sm hover:bg-lime-dark transition-all disabled:opacity-60">
              {saving ? 'Adding…' : `Add ${weekdays.length || 0} day(s) × ${times.length} time(s)`}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function DeclineModal({ slot, busy, onClose, onDecline }) {
  const [reason, setReason] = useState('')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70">
      <div className="bg-card border border-white/[0.1] rounded-2xl w-full max-w-sm p-7 relative">
        <button onClick={onClose} className="absolute text-xl leading-none top-4 right-5 text-muted hover:text-cream">×</button>
        <h2 className="mb-1 text-lg font-bold">Decline request</h2>
        <p className="text-xs text-muted mb-5">
          {slot.pendingRequest?.memberId?.name} · {cap(slot.weekday)} {slot.startTime}–{slot.endTime}
        </p>
        <textarea value={reason} onChange={(e) => setReason(e.target.value)}
          placeholder="Reason (optional)" rows={3} className="field-input mb-5 resize-none" />
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 border border-white/10 text-muted py-2.5 rounded-lg text-sm hover:text-cream transition-all">Cancel</button>
          <button onClick={() => onDecline(reason)} disabled={busy}
            className="flex-[2] bg-red-500/90 text-white font-bold py-2.5 rounded-lg text-sm hover:bg-red-500 transition-all disabled:opacity-60">
            {busy ? 'Declining…' : 'Decline'}
          </button>
        </div>
      </div>
    </div>
  )
}
