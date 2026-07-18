import { useEffect, useState, useRef } from 'react'
import { ptPlanApi, memberPTPlanApi, staffApi, memberApi } from '../../api/index'
import { useAuth } from '../../context/AuthContext'
import Select from '../../components/ui/Select'

const TARGET_SUGGESTIONS = ['Weight loss', 'Muscle gain', 'General fitness', 'Strength training', 'Rehab / recovery', 'Sports performance']

const STATUS_STYLE = {
  active:    { bg: 'bg-lime/10',   text: 'text-lime',        label: 'Active' },
  completed: { bg: 'bg-blue-500/10', text: 'text-blue-400',  label: 'Completed' },
  expired:   { bg: 'bg-red-500/10',  text: 'text-red-400',   label: 'Expired' },
  cancelled: { bg: 'bg-white/5',     text: 'text-muted',     label: 'Cancelled' },
}

export default function PTPlans() {
  const { user } = useAuth()
  const canManageCatalog = ['owner', 'manager'].includes(user?.role)

  const [tab, setTab] = useState('assignments')
  const [plans, setPlans] = useState([])
  const [trainers, setTrainers] = useState([])
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showPlanForm, setShowPlanForm] = useState(false)
  const [editingPlan, setEditingPlan] = useState(null)
  const [showAssignForm, setShowAssignForm] = useState(false)
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  async function loadAll(showSpinner = true) {
    if (showSpinner) setLoading(true)
    try {
      const [plansRes, assignRes] = await Promise.all([
        ptPlanApi.list(),
        memberPTPlanApi.list({ limit: 150 }),
      ])
      setPlans(plansRes.data)
      setAssignments(assignRes.data)
    } catch { /* ignore */ }
    finally { if (showSpinner) setLoading(false) }
    // Best-effort — staff list is owner/manager only, trainers just won't get a picker
    staffApi.list().then(({ data }) => setTrainers(data.filter((s) => s.role === 'trainer'))).catch(() => { })
  }

  useEffect(() => { loadAll() }, [])

  async function savePlan(form) {
    setFormError(''); setFormLoading(true)
    try {
      if (editingPlan) await ptPlanApi.update(editingPlan._id, form)
      else await ptPlanApi.create(form)
      setShowPlanForm(false); setEditingPlan(null)
      loadAll(false)
    } catch (err) { setFormError(err.response?.data?.message || 'Failed to save PT plan') }
    finally { setFormLoading(false) }
  }

  async function deactivatePlan(plan) {
    if (!confirm(`Deactivate "${plan.name}"? Members already assigned keep their plan.`)) return
    try { await ptPlanApi.remove(plan._id); loadAll(false) } catch { alert('Failed to deactivate plan') }
  }

  async function assignPlan(form) {
    setFormError(''); setFormLoading(true)
    try {
      await memberPTPlanApi.assign(form)
      setShowAssignForm(false)
      loadAll(false)
    } catch (err) { setFormError(err.response?.data?.message || 'Failed to assign PT plan') }
    finally { setFormLoading(false) }
  }

  async function logClass(a) {
    try { await memberPTPlanApi.logClass(a._id); loadAll(false) } catch (err) { alert(err.response?.data?.message || 'Failed to log class') }
  }
  async function undoClass(a) {
    try { await memberPTPlanApi.undoClass(a._id); loadAll(false) } catch { alert('Failed to undo') }
  }
  async function cancelAssignment(a) {
    if (!confirm(`Cancel "${a.name}" for ${a.memberId?.name || 'this member'}?`)) return
    try { await memberPTPlanApi.cancel(a._id); loadAll(false) } catch { alert('Failed to cancel') }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">PT Plans</h1>
          <p className="text-muted text-sm mt-0.5">Personal training packages — independent of membership plans, entirely optional</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowAssignForm(true); setFormError('') }}
            className="bg-lime text-black font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-lime-dark transition-all"
          >
            + Assign to member
          </button>
          {canManageCatalog && (
            <button
              onClick={() => { setShowPlanForm(true); setEditingPlan(null); setFormError('') }}
              className="border border-white/10 text-cream font-semibold text-sm px-5 py-2.5 rounded-lg hover:border-white/20 transition-all"
            >
              + New PT plan
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-white/[0.08]">
        {[['assignments', 'Member assignments'], ['catalog', 'Plan catalog']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${tab === key ? 'border-lime text-cream' : 'border-transparent text-muted hover:text-cream'}`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-36 bg-card border border-white/[0.08] rounded-xl animate-pulse" />)}
        </div>
      ) : tab === 'catalog' ? (
        plans.length === 0 ? (
          <div className="py-20 text-sm text-center text-muted">
            No PT plans yet. Create one to start assigning personal-training packages to members.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {plans.map((plan) => (
              <div key={plan._id} className="bg-card border border-white/[0.08] rounded-xl p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold">{plan.name}</h3>
                  {canManageCatalog && (
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => { setEditingPlan(plan); setShowPlanForm(true); setFormError('') }}
                        className="text-xs text-muted hover:text-cream border border-white/10 px-2.5 py-1 rounded-lg hover:border-white/20 transition-all">
                        Edit
                      </button>
                      <button onClick={() => deactivatePlan(plan)}
                        className="text-xs text-red-400/70 hover:text-red-400 border border-white/10 px-2.5 py-1 rounded-lg hover:border-red-400/20 transition-all">
                        Remove
                      </button>
                    </div>
                  )}
                </div>
                <div className="text-3xl font-black text-lime mb-1">₹{(plan.fee ?? 0).toLocaleString('en-IN')}</div>
                <p className="mb-3 text-sm text-muted">
                  {plan.numberOfClasses} classes · {plan.durationDays} days validity
                </p>
                <div className="flex flex-wrap gap-2 mb-3 text-xs">
                  {plan.target && <span className="px-2 py-1 rounded-full bg-white/5 text-muted">{plan.target}</span>}
                  {plan.trainerId?.name && <span className="px-2 py-1 rounded-full bg-white/5 text-muted">Trainer: {plan.trainerId.name}</span>}
                </div>
                {plan.description && <p className="text-xs text-muted border-t border-white/[0.06] pt-3">{plan.description}</p>}
              </div>
            ))}
          </div>
        )
      ) : (
        <AssignmentsTable assignments={assignments} onLogClass={logClass} onUndoClass={undoClass} onCancel={cancelAssignment} />
      )}

      {showPlanForm && (
        <Modal title={editingPlan ? 'Edit PT plan' : 'New PT plan'} onClose={() => { setShowPlanForm(false); setEditingPlan(null) }}>
          <PlanForm initial={editingPlan} trainers={trainers} error={formError} loading={formLoading}
            onSubmit={savePlan} onClose={() => { setShowPlanForm(false); setEditingPlan(null) }} />
        </Modal>
      )}

      {showAssignForm && (
        <Modal title="Assign PT plan to member" onClose={() => setShowAssignForm(false)}>
          <AssignForm plans={plans} trainers={trainers} error={formError} loading={formLoading}
            canManageCatalog={canManageCatalog}
            onCreatePlan={() => { setShowAssignForm(false); setEditingPlan(null); setFormError(''); setShowPlanForm(true) }}
            onSubmit={assignPlan} onClose={() => setShowAssignForm(false)} />
        </Modal>
      )}
    </div>
  )
}

function AssignmentsTable({ assignments, onLogClass, onUndoClass, onCancel }) {
  if (assignments.length === 0) {
    return <div className="py-20 text-sm text-center text-muted">No PT plans assigned to any member yet.</div>
  }
  return (
    <div className="overflow-hidden border rounded-xl border-white/[0.08]">
      <table className="w-full text-sm">
        <thead className="bg-white/[0.03] text-muted text-xs uppercase tracking-wide">
          <tr>
            <th className="px-4 py-3 text-left">Member</th>
            <th className="px-4 py-3 text-left">Plan</th>
            <th className="px-4 py-3 text-left">Trainer</th>
            <th className="px-4 py-3 text-left">Classes</th>
            <th className="px-4 py-3 text-left">Expiry</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.06]">
          {assignments.map((a) => {
            const st = STATUS_STYLE[a.status] || STATUS_STYLE.active
            const daysLeft = Math.ceil((new Date(a.expiryDate) - new Date()) / 86400000)
            return (
              <tr key={a._id} className="hover:bg-white/[0.02]">
                <td className="px-4 py-3">
                  <div className="font-medium text-cream">{a.memberId?.name || '—'}</div>
                  <div className="text-xs text-muted">{a.memberId?.phone}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-cream">{a.name}</div>
                  {a.target && <div className="text-xs text-muted">{a.target}</div>}
                </td>
                <td className="px-4 py-3 text-muted">{a.trainerId?.name || '—'}</td>
                <td className="px-4 py-3">
                  <div className="text-cream">{a.classesUsed} / {a.classesTotal}</div>
                  <div className="h-1.5 w-20 bg-white/10 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-lime" style={{ width: `${Math.min((a.classesUsed / a.classesTotal) * 100, 100)}%` }} />
                  </div>
                </td>
                <td className="px-4 py-3 text-muted">
                  {new Date(a.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  {a.status === 'active' && (
                    <div className="text-xs" style={{ color: daysLeft <= 3 ? '#f87171' : undefined }}>
                      {daysLeft >= 0 ? `${daysLeft}d left` : 'overdue'}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${st.bg} ${st.text}`}>{st.label}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1.5">
                    {a.status === 'active' && (
                      <>
                        <button onClick={() => onLogClass(a)}
                          className="text-xs bg-lime/10 text-lime px-2.5 py-1 rounded-lg hover:bg-lime/20 transition-all">
                          +1 class
                        </button>
                        {a.classesUsed > 0 && (
                          <button onClick={() => onUndoClass(a)}
                            className="text-xs text-muted border border-white/10 px-2.5 py-1 rounded-lg hover:text-cream transition-all">
                            Undo
                          </button>
                        )}
                        <button onClick={() => onCancel(a)}
                          className="text-xs text-red-400/70 hover:text-red-400 border border-white/10 px-2.5 py-1 rounded-lg hover:border-red-400/20 transition-all">
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70">
      <div className="bg-card border border-white/[0.1] rounded-2xl w-full max-w-md p-7 relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute text-xl leading-none top-4 right-5 text-muted hover:text-cream">×</button>
        <h2 className="mb-5 text-lg font-bold">{title}</h2>
        {children}
      </div>
    </div>
  )
}

function PlanForm({ initial, trainers, error, loading, onSubmit, onClose }) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    description: initial?.description || '',
    numberOfClasses: initial?.numberOfClasses || 12,
    durationDays: initial?.durationDays || 40,
    fee: initial?.fee || '',
    target: initial?.target || '',
    trainerId: initial?.trainerId?._id || initial?.trainerId || '',
  })
  const set = (f) => (e) => setForm((v) => ({ ...v, [f]: e.target.value }))

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form) }} className="flex flex-col gap-4">
      {error && <p className="px-3 py-2 text-sm text-red-400 border rounded-lg bg-red-500/10 border-red-500/20">{error}</p>}

      <Field label="Plan name *">
        <input type="text" value={form.name} onChange={set('name')} className="field-input" placeholder="Weight Loss Starter" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Number of classes *">
          <input type="number" min="1" value={form.numberOfClasses} onChange={set('numberOfClasses')} className="field-input" />
        </Field>
        <Field label="Duration (days) *">
          <input type="number" min="1" value={form.durationDays} onChange={set('durationDays')} className="field-input" placeholder="40" />
        </Field>
      </div>
      <Field label="Fee (₹) *">
        <input type="number" min="0" value={form.fee} onChange={set('fee')} className="field-input" placeholder="8000" />
      </Field>
      <Field label="Target / goal">
        <input list="pt-target-suggestions" type="text" value={form.target} onChange={set('target')} className="field-input" placeholder="Weight loss" />
        <datalist id="pt-target-suggestions">
          {TARGET_SUGGESTIONS.map((t) => <option key={t} value={t} />)}
        </datalist>
      </Field>
      <Field label="Default trainer (optional)">
        <Select
          value={form.trainerId}
          onChange={(val) => setForm((v) => ({ ...v, trainerId: val }))}
          options={trainers.map((t) => ({ value: t._id, label: t.name }))}
          placeholder={trainers.length ? 'Unassigned' : 'No trainers found'}
        />
      </Field>
      <Field label="Description (optional)">
        <textarea rows={2} value={form.description} onChange={set('description')} className="resize-none field-input" placeholder="What's included…" />
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

function AssignForm({ plans, trainers, error, loading, canManageCatalog, onCreatePlan, onSubmit, onClose }) {
  const [member, setMember] = useState(null)
  const [ptPlanId, setPtPlanId] = useState(plans[0]?._id || '')
  const [trainerId, setTrainerId] = useState('')
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10))

  const selectedPlan = plans.find((p) => p._id === ptPlanId)

  if (plans.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted">
          Your PT plan catalog is empty, so there's nothing to assign yet.
          {canManageCatalog ? ' Create a plan first — it only takes a moment.' : ' Ask an owner/manager to create one.'}
        </p>
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 border border-white/10 text-muted py-2.5 rounded-lg text-sm hover:text-cream transition-all">Close</button>
          {canManageCatalog && (
            <button type="button" onClick={onCreatePlan} className="flex-[2] bg-lime text-black font-bold py-2.5 rounded-lg text-sm hover:bg-lime-dark transition-all">
              + New PT plan
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      if (!member) return
      onSubmit({ memberId: member._id, ptPlanId, trainerId: trainerId || undefined, startDate })
    }} className="flex flex-col gap-4">
      {error && <p className="px-3 py-2 text-sm text-red-400 border rounded-lg bg-red-500/10 border-red-500/20">{error}</p>}

      <Field label="Member *">
        <MemberPicker value={member} onChange={setMember} />
      </Field>

      <Field label="PT plan *">
        <Select
          value={ptPlanId}
          onChange={setPtPlanId}
          options={plans.map((p) => ({ value: p._id, label: `${p.name} — ${p.numberOfClasses} classes, ${p.durationDays}d, ₹${(p.fee ?? 0).toLocaleString('en-IN')}` }))}
          placeholder="Select a plan"
        />
      </Field>

      <Field label="Trainer (optional — overrides plan default)">
        <Select
          value={trainerId}
          onChange={setTrainerId}
          options={trainers.map((t) => ({ value: t._id, label: t.name }))}
          placeholder={selectedPlan?.trainerId?.name ? `Default: ${selectedPlan.trainerId.name}` : 'Unassigned'}
        />
      </Field>

      <Field label="Start date">
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="field-input" />
      </Field>

      {selectedPlan && (
        <p className="text-xs text-muted">
          Expires {new Date(new Date(startDate).getTime() + selectedPlan.durationDays * 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · fee ₹{(selectedPlan.fee ?? 0).toLocaleString('en-IN')}
        </p>
      )}

      <div className="flex gap-3 mt-1">
        <button type="button" onClick={onClose} className="flex-1 border border-white/10 text-muted py-2.5 rounded-lg text-sm hover:text-cream transition-all">Cancel</button>
        <button type="submit" disabled={loading || !member || !ptPlanId} className="flex-[2] bg-lime text-black font-bold py-2.5 rounded-lg text-sm hover:bg-lime-dark transition-all disabled:opacity-60">
          {loading ? 'Assigning…' : 'Assign plan'}
        </button>
      </div>
    </form>
  )
}

/** Debounced member search-and-select — avoids loading every member up front. */
function MemberPicker({ value, onChange }) {
  const [query, setQuery] = useState(value?.name || '')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const debounceRef = useRef(null)

  function handleType(e) {
    const q = e.target.value
    setQuery(q)
    onChange(null)
    clearTimeout(debounceRef.current)
    if (q.trim().length < 2) { setResults([]); return }
    debounceRef.current = setTimeout(() => {
      memberApi.list({ search: q, limit: 8 })
        .then(({ data }) => { setResults(data.members || []); setOpen(true) })
        .catch(() => { })
    }, 300)
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={handleType}
        onFocus={() => results.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="field-input"
        placeholder="Search member by name or phone…"
      />
      {open && results.length > 0 && (
        <div className="absolute z-10 w-full mt-1 overflow-y-auto border rounded-lg shadow-lg bg-card border-white/10 max-h-48">
          {results.map((m) => (
            <button key={m._id} type="button"
              onMouseDown={(e) => { e.preventDefault(); onChange(m); setQuery(m.name); setOpen(false) }}
              className="flex flex-col w-full px-3 py-2 text-left hover:bg-white/5">
              <span className="text-sm text-cream">{m.name}</span>
              <span className="text-xs text-muted">{m.phone}</span>
            </button>
          ))}
        </div>
      )}
      {value && <p className="mt-1 text-xs text-lime">Selected: {value.name}</p>}
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
