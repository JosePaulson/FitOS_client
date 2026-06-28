import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { memberApi, planApi } from '../../api/index'
import api from '../../api/axios'
import Select from '../../components/ui/Select'

const STATUS_COLORS = {
  active:    'bg-lime/10 text-lime',
  expired:   'bg-red-500/10 text-red-400',
  paused:    'bg-yellow-500/10 text-yellow-400',
  cancelled: 'bg-white/5 text-muted',
}

export default function Members() {
  const [searchParams] = useSearchParams()
  const [members, setMembers] = useState([])
  const [plans,   setPlans]   = useState([])
  const [total,   setTotal]   = useState(0)
  const [page,    setPage]    = useState(1)
  const [search,  setSearch]  = useState('')
  const [status,  setStatus]  = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(searchParams.get('action') === 'new')
  const [selected,  setSelected]  = useState(null)   // member for renew modal
  const [pinTarget,  setPinTarget]  = useState(null)   // member for set-pin modal
  const [pin,        setPin]        = useState('')
  const [pinLoading, setPinLoading] = useState(false)
  const [pinError,   setPinError]   = useState('')
  const [pinSuccess, setPinSuccess] = useState('')
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  const LIMIT = 15

  async function handleSetPin() {
    if (!pin || pin.length < 4) { setPinError('PIN must be 4–6 digits'); return }
    setPinLoading(true); setPinError('')
    try {
      const { data } = await api.post('/member-portal/auth/set-pin', {
        memberId: pinTarget._id,
        gymId:    pinTarget.gymId,
        pin,
      })
      setPinSuccess(data.message)
      setTimeout(() => { setPinTarget(null); setPinSuccess(''); setPin('') }, 1500)
    } catch (err) {
      setPinError(err.response?.data?.message || 'Failed to set PIN')
    } finally { setPinLoading(false) }
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await memberApi.list({ search, status, page, limit: LIMIT })
      setMembers(data.members)
      setTotal(data.total)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [search, status, page])

  useEffect(() => { load() }, [load])
  useEffect(() => { planApi.list().then(({ data }) => setPlans(data)) }, [])

  // Debounce search
  useEffect(() => { setPage(1) }, [search, status])

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Members</h1>
          <p className="text-muted text-sm mt-0.5">{total} total members</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setFormError('') }}
          className="bg-lime text-black font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-lime-dark transition-all"
        >
          + Add member
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input
          type="text" placeholder="Search name, phone, email…"
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="field-input flex-1"
        />
        <Select
          value={status}
          onChange={setStatus}
          options={[
            { value: 'active',    label: 'Active' },
            { value: 'expired',   label: 'Expired' },
            { value: 'paused',    label: 'Paused' },
            { value: 'cancelled', label: 'Cancelled' },
          ]}
          placeholder="All statuses"
          isClearable
          className="sm:w-48"
        />
      </div>

      {/* Table */}
      <div className="bg-card border border-white/[0.08] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-left">
                <th className="px-5 py-3 text-xs text-muted font-semibold uppercase tracking-wider">Member</th>
                <th className="px-5 py-3 text-xs text-muted font-semibold uppercase tracking-wider">Phone</th>
                <th className="px-5 py-3 text-xs text-muted font-semibold uppercase tracking-wider">Plan</th>
                <th className="px-5 py-3 text-xs text-muted font-semibold uppercase tracking-wider">Expires</th>
                <th className="px-5 py-3 text-xs text-muted font-semibold uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-xs text-muted font-semibold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-white/[0.05] rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-muted text-sm">
                    {search || status ? 'No members match your filters.' : 'No members yet. Add your first one!'}
                  </td>
                </tr>
              ) : members.map((m) => (
                <tr key={m._id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3.5 font-medium">{m.name}</td>
                  <td className="px-5 py-3.5 text-muted">{m.phone}</td>
                  <td className="px-5 py-3.5 text-muted">{m.currentPlanId?.name || '—'}</td>
                  <td className="px-5 py-3.5 text-muted">
                    {m.membershipExpiryDate
                      ? new Date(m.membershipExpiryDate).toLocaleDateString('en-IN')
                      : '—'}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[m.membershipStatus] || ''}`}>
                      {m.membershipStatus}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelected(m)}
                        className="text-xs text-lime hover:text-lime-dark font-medium"
                      >
                        Renew
                      </button>
                      <button
                        onClick={() => { setPinTarget(m); setPin(''); setPinError(''); setPinSuccess('') }}
                        className="text-xs text-muted hover:text-cream font-medium"
                        title="Set member portal PIN"
                      >
                        Set PIN
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > LIMIT && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.06]">
            <span className="text-xs text-muted">
              Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="text-xs px-3 py-1.5 border border-white/10 rounded-lg text-muted disabled:opacity-40 hover:text-cream hover:border-white/20 transition-all"
              >
                ← Prev
              </button>
              <button
                disabled={page * LIMIT >= total}
                onClick={() => setPage((p) => p + 1)}
                className="text-xs px-3 py-1.5 border border-white/10 rounded-lg text-muted disabled:opacity-40 hover:text-cream hover:border-white/20 transition-all"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add member modal */}
      {showForm && (
        <Modal title="Add new member" onClose={() => setShowForm(false)}>
          <AddMemberForm
            plans={plans}
            error={formError}
            loading={formLoading}
            onSubmit={async (form) => {
              setFormError('')
              setFormLoading(true)
              try {
                await memberApi.create(form)
                setShowForm(false)
                load()
              } catch (err) {
                setFormError(err.response?.data?.message || 'Failed to add member')
              } finally { setFormLoading(false) }
            }}
            onClose={() => setShowForm(false)}
          />
        </Modal>
      )}

      {/* Set PIN modal */}
      {pinTarget && (
        <Modal title={`Set portal PIN — ${pinTarget.name}`} onClose={() => setPinTarget(null)}>
          <div className="flex flex-col gap-4">
            <p className="text-muted text-sm">
              This PIN lets <span className="text-cream font-medium">{pinTarget.name}</span> log into the FitOS Member Portal at <span className="text-lime text-xs font-mono">member.fitos.in</span> using their phone number.
            </p>
            {pinError   && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">{pinError}</p>}
            {pinSuccess && <p className="text-lime text-sm bg-lime/10 border border-lime/20 px-3 py-2 rounded-lg">{pinSuccess}</p>}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted">PIN (4–6 digits)</label>
              <input
                type="password" inputMode="numeric" maxLength={6}
                value={pin} onChange={(e) => setPin(e.target.value)}
                className="field-input" placeholder="e.g. 1234"
              />
              <p className="text-[11px] text-muted">Share this PIN with the member. They can change it after logging in.</p>
            </div>
            <div className="flex gap-3 mt-1">
              <button onClick={() => setPinTarget(null)} className="flex-1 border border-white/10 text-muted py-2.5 rounded-lg text-sm hover:text-cream transition-all">Cancel</button>
              <button onClick={handleSetPin} disabled={pinLoading} className="flex-[2] bg-lime text-black font-bold py-2.5 rounded-lg text-sm hover:bg-lime-dark transition-all disabled:opacity-60">
                {pinLoading ? 'Setting…' : 'Set PIN'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Renew modal */}
      {selected && (
        <Modal title={`Renew — ${selected.name}`} onClose={() => setSelected(null)}>
          <RenewForm
            member={selected} plans={plans}
            onSubmit={async (planId) => {
              try {
                await memberApi.renew(selected._id, planId)
                setSelected(null)
                load()
              } catch (err) {
                alert(err.response?.data?.message || 'Renewal failed')
              }
            }}
            onClose={() => setSelected(null)}
          />
        </Modal>
      )}
    </div>
  )
}

/* ── Sub-components ──────────────────────────────────────────────────────── */

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
      <div className="bg-card border border-white/[0.1] rounded-2xl w-full max-w-md p-7 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted hover:text-cream text-xl leading-none">×</button>
        <h2 className="font-bold text-lg mb-5">{title}</h2>
        {children}
      </div>
    </div>
  )
}

function AddMemberForm({ plans, error, loading, onSubmit, onClose }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', planId: '', source: 'walk-in' })
  const set = (f) => (e) => setForm((v) => ({ ...v, [f]: e.target.value }))

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form) }} className="flex flex-col gap-4">
      {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">{error}</p>}
      <Field label="Full name *"><input type="text" value={form.name} onChange={set('name')} className="field-input" placeholder="Rahul Sharma" /></Field>
      <Field label="Phone *"><input type="tel" value={form.phone} onChange={set('phone')} className="field-input" placeholder="+91 98765 43210" /></Field>
      <Field label="Email"><input type="email" value={form.email} onChange={set('email')} className="field-input" placeholder="optional" /></Field>
      <Field label="Membership plan *">
        <Select
          value={form.planId}
          onChange={(val) => setForm((v) => ({ ...v, planId: val }))}
          options={plans.map((p) => ({ value: p._id, label: `${p.name} — ₹${p.price} incl. GST / ${p.durationDays}d` }))}
          placeholder="Select plan"
        />
      </Field>
      <Field label="Source">
        <Select
          value={form.source}
          onChange={(val) => setForm((v) => ({ ...v, source: val }))}
          options={['walk-in','referral','social','lead','online','other'].map((s) => ({ value: s, label: s }))}
          placeholder="Select source"
        />
      </Field>
      <div className="flex gap-3 mt-1">
        <button type="button" onClick={onClose} className="flex-1 border border-white/10 text-muted py-2.5 rounded-lg text-sm hover:text-cream transition-all">Cancel</button>
        <button type="submit" disabled={loading} className="flex-[2] bg-lime text-black font-bold py-2.5 rounded-lg text-sm hover:bg-lime-dark transition-all disabled:opacity-60">
          {loading ? 'Adding…' : 'Add member'}
        </button>
      </div>
    </form>
  )
}

function RenewForm({ member, plans, onSubmit, onClose }) {
  const [planId, setPlanId] = useState(member.currentPlanId?._id || '')
  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted text-sm">
        Current expiry:{' '}
        <span className="text-cream font-medium">
          {member.membershipExpiryDate
            ? new Date(member.membershipExpiryDate).toLocaleDateString('en-IN')
            : 'Not set'}
        </span>
      </p>
      <Field label="Select plan">
        <Select
          value={planId}
          onChange={setPlanId}
          options={plans.map((p) => ({ value: p._id, label: `${p.name} — ₹${p.price} incl. GST / ${p.durationDays}d` }))}
          placeholder="Choose plan"
        />
      </Field>
      <div className="flex gap-3 mt-1">
        <button onClick={onClose} className="flex-1 border border-white/10 text-muted py-2.5 rounded-lg text-sm hover:text-cream transition-all">Cancel</button>
        <button onClick={() => onSubmit(planId)} disabled={!planId} className="flex-[2] bg-lime text-black font-bold py-2.5 rounded-lg text-sm hover:bg-lime-dark transition-all disabled:opacity-60">
          Renew membership
        </button>
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
