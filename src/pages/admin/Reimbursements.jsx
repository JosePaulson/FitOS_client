import { useEffect, useState } from 'react'
import { reimbursementApi } from '../../api/index'
import { useAuth } from '../../context/AuthContext'

function canPayroll(user, action) {
  if (user?.role === 'owner') return true
  if (user?.role === 'manager') return !!user?.permissions?.payroll?.[action]
  return false
}

const STATUS_BADGE = {
  pending:  'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  approved: 'text-lime bg-lime/10 border-lime/20',
  rejected: 'text-red-400 bg-red-400/10 border-red-400/20',
  paid:     'text-blue-400 bg-blue-400/10 border-blue-400/20',
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
function formatMoney(n) {
  return `₹${Number(n).toLocaleString('en-IN')}`
}

export default function Reimbursements() {
  const { user } = useAuth()
  const canApprove = canPayroll(user, 'approve')
  const isOwner = user?.role === 'owner'

  // Owners aren't staff — they don't file reimbursement requests, only review them.
  const TABS = [
    ...(!isOwner ? [{ key: 'mine', label: 'My requests' }] : []),
    ...(canApprove ? [{ key: 'approvals', label: 'Approvals' }] : []),
  ]
  const [tab, setTab] = useState(canApprove && isOwner ? 'approvals' : 'mine')

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Reimbursements</h1>
        <p className="mt-0.5 text-sm text-muted">
          {isOwner ? "Review and pay out your team's reimbursement requests." : 'Request reimbursement for purchases or payments made on the gym\'s behalf.'}
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

      {tab === 'mine' && !isOwner && <MyReimbursementsTab />}
      {tab === 'approvals' && canApprove && <ReimbursementApprovalsTab />}
    </div>
  )
}

/* ── Mine ─────────────────────────────────────────────────────────────────── */

function MyReimbursementsTab() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  function load() {
    setLoading(true)
    reimbursementApi.myList().then(({ data }) => setRequests(data)).catch(() => {}).finally(() => setLoading(false))
  }
  useEffect(load, [])

  async function cancel(id) {
    if (!confirm('Withdraw this request?')) return
    try { await reimbursementApi.cancel(id); load() } catch { /* ignore */ }
  }

  const totalPending = requests.filter((r) => r.status === 'pending').reduce((sum, r) => sum + r.amount, 0)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-muted">{totalPending > 0 ? `${formatMoney(totalPending)} awaiting approval` : 'Nothing pending right now'}</p>
        <button onClick={() => setShowForm(true)} className="bg-lime text-black font-bold text-sm px-4 py-2 rounded-lg hover:bg-lime-dark transition-all">
          + Request reimbursement
        </button>
      </div>

      {loading ? (
        <div className="h-40 rounded-xl animate-pulse bg-white/5" />
      ) : requests.length === 0 ? (
        <p className="py-16 text-sm text-center text-muted">No reimbursement requests yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {requests.map((r) => (
            <div key={r._id} className="flex items-center justify-between gap-3 p-4 bg-card border border-white/[0.08] rounded-xl flex-wrap">
              <div>
                <p className="text-sm font-semibold">{r.item} <span className="font-normal text-muted">· {formatMoney(r.amount)}</span></p>
                <p className="mt-0.5 text-xs text-muted">{formatDate(r.date)}</p>
                {r.note && <p className="mt-1 text-xs italic text-muted">"{r.note}"</p>}
                {r.status !== 'pending' && r.reviewNote && <p className="mt-1 text-xs italic text-muted">Note: "{r.reviewNote}"</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${STATUS_BADGE[r.status]}`}>{r.status}</span>
                {r.status === 'pending' && (
                  <button onClick={() => cancel(r._id)} className="text-xs font-semibold text-muted hover:text-red-400 transition-all">Withdraw</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && <ReimbursementRequestModal onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load() }} />}
    </div>
  )
}

function ReimbursementRequestModal({ onClose, onSaved }) {
  const today = new Date().toISOString().slice(0, 10)
  const [form, setForm] = useState({ item: '', date: today, amount: '', note: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (!form.item.trim()) { setError('Describe what was purchased or which service was paid for'); return }
    if (!form.amount || Number(form.amount) <= 0) { setError('Enter a valid amount'); return }
    setError(''); setLoading(true)
    try {
      await reimbursementApi.submit({ ...form, amount: Number(form.amount) })
      onSaved()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request')
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70">
      <div className="bg-card border border-white/[0.1] rounded-2xl w-full max-w-md p-7 relative">
        <button onClick={onClose} className="absolute text-xl leading-none top-4 right-5 text-muted hover:text-cream">×</button>
        <h2 className="mb-5 text-lg font-bold">Request reimbursement</h2>

        <form onSubmit={submit} className="flex flex-col gap-4">
          {error && <p className="px-3 py-2 text-sm text-red-400 border rounded-lg bg-red-500/10 border-red-500/20">{error}</p>}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted">What was purchased / which service was paid for</label>
            <input type="text" value={form.item} onChange={(e) => setForm((v) => ({ ...v, item: e.target.value }))}
              className="field-input" placeholder="e.g. Gym floor cleaning supplies" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted">Date</label>
              <input type="date" value={form.date} max={today}
                onChange={(e) => setForm((v) => ({ ...v, date: e.target.value }))} className="field-input" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted">Amount (₹)</label>
              <input type="number" min="0" step="0.01" value={form.amount}
                onChange={(e) => setForm((v) => ({ ...v, amount: e.target.value }))} className="field-input" placeholder="0.00" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted">Note <span className="text-muted/70">(optional)</span></label>
            <textarea rows={2} value={form.note} onChange={(e) => setForm((v) => ({ ...v, note: e.target.value }))}
              className="resize-none field-input" placeholder="Any extra context…" />
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

function ReimbursementApprovalsTab() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [statusFilter, setStatusFilter] = useState('pending')

  function load() {
    setLoading(true)
    const call = statusFilter === 'pending' ? reimbursementApi.pending() : reimbursementApi.list({ status: statusFilter || undefined })
    call.then(({ data }) => setRequests(data)).catch(() => {}).finally(() => setLoading(false))
  }
  useEffect(load, [statusFilter])

  async function approve(r) {
    setBusyId(r._id); setError('')
    try {
      await reimbursementApi.approve(r._id)
      setRequests((prev) => statusFilter === 'pending' ? prev.filter((x) => x._id !== r._id) : prev.map((x) => x._id === r._id ? { ...x, status: 'approved' } : x))
    } catch (err) { setError(err.response?.data?.message || 'Failed to approve') }
    finally { setBusyId(null) }
  }
  async function reject(r) {
    const reason = prompt('Reason for rejecting (optional):') || ''
    setBusyId(r._id); setError('')
    try {
      await reimbursementApi.reject(r._id, reason)
      setRequests((prev) => statusFilter === 'pending' ? prev.filter((x) => x._id !== r._id) : prev.map((x) => x._id === r._id ? { ...x, status: 'rejected' } : x))
    } catch (err) { setError(err.response?.data?.message || 'Failed to reject') }
    finally { setBusyId(null) }
  }
  async function markPaid(r) {
    setBusyId(r._id); setError('')
    try {
      await reimbursementApi.markPaid(r._id)
      setRequests((prev) => prev.map((x) => x._id === r._id ? { ...x, status: 'paid' } : x))
    } catch (err) { setError(err.response?.data?.message || 'Failed to mark as paid') }
    finally { setBusyId(null) }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-1.5 flex-wrap">
        {['pending', 'approved', 'rejected', 'paid'].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border capitalize transition-all ${statusFilter === s ? STATUS_BADGE[s] : 'text-muted border-white/10 hover:border-white/20'}`}>
            {s}
          </button>
        ))}
      </div>

      {error && <p className="px-3 py-2 text-sm text-red-400 border rounded-lg bg-red-500/10 border-red-500/20">{error}</p>}

      {loading ? (
        <div className="h-40 rounded-xl animate-pulse bg-white/5" />
      ) : requests.length === 0 ? (
        <p className="py-16 text-sm text-center text-muted">
          {statusFilter === 'pending' ? 'No pending reimbursement requests 🎉' : `No ${statusFilter} requests.`}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {requests.map((r) => (
            <div key={r._id} className="flex items-center justify-between gap-3 p-4 bg-card border border-white/[0.08] rounded-xl flex-wrap">
              <div>
                <p className="text-sm font-semibold">{r.staffId?.name || 'Staff member'} <span className="font-normal text-muted">· {r.staffId?.role}</span></p>
                <p className="mt-0.5 text-xs text-muted">{r.item} · {formatMoney(r.amount)} · {formatDate(r.date)}</p>
                {r.note && <p className="mt-1 text-xs italic text-muted">"{r.note}"</p>}
              </div>
              <div className="flex gap-2 shrink-0">
                {r.status === 'pending' && (
                  <>
                    <button disabled={busyId === r._id} onClick={() => approve(r)}
                      className="text-xs font-semibold text-black bg-lime px-2.5 py-1.5 rounded-lg hover:bg-lime-dark transition-all disabled:opacity-50">
                      Approve
                    </button>
                    <button disabled={busyId === r._id} onClick={() => reject(r)}
                      className="text-xs font-semibold text-red-400 border border-red-400/30 px-2.5 py-1.5 rounded-lg hover:bg-red-400/10 transition-all disabled:opacity-50">
                      Reject
                    </button>
                  </>
                )}
                {r.status === 'approved' && (
                  <button disabled={busyId === r._id} onClick={() => markPaid(r)}
                    className="text-xs font-semibold text-blue-400 border border-blue-400/30 px-2.5 py-1.5 rounded-lg hover:bg-blue-400/10 transition-all disabled:opacity-50">
                    Mark as paid
                  </button>
                )}
                {(r.status === 'rejected' || r.status === 'paid') && (
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${STATUS_BADGE[r.status]}`}>{r.status}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
