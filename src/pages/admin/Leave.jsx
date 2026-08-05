import { useEffect, useState } from 'react'
import { leaveApi } from '../../api/index'
import { useAuth } from '../../context/AuthContext'
import Select from '../../components/ui/Select'

function canPayroll(user, action) {
  if (user?.role === 'owner') return true
  if (user?.role === 'manager') return !!user?.permissions?.payroll?.[action]
  return false
}

const STATUS_BADGE = {
  pending:   'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  approved:  'text-lime bg-lime/10 border-lime/20',
  rejected:  'text-red-400 bg-red-400/10 border-red-400/20',
  cancelled: 'text-muted bg-white/5 border-white/10',
}

function formatRange(fromDate, toDate) {
  const from = new Date(fromDate)
  const to = new Date(toDate)
  const fmt = (d) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  return from.toDateString() === to.toDateString() ? fmt(from) : `${fmt(from)} – ${fmt(to)}`
}

export default function Leave() {
  const { user } = useAuth()
  const canApprove = canPayroll(user, 'approve')
  const isOwner = user?.role === 'owner'

  // Owners aren't staff — they don't submit leave requests, only review them.
  const TABS = [
    ...(!isOwner ? [{ key: 'mine', label: 'My leave' }] : []),
    ...(canApprove ? [{ key: 'approvals', label: 'Approvals' }] : []),
  ]
  const [tab, setTab] = useState(canApprove && isOwner ? 'approvals' : 'mine')

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Leave</h1>
        <p className="mt-0.5 text-sm text-muted">
          {isOwner ? "Review and approve your team's leave requests." : 'Request time off and track your requests.'}
        </p>
      </div>

      {TABS.length > 1 && (
        <div className="flex gap-1 mb-6 overflow-x-auto border-b border-white/10">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-all"
              style={{
                borderColor: tab === t.key ? '#c8f135' : 'transparent',
                color: tab === t.key ? '#F5F4EF' : '#888880',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {tab === 'mine' && !isOwner && <MyLeaveTab />}
      {tab === 'approvals' && canApprove && <LeaveApprovalsTab />}
    </div>
  )
}

/* ── My leave ──────────────────────────────────────────────────────────────── */

function MyLeaveTab() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  function load() {
    setLoading(true)
    leaveApi.myList().then(({ data }) => setRequests(data)).catch(() => {}).finally(() => setLoading(false))
  }
  useEffect(load, [])

  async function cancel(id) {
    if (!confirm('Cancel this leave request?')) return
    try { await leaveApi.cancel(id); load() } catch { /* ignore */ }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <button onClick={() => setShowForm(true)} className="bg-lime text-black font-bold text-sm px-4 py-2 rounded-lg hover:bg-lime-dark transition-all">
          + Request leave
        </button>
      </div>

      {loading ? (
        <div className="h-40 rounded-xl animate-pulse bg-white/5" />
      ) : requests.length === 0 ? (
        <p className="py-16 text-sm text-center text-muted">No leave requests yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {requests.map((r) => (
            <div key={r._id} className="flex items-center justify-between gap-3 p-4 bg-card border border-white/[0.08] rounded-xl flex-wrap">
              <div>
                <p className="text-sm font-semibold">{formatRange(r.fromDate, r.toDate)} <span className="font-normal text-muted">· {r.days} day{r.days === 1 ? '' : 's'} · {r.leaveType}</span></p>
                <p className="mt-1 text-xs text-muted">{r.reason}</p>
                {r.status !== 'pending' && r.reviewNote && <p className="mt-1 text-xs italic text-muted">Note: "{r.reviewNote}"</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${STATUS_BADGE[r.status]}`}>{r.status}</span>
                {r.status === 'pending' && (
                  <button onClick={() => cancel(r._id)} className="text-xs font-semibold text-muted hover:text-red-400 transition-all">Cancel</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && <LeaveRequestModal onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load() }} />}
    </div>
  )
}

function LeaveRequestModal({ onClose, onSaved }) {
  const today = new Date().toISOString().slice(0, 10)
  const [form, setForm] = useState({ fromDate: today, toDate: today, leaveType: 'unpaid', reason: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (!form.reason.trim()) { setError('Please provide a reason'); return }
    if (form.toDate < form.fromDate) { setError('End date must be on or after the start date'); return }
    setError(''); setLoading(true)
    try {
      await leaveApi.submit(form)
      onSaved()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit leave request')
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70">
      <div className="bg-card border border-white/[0.1] rounded-2xl w-full max-w-md p-7 relative">
        <button onClick={onClose} className="absolute text-xl leading-none top-4 right-5 text-muted hover:text-cream">×</button>
        <h2 className="mb-5 text-lg font-bold">Request leave</h2>

        <form onSubmit={submit} className="flex flex-col gap-4">
          {error && <p className="px-3 py-2 text-sm text-red-400 border rounded-lg bg-red-500/10 border-red-500/20">{error}</p>}

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted">From</label>
              <input type="date" value={form.fromDate}
                onChange={(e) => setForm((v) => ({ ...v, fromDate: e.target.value, toDate: v.toDate < e.target.value ? e.target.value : v.toDate }))}
                className="field-input" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted">To</label>
              <input type="date" value={form.toDate} min={form.fromDate}
                onChange={(e) => setForm((v) => ({ ...v, toDate: e.target.value }))}
                className="field-input" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted">Type</label>
            <Select
              value={form.leaveType}
              onChange={(val) => setForm((v) => ({ ...v, leaveType: val }))}
              options={[{ value: 'unpaid', label: 'Unpaid leave' }, { value: 'paid', label: 'Paid leave' }]}
            />
            <p className="text-[11px] text-muted">Your manager can adjust this when approving.</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted">Reason</label>
            <textarea rows={3} value={form.reason} onChange={(e) => setForm((v) => ({ ...v, reason: e.target.value }))}
              className="resize-none field-input" placeholder="Let your manager know why you need the time off…" />
          </div>

          <div className="flex gap-3 mt-1">
            <button type="button" onClick={onClose} className="flex-1 border border-white/10 text-muted py-2.5 rounded-lg text-sm hover:text-cream transition-all">Cancel</button>
            <button type="submit" disabled={loading} className="flex-[2] bg-lime text-black font-bold py-2.5 rounded-lg text-sm hover:bg-lime-dark transition-all disabled:opacity-60">
              {loading ? 'Submitting…' : 'Submit request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Approvals ────────────────────────────────────────────────────────────── */

function LeaveApprovalsTab() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  function load() {
    setLoading(true)
    leaveApi.pending().then(({ data }) => setRequests(data)).catch(() => {}).finally(() => setLoading(false))
  }
  useEffect(load, [])

  async function approve(r) {
    setBusyId(r._id); setError('')
    try {
      await leaveApi.approve(r._id, r.leaveType)
      setRequests((prev) => prev.filter((x) => x._id !== r._id))
    } catch (err) { setError(err.response?.data?.message || 'Failed to approve') }
    finally { setBusyId(null) }
  }
  async function reject(r) {
    const reason = prompt('Reason for rejecting (optional):') || ''
    setBusyId(r._id); setError('')
    try {
      await leaveApi.reject(r._id, reason)
      setRequests((prev) => prev.filter((x) => x._id !== r._id))
    } catch (err) { setError(err.response?.data?.message || 'Failed to reject') }
    finally { setBusyId(null) }
  }

  if (loading) return <div className="h-40 rounded-xl animate-pulse bg-white/5" />

  return (
    <div className="flex flex-col gap-3">
      {error && <p className="px-3 py-2 text-sm text-red-400 border rounded-lg bg-red-500/10 border-red-500/20">{error}</p>}
      {requests.length === 0 ? (
        <p className="py-16 text-sm text-center text-muted">No pending leave requests 🎉</p>
      ) : requests.map((r) => (
        <div key={r._id} className="flex items-center justify-between gap-3 p-4 bg-card border border-white/[0.08] rounded-xl flex-wrap">
          <div>
            <p className="text-sm font-semibold">{r.staffId?.name || 'Staff member'} <span className="font-normal text-muted">· {r.staffId?.role}</span></p>
            <p className="mt-0.5 text-xs text-muted">{formatRange(r.fromDate, r.toDate)} · {r.days} day{r.days === 1 ? '' : 's'} · requested as {r.leaveType}</p>
            <p className="mt-1 text-xs italic text-muted">"{r.reason}"</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button disabled={busyId === r._id} onClick={() => approve(r)}
              className="text-xs font-semibold text-black bg-lime px-2.5 py-1.5 rounded-lg hover:bg-lime-dark transition-all disabled:opacity-50">
              Approve
            </button>
            <button disabled={busyId === r._id} onClick={() => reject(r)}
              className="text-xs font-semibold text-red-400 border border-red-400/30 px-2.5 py-1.5 rounded-lg hover:bg-red-400/10 transition-all disabled:opacity-50">
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
