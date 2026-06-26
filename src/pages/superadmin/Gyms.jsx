import { useEffect, useState, useCallback } from 'react'
import { saasAdminApi } from '../../api/index'
import Select from '../../components/ui/Select'

const STATUS_STYLES = {
  active: 'bg-lime/10 text-lime',
  trialing: 'bg-yellow-400/10 text-yellow-400',
  past_due: 'bg-red-400/10 text-red-400',
  cancelled: 'bg-white/5 text-muted',
  paused: 'bg-blue-400/10 text-blue-400',
}

const PLANS = ['lite', 'basic', 'pro']
const STATUSES = ['trialing', 'active', 'past_due', 'cancelled', 'paused']
const LIMIT = 15

export default function SAGyms() {
  const [gyms, setGyms] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [planF, setPlanF] = useState('')
  const [statusF, setStatusF] = useState('')
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)   // gym being edited
  const [saving, setSaving] = useState(false)
  const [saveErr, setSaveErr] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await saasAdminApi.gyms({ page, limit: LIMIT, plan: planF, status: statusF, search })
      setGyms(data.gyms)
      setTotal(data.total)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [page, planF, statusF, search])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [search, planF, statusF])

  async function handleSave(gymId, updates) {
    setSaving(true); setSaveErr('')
    try {
      await saasAdminApi.updateGym(gymId, updates)
      setEditing(null)
      load()
    } catch (err) {
      setSaveErr(err.response?.data?.message || 'Update failed')
    } finally { setSaving(false) }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">All gyms</h1>
        <p className="text-muted text-sm mt-0.5">{total} gyms registered on FitOS</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input
          type="text" placeholder="Search by gym name…"
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="flex-1 field-input min-w-48"
        />
        <Select
          value={planF}
          onChange={setPlanF}
          options={PLANS.map((p) => ({ value: p, label: p }))}
          placeholder="All plans"
          isClearable
          className="w-44"
        />
        <Select
          value={statusF}
          onChange={setStatusF}
          options={STATUSES.map((s) => ({ value: s, label: s.replace('_', ' ') }))}
          placeholder="All statuses"
          isClearable
          className="w-48"
        />
      </div>

      {/* Table */}
      <div className="bg-card border border-white/[0.08] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-left">
                {['Gym', 'Owner', 'Plan', 'Status', 'Members', 'Subdomain', 'Registered', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs font-semibold tracking-wider uppercase text-muted whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="h-4 bg-white/[0.05] rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : gyms.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-sm text-center text-muted">
                    No gyms found.
                  </td>
                </tr>
              ) : gyms.map((gym) => (
                <tr key={gym._id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3.5 font-medium max-w-[160px] truncate">{gym.name}</td>
                  <td className="px-4 py-3.5">
                    <div className="text-xs">
                      <div className="font-medium truncate max-w-[120px]">{gym.ownerUserId?.name || '—'}</div>
                      <div className="text-muted truncate max-w-[120px]">{gym.ownerUserId?.email || ''}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs font-semibold tracking-wider uppercase text-muted">{gym.plan}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[gym.planStatus] || ''}`}>
                      {gym.planStatus?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center font-semibold">{gym.memberCount ?? 0}</td>
                  <td className="px-4 py-3.5 text-muted text-xs font-mono">{gym.subdomain}.fitos.in</td>
                  <td className="px-4 py-3.5 text-muted text-xs whitespace-nowrap">
                    {new Date(gym.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-4 py-3.5">
                    <button
                      onClick={() => { setEditing(gym); setSaveErr('') }}
                      className="text-xs font-medium text-red-400 hover:text-red-300 whitespace-nowrap"
                    >
                      Edit plan
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > LIMIT && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.06]">
            <span className="text-xs text-muted">
              {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}
            </span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}
                className="text-xs px-3 py-1.5 border border-white/10 rounded-lg text-muted disabled:opacity-40 hover:text-cream hover:border-white/20 transition-all">
                ← Prev
              </button>
              <button disabled={page * LIMIT >= total} onClick={() => setPage((p) => p + 1)}
                className="text-xs px-3 py-1.5 border border-white/10 rounded-lg text-muted disabled:opacity-40 hover:text-cream hover:border-white/20 transition-all">
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit plan modal */}
      {editing && (
        <EditGymModal
          gym={editing}
          saving={saving}
          error={saveErr}
          onSave={(updates) => handleSave(editing._id, updates)}
          onClose={() => { setEditing(null); setSaveErr('') }}
        />
      )}
    </div>
  )
}

function EditGymModal({ gym, saving, error, onSave, onClose }) {
  const [form, setForm] = useState({
    plan: gym.plan,
    planStatus: gym.planStatus,
    trialEndsAt: gym.trialEndsAt ? new Date(gym.trialEndsAt).toISOString().split('T')[0] : '',
  })
  const set = (f) => (e) => setForm((v) => ({ ...v, [f]: e.target.value }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70">
      <div className="bg-card border border-white/[0.1] rounded-2xl w-full max-w-md p-7">
        <button onClick={onClose} className="absolute text-2xl leading-none top-4 right-5 text-muted hover:text-cream">×</button>
        <h2 className="mb-1 text-lg font-bold">Edit gym subscription</h2>
        <p className="mb-5 text-sm truncate text-muted">{gym.name} · {gym.subdomain}.fitos.in</p>

        {error && <p className="px-3 py-2 mb-4 text-sm text-red-400 border rounded-lg bg-red-500/10 border-red-500/20">{error}</p>}

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted">Plan</label>
            <Select
              value={form.plan}
              onChange={(val) => setForm((v) => ({ ...v, plan: val }))}
              options={PLANS.map((p) => ({ value: p, label: p }))}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted">Status</label>
            <Select
              value={form.planStatus}
              onChange={(val) => setForm((v) => ({ ...v, planStatus: val }))}
              options={STATUSES.map((s) => ({ value: s, label: s.replace('_', ' ') }))}
            />
          </div>
          {form.planStatus === 'trialing' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted">Trial ends on</label>
              <input type="date" value={form.trialEndsAt} onChange={set('trialEndsAt')} className="field-input" />
            </div>
          )}

          <div className="px-4 py-3 text-xs border rounded-lg bg-yellow-400/5 border-yellow-400/20 text-yellow-400/80">
            ⚠️ Changes take effect immediately. This bypasses Razorpay — use only for manual overrides or support cases.
          </div>

          <div className="flex gap-3 mt-1">
            <button onClick={onClose} className="flex-1 border border-white/10 text-muted py-2.5 rounded-lg text-sm hover:text-cream transition-all">Cancel</button>
            <button
              onClick={() => onSave({
                plan: form.plan,
                planStatus: form.planStatus,
                ...(form.trialEndsAt ? { trialEndsAt: form.trialEndsAt } : {}),
              })}
              disabled={saving}
              className="flex-[2] bg-red-500 text-white font-bold py-2.5 rounded-lg text-sm hover:bg-red-600 transition-all disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}