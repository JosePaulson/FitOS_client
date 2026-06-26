import { useEffect, useState } from 'react'
import { staffApi } from '../../api/index'
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
                      {s._id !== me?._id && (
                        <button
                          onClick={() => toggleActive(s)}
                          className={`text-xs font-medium transition-colors ${s.isActive ? 'text-red-400/70 hover:text-red-400' : 'text-lime hover:text-lime-dark'
                            }`}
                        >
                          {s.isActive ? 'Deactivate' : 'Reactivate'}
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
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