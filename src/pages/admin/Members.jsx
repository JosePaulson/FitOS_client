// import { useEffect, useState, useCallback } from 'react'
// import { useSearchParams } from 'react-router-dom'
// import { memberApi, planApi } from '../../api/index'
// import api from '../../api/axios'
// import Select from '../../components/ui/Select'

// const STATUS_COLORS = {
//   active: 'bg-lime/10 text-lime',
//   expired: 'bg-red-500/10 text-red-400',
//   paused: 'bg-yellow-500/10 text-yellow-400',
//   cancelled: 'bg-white/5 text-muted',
// }

// export default function Members() {
//   const [searchParams] = useSearchParams()
//   const [members, setMembers] = useState([])
//   const [plans, setPlans] = useState([])
//   const [total, setTotal] = useState(0)
//   const [page, setPage] = useState(1)
//   const [search, setSearch] = useState('')
//   const [status, setStatus] = useState('')
//   const [loading, setLoading] = useState(true)
//   const [showForm, setShowForm] = useState(searchParams.get('action') === 'new')
//   const [selected, setSelected] = useState(null)
//   const [pinTarget, setPinTarget] = useState(null)
//   const [pin, setPin] = useState('')
//   const [pinLoading, setPinLoading] = useState(false)
//   const [pinError, setPinError] = useState('')
//   const [pinSuccess, setPinSuccess] = useState('')
//   const [formError, setFormError] = useState('')
//   const [formLoading, setFormLoading] = useState(false)
//   const [editingMember, setEditingMember] = useState(null)
//   const [deleteTarget, setDeleteTarget] = useState(null)
//   const [deleteLoading, setDeleteLoading] = useState(false)
//   const [deleteError, setDeleteError] = useState('')

//   const LIMIT = 15

//   async function handleSetPin() {
//     if (!pin || pin.length < 4) {
//       setPinError('PIN must be 4–6 digits')
//       return
//     }
//     setPinLoading(true)
//     setPinError('')
//     try {
//       const { data } = await api.post('/member-portal/auth/set-pin', {
//         memberId: pinTarget._id,
//         gymId: pinTarget.gymId,
//         pin,
//       })
//       setPinSuccess(data.message)
//       setTimeout(() => {
//         setPinTarget(null)
//         setPinSuccess('')
//         setPin('')
//       }, 1500)
//     } catch (err) {
//       setPinError(err.response?.data?.message || 'Failed to set PIN')
//     } finally {
//       setPinLoading(false)
//     }
//   }

//   const load = useCallback(async () => {
//     setLoading(true)
//     try {
//       const { data } = await memberApi.list({ search, status, page, limit: LIMIT })
//       setMembers(data.members)
//       setTotal(data.total)
//     } catch {
//       // ignore
//     } finally {
//       setLoading(false)
//     }
//   }, [search, status, page])

//   useEffect(() => {
//     load()
//   }, [load])

//   useEffect(() => {
//     planApi.list().then(({ data }) => setPlans(data))
//   }, [])

//   useEffect(() => {
//     setPage(1)
//   }, [search, status])

//   return (
//     <div className="max-w-6xl mx-auto">
//       <div className="flex items-center justify-between mb-6">
//         <div>
//           <h1 className="text-2xl font-bold tracking-tight">Members</h1>
//           <p className="text-muted text-sm mt-0.5">{total} total members</p>
//         </div>
//         <button
//           onClick={() => {
//             setEditingMember(null)
//             setShowForm(true)
//             setFormError('')
//           }}
//           className="bg-lime text-black font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-lime-dark transition-all"
//         >
//           + Add member
//         </button>
//       </div>

//       <div className="flex flex-col gap-3 mb-5 sm:flex-row">
//         <input
//           type="text"
//           placeholder="Search name, phone, email…"
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           className="flex-1 field-input"
//         />
//         <Select
//           value={status}
//           onChange={setStatus}
//           options={[
//             { value: 'active', label: 'Active' },
//             { value: 'expired', label: 'Expired' },
//             { value: 'paused', label: 'Paused' },
//             { value: 'cancelled', label: 'Cancelled' },
//           ]}
//           placeholder="All statuses"
//           isClearable
//           className="sm:w-48"
//         />
//       </div>

//       <div className="bg-card border border-white/[0.08] rounded-xl overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full text-sm">
//             <thead>
//               <tr className="border-b border-white/[0.06] text-left">
//                 <th className="px-5 py-3 text-xs font-semibold tracking-wider uppercase text-muted">Member</th>
//                 <th className="px-5 py-3 text-xs font-semibold tracking-wider uppercase text-muted">Phone</th>
//                 <th className="px-5 py-3 text-xs font-semibold tracking-wider uppercase text-muted">Plan</th>
//                 <th className="px-5 py-3 text-xs font-semibold tracking-wider uppercase text-muted">Expires</th>
//                 <th className="px-5 py-3 text-xs font-semibold tracking-wider uppercase text-muted">Status</th>
//                 <th className="px-5 py-3 text-xs font-semibold tracking-wider uppercase text-muted">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-white/[0.04]">
//               {loading ? (
//                 Array.from({ length: 6 }).map((_, i) => (
//                   <tr key={i}>
//                     {Array.from({ length: 6 }).map((_, j) => (
//                       <td key={j} className="px-5 py-4">
//                         <div className="h-4 bg-white/[0.05] rounded animate-pulse" />
//                       </td>
//                     ))}
//                   </tr>
//                 ))
//               ) : members.length === 0 ? (
//                 <tr>
//                   <td colSpan={6} className="px-5 py-12 text-sm text-center text-muted">
//                     {search || status ? 'No members match your filters.' : 'No members yet. Add your first one!'}
//                   </td>
//                 </tr>
//               ) : (
//                 members.map((m) => (
//                   <tr key={m._id} className="hover:bg-white/[0.02] transition-colors">
//                     <td className="px-5 py-3.5 font-medium">{m.name}</td>
//                     <td className="px-5 py-3.5 text-muted">{m.phone}</td>
//                     <td className="px-5 py-3.5 text-muted">{m.currentPlanId?.name || '—'}</td>
//                     <td className="px-5 py-3.5 text-muted">
//                       {m.membershipExpiryDate ? new Date(m.membershipExpiryDate).toLocaleDateString('en-IN') : '—'}
//                     </td>
//                     <td className="px-5 py-3.5">
//                       <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[m.membershipStatus] || ''}`}>
//                         {m.membershipStatus}
//                       </span>
//                     </td>
//                     <td className="px-5 py-3.5">
//                       <div className="flex flex-wrap items-center gap-3">
//                         <button
//                           onClick={() => setSelected(m)}
//                           className="text-xs font-medium text-lime hover:text-lime-dark"
//                         >
//                           Renew
//                         </button>

//                         <button
//                           onClick={() => {
//                             setEditingMember(m)
//                             setShowForm(true)
//                             setFormError('')
//                           }}
//                           className="text-xs font-medium text-blue-400 hover:text-blue-300"
//                         >
//                           Edit
//                         </button>

//                         <button
//                           onClick={() => {
//                             setDeleteTarget(m)
//                             setDeleteError('')
//                           }}
//                           className="text-xs font-medium text-red-400 hover:text-red-300"
//                         >
//                           Delete
//                         </button>

//                         <button
//                           onClick={() => {
//                             setPinTarget(m)
//                             setPin('')
//                             setPinError('')
//                             setPinSuccess('')
//                           }}
//                           className="px-2 py-1 text-xs font-medium text-red-500 rounded-full bg-red-600/10 hover:bg-red-300/20"
//                           title="Set member portal PIN"
//                         >
//                           Set PIN
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>

//         {total > LIMIT && (
//           <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.06]">
//             <span className="text-xs text-muted">
//               Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}
//             </span>
//             <div className="flex gap-2">
//               <button
//                 disabled={page === 1}
//                 onClick={() => setPage((p) => p - 1)}
//                 className="text-xs px-3 py-1.5 border border-white/10 rounded-lg text-muted disabled:opacity-40 hover:text-cream hover:border-white/20 transition-all"
//               >
//                 ← Prev
//               </button>
//               <button
//                 disabled={page * LIMIT >= total}
//                 onClick={() => setPage((p) => p + 1)}
//                 className="text-xs px-3 py-1.5 border border-white/10 rounded-lg text-muted disabled:opacity-40 hover:text-cream hover:border-white/20 transition-all"
//               >
//                 Next →
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

//       {showForm && (
//         <Modal
//           title={editingMember ? `Edit member — ${editingMember.name}` : 'Add new member'}
//           onClose={() => {
//             setShowForm(false)
//             setEditingMember(null)
//           }}
//         >
//           <AddMemberForm
//             plans={plans}
//             error={formError}
//             loading={formLoading}
//             initialValues={editingMember}
//             onSubmit={async (form) => {
//               setFormError('')
//               setFormLoading(true)
//               try {
//                 if (editingMember) {
//                   await memberApi.update(editingMember._id, form)
//                 } else {
//                   await memberApi.create(form)
//                 }
//                 setShowForm(false)
//                 setEditingMember(null)
//                 load()
//               } catch (err) {
//                 setFormError(err.response?.data?.message || 'Failed to save member')
//               } finally {
//                 setFormLoading(false)
//               }
//             }}
//             onClose={() => {
//               setShowForm(false)
//               setEditingMember(null)
//             }}
//           />
//         </Modal>
//       )}

//       {deleteTarget && (
//         <Modal title={`Delete member — ${deleteTarget.name}`} onClose={() => setDeleteTarget(null)}>
//           <div className="flex flex-col gap-4">
//             <p className="text-sm text-muted">
//               This will archive the member and remove them from the active list.
//             </p>
//             {deleteError && (
//               <p className="px-3 py-2 text-sm text-red-400 border rounded-lg bg-red-500/10 border-red-500/20">
//                 {deleteError}
//               </p>
//             )}
//             <div className="flex gap-3 mt-1">
//               <button
//                 onClick={() => setDeleteTarget(null)}
//                 className="flex-1 border border-white/10 text-muted py-2.5 rounded-lg text-sm hover:text-cream transition-all"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={async () => {
//                   setDeleteLoading(true)
//                   setDeleteError('')
//                   try {
//                     await memberApi.remove(deleteTarget._id)
//                     setDeleteTarget(null)
//                     load()
//                   } catch (err) {
//                     setDeleteError(err.response?.data?.message || 'Failed to delete member')
//                   } finally {
//                     setDeleteLoading(false)
//                   }
//                 }}
//                 disabled={deleteLoading}
//                 className="flex-[2] bg-red-500 text-white font-bold py-2.5 rounded-lg text-sm hover:bg-red-600 transition-all disabled:opacity-60"
//               >
//                 {deleteLoading ? 'Deleting…' : 'Delete member'}
//               </button>
//             </div>
//           </div>
//         </Modal>
//       )}

//       {pinTarget && (
//         <Modal title={`Set portal PIN — ${pinTarget.name}`} onClose={() => setPinTarget(null)}>
//           <div className="flex flex-col gap-4">
//             <p className="text-sm text-muted">
//               This PIN lets <span className="font-medium text-cream">{pinTarget.name}</span> log into the FitOS Member Portal at{' '}
//               <span className="font-mono text-xs text-lime">member.fitos.in</span> using their phone number.
//             </p>
//             {pinError && <p className="px-3 py-2 text-sm text-red-400 border rounded-lg bg-red-500/10 border-red-500/20">{pinError}</p>}
//             {pinSuccess && <p className="px-3 py-2 text-sm border rounded-lg text-lime bg-lime/10 border-lime/20">{pinSuccess}</p>}
//             <div className="flex flex-col gap-1.5">
//               <label className="text-xs font-medium text-muted">PIN (4–6 digits)</label>
//               <input
//                 type="password"
//                 inputMode="numeric"
//                 maxLength={6}
//                 value={pin}
//                 onChange={(e) => setPin(e.target.value)}
//                 className="field-input"
//                 placeholder="e.g. 1234"
//               />
//               <p className="text-[11px] text-muted">Share this PIN with the member. They can change it after logging in.</p>
//             </div>
//             <div className="flex gap-3 mt-1">
//               <button
//                 onClick={() => setPinTarget(null)}
//                 className="flex-1 border border-white/10 text-muted py-2.5 rounded-lg text-sm hover:text-cream transition-all"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleSetPin}
//                 disabled={pinLoading}
//                 className="flex-[2] bg-lime text-black font-bold py-2.5 rounded-lg text-sm hover:bg-lime-dark transition-all disabled:opacity-60"
//               >
//                 {pinLoading ? 'Setting…' : 'Set PIN'}
//               </button>
//             </div>
//           </div>
//         </Modal>
//       )}

//       {selected && (
//         <Modal title={`Renew — ${selected.name}`} onClose={() => setSelected(null)}>
//           <RenewForm
//             member={selected}
//             plans={plans}
//             onSubmit={async (planId) => {
//               try {
//                 await memberApi.renew(selected._id, planId)
//                 setSelected(null)
//                 load()
//               } catch (err) {
//                 alert(err.response?.data?.message || 'Renewal failed')
//               }
//             }}
//             onClose={() => setSelected(null)}
//           />
//         </Modal>
//       )}
//     </div>
//   )
// }

// function Modal({ title, onClose, children }) {
//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70">
//       <div className="bg-card border border-white/[0.1] rounded-2xl w-full max-w-md p-7 relative">
//         <button onClick={onClose} className="absolute text-xl leading-none top-4 right-4 text-muted hover:text-cream">
//           ×
//         </button>
//         <h2 className="mb-5 text-lg font-bold">{title}</h2>
//         {children}
//       </div>
//     </div>
//   )
// }

// function AddMemberForm({ plans, error, loading, initialValues, onSubmit, onClose }) {
//   const [form, setForm] = useState({
//     name: initialValues?.name || '',
//     phone: initialValues?.phone || '',
//     email: initialValues?.email || '',
//     planId: initialValues?.currentPlanId?._id || '',
//     source: initialValues?.source || 'walk-in',
//   })

//   useEffect(() => {
//     setForm({
//       name: initialValues?.name || '',
//       phone: initialValues?.phone || '',
//       email: initialValues?.email || '',
//       planId: initialValues?.currentPlanId?._id || '',
//       source: initialValues?.source || 'walk-in',
//     })
//   }, [initialValues])

//   const set = (f) => (e) => setForm((v) => ({ ...v, [f]: e.target.value }))

//   return (
//     <form onSubmit={(e) => { e.preventDefault(); onSubmit(form) }} className="flex flex-col gap-4">
//       {error && <p className="px-3 py-2 text-sm text-red-400 border rounded-lg bg-red-500/10 border-red-500/20">{error}</p>}
//       <Field label="Full name *">
//         <input type="text" value={form.name} onChange={set('name')} className="field-input" placeholder="Rahul Sharma" />
//       </Field>
//       <Field label="Phone *">
//         <input type="tel" value={form.phone} onChange={set('phone')} className="field-input" placeholder="+91 98765 43210" />
//       </Field>
//       <Field label="Email">
//         <input type="email" value={form.email} onChange={set('email')} className="field-input" placeholder="optional" />
//       </Field>
//       <Field label="Membership plan *">
//         <Select
//           value={form.planId}
//           onChange={(val) => setForm((v) => ({ ...v, planId: val }))}
//           options={plans.map((p) => ({ value: p._id, label: `${p.name} — ₹${p.price} incl. GST / ${p.durationDays}d` }))}
//           placeholder="Select plan"
//         />
//       </Field>
//       <Field label="Source">
//         <Select
//           value={form.source}
//           onChange={(val) => setForm((v) => ({ ...v, source: val }))}
//           options={['walk-in', 'referral', 'social', 'lead', 'online', 'other'].map((s) => ({ value: s, label: s }))}
//           placeholder="Select source"
//         />
//       </Field>
//       <div className="flex gap-3 mt-1">
//         <button
//           type="button"
//           onClick={onClose}
//           className="flex-1 border border-white/10 text-muted py-2.5 rounded-lg text-sm hover:text-cream transition-all"
//         >
//           Cancel
//         </button>
//         <button
//           type="submit"
//           disabled={loading}
//           className="flex-[2] bg-lime text-black font-bold py-2.5 rounded-lg text-sm hover:bg-lime-dark transition-all disabled:opacity-60"
//         >
//           {loading ? 'Saving…' : initialValues ? 'Update member' : 'Add member'}
//         </button>
//       </div>
//     </form>
//   )
// }

// function RenewForm({ member, plans, onSubmit, onClose }) {
//   const [planId, setPlanId] = useState(member.currentPlanId?._id || '')

//   return (
//     <div className="flex flex-col gap-4">
//       <p className="text-sm text-muted">
//         Current expiry:{' '}
//         <span className="font-medium text-cream">
//           {member.membershipExpiryDate ? new Date(member.membershipExpiryDate).toLocaleDateString('en-IN') : 'Not set'}
//         </span>
//       </p>
//       <Field label="Select plan">
//         <Select
//           value={planId}
//           onChange={setPlanId}
//           options={plans.map((p) => ({ value: p._id, label: `${p.name} — ₹${p.price} incl. GST / ${p.durationDays}d` }))}
//           placeholder="Choose plan"
//         />
//       </Field>
//       <div className="flex gap-3 mt-1">
//         <button
//           onClick={onClose}
//           className="flex-1 border border-white/10 text-muted py-2.5 rounded-lg text-sm hover:text-cream transition-all"
//         >
//           Cancel
//         </button>
//         <button
//           onClick={() => onSubmit(planId)}
//           disabled={!planId}
//           className="flex-[2] bg-lime text-black font-bold py-2.5 rounded-lg text-sm hover:bg-lime-dark transition-all disabled:opacity-60"
//         >
//           Renew membership
//         </button>
//       </div>
//     </div>
//   )
// }

// function Field({ label, children }) {
//   return (
//     <div className="flex flex-col gap-1.5">
//       <label className="text-xs font-medium text-muted">{label}</label>
//       {children}
//     </div>
//   )
// }

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { memberApi, planApi } from '../../api/index'
import api from '../../api/axios'
import Select from '../../components/ui/Select'

const STATUS_COLORS = {
  active: 'bg-lime/10 text-lime',
  expired: 'bg-red-500/10 text-red-400',
  paused: 'bg-yellow-500/10 text-yellow-400',
  cancelled: 'bg-white/5 text-muted',
}

// Empty-string optional fields (dob/age/gender/height) must not be sent as
// '' — Mongoose will try to cast '' to Date/Number and throw. Strip them.
function cleanMemberPayload(form) {
  const payload = { ...form }
    ;['dob', 'age', 'gender', 'height', 'email', 'healthNotes', 'membershipStartDate', 'membershipExpiryDate', 'currentPlanId'].forEach((k) => {
      if (payload[k] === '') delete payload[k]
    })
  if (payload.age !== undefined) payload.age = Number(payload.age)
  if (payload.height !== undefined) payload.height = Number(payload.height)
  return payload
}

export default function Members() {
  const [searchParams] = useSearchParams()
  const [members, setMembers] = useState([])
  const [plans, setPlans] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(searchParams.get('action') === 'new')
  const [selected, setSelected] = useState(null)   // member for renew modal
  const [editing, setEditing] = useState(null)   // member being edited
  const [editError, setEditError] = useState('')
  const [editLoading, setEditLoading] = useState(false)
  const [pinTarget, setPinTarget] = useState(null)   // member for set-pin modal
  const [pin, setPin] = useState('')
  const [pinLoading, setPinLoading] = useState(false)
  const [pinError, setPinError] = useState('')
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
        gymId: pinTarget.gymId,
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
      <div className="flex flex-col gap-3 mb-5 sm:flex-row">
        <input
          type="text" placeholder="Search name, phone, email…"
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="flex-1 field-input"
        />
        <Select
          value={status}
          onChange={setStatus}
          options={[
            { value: 'active', label: 'Active' },
            { value: 'expired', label: 'Expired' },
            { value: 'paused', label: 'Paused' },
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
                <th className="px-5 py-3 text-xs font-semibold tracking-wider uppercase text-muted">Member</th>
                <th className="px-5 py-3 text-xs font-semibold tracking-wider uppercase text-muted">Phone</th>
                <th className="px-5 py-3 text-xs font-semibold tracking-wider uppercase text-muted">Plan</th>
                <th className="px-5 py-3 text-xs font-semibold tracking-wider uppercase text-muted">Expires</th>
                <th className="px-5 py-3 text-xs font-semibold tracking-wider uppercase text-muted">Status</th>
                <th className="px-5 py-3 text-xs font-semibold tracking-wider uppercase text-muted">Actions</th>
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
                  <td colSpan={6} className="px-5 py-12 text-sm text-center text-muted">
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
                        onClick={() => { setEditing(m); setEditError('') }}
                        className="text-xs font-medium text-muted hover:text-cream"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setSelected(m)}
                        className="text-xs font-medium text-lime hover:text-lime-dark"
                      >
                        Renew
                      </button>
                      <button
                        onClick={() => { setPinTarget(m); setPin(''); setPinError(''); setPinSuccess('') }}
                        className="text-xs font-medium text-muted hover:text-cream"
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
                await memberApi.create(cleanMemberPayload(form))
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

      {/* Edit member modal */}
      {editing && (
        <Modal title={`Edit — ${editing.name}`} onClose={() => setEditing(null)}>
          <EditMemberForm
            member={editing}
            plans={plans}
            error={editError}
            loading={editLoading}
            onSubmit={async (form) => {
              setEditError('')
              setEditLoading(true)
              try {
                await memberApi.update(editing._id, cleanMemberPayload(form))
                setEditing(null)
                load()
              } catch (err) {
                setEditError(err.response?.data?.message || 'Failed to save changes')
              } finally { setEditLoading(false) }
            }}
            onClose={() => setEditing(null)}
          />
        </Modal>
      )}

      {/* Set PIN modal */}
      {pinTarget && (
        <Modal title={`Set portal PIN — ${pinTarget.name}`} onClose={() => setPinTarget(null)}>
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted">
              This PIN lets <span className="font-medium text-cream">{pinTarget.name}</span> log into the FitOS Member Portal at <span className="font-mono text-xs text-lime">member.fitos.in</span> using their phone number.
            </p>
            {pinError && <p className="px-3 py-2 text-sm text-red-400 border rounded-lg bg-red-500/10 border-red-500/20">{pinError}</p>}
            {pinSuccess && <p className="px-3 py-2 text-sm border rounded-lg text-lime bg-lime/10 border-lime/20">{pinSuccess}</p>}
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
            onSubmit={async (planId, startDate) => {
              try {
                await memberApi.renew(selected._id, planId, startDate || undefined)
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
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70">
      <div className="bg-card border border-white/[0.1] rounded-2xl w-full max-w-md p-7 relative">
        <button onClick={onClose} className="absolute text-xl leading-none top-4 right-4 text-muted hover:text-cream">×</button>
        <h2 className="mb-5 text-lg font-bold">{title}</h2>
        {children}
      </div>
    </div>
  )
}

// Human-readable plan option label, respecting the new days/months duration model.
function planLabel(p) {
  const duration = p.durationUnit === 'months'
    ? `${p.durationValue ?? Math.round((p.durationDays || 0) / 30)}mo`
    : `${p.durationValue ?? p.durationDays}d`
  return `${p.name} — ₹${p.price} incl. GST / ${duration}`
}

function AddMemberForm({ plans, error, loading, onSubmit, onClose }) {
  const [form, setForm] = useState({
    name: '', phone: '', email: '', planId: '', source: 'walk-in',
    dob: '', age: '', gender: '', height: '', membershipStartDate: '',
  })
  const set = (f) => (e) => setForm((v) => ({ ...v, [f]: e.target.value }))

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form) }} className="flex flex-col gap-4">
      {error && <p className="px-3 py-2 text-sm text-red-400 border rounded-lg bg-red-500/10 border-red-500/20">{error}</p>}
      <Field label="Full name *"><input type="text" value={form.name} onChange={set('name')} className="field-input" placeholder="Rahul Sharma" /></Field>
      <Field label="Phone *"><input type="tel" value={form.phone} onChange={set('phone')} className="field-input" placeholder="+91 98765 43210" /></Field>
      <Field label="Email"><input type="email" value={form.email} onChange={set('email')} className="field-input" placeholder="optional" /></Field>
      <Field label="Membership plan *">
        <Select
          value={form.planId}
          onChange={(val) => setForm((v) => ({ ...v, planId: val }))}
          options={plans.map((p) => ({ value: p._id, label: planLabel(p) }))}
          placeholder="Select plan"
        />
      </Field>
      <Field label="Membership start date">
        <input type="date" value={form.membershipStartDate} onChange={set('membershipStartDate')} className="field-input" />
        <p className="text-[11px] mt-1 text-muted">Defaults to today. Can be set to any date — past or future.</p>
      </Field>
      <Field label="Source">
        <Select
          value={form.source}
          onChange={(val) => setForm((v) => ({ ...v, source: val }))}
          options={['walk-in', 'referral', 'social', 'lead', 'online', 'other'].map((s) => ({ value: s, label: s }))}
          placeholder="Select source"
        />
      </Field>

      {/* Optional body/birthday info — can also be filled in later via Edit */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Date of birth"><input type="date" value={form.dob} onChange={set('dob')} className="field-input" /></Field>
        <Field label="Age (if DOB unknown)"><input type="number" min="0" value={form.age} onChange={set('age')} className="field-input" placeholder="optional" /></Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Gender">
          <Select
            value={form.gender}
            onChange={(val) => setForm((v) => ({ ...v, gender: val }))}
            options={['male', 'female', 'other'].map((g) => ({ value: g, label: g }))}
            placeholder="optional" isClearable
          />
        </Field>
        <Field label="Height (cm)"><input type="number" min="0" value={form.height} onChange={set('height')} className="field-input" placeholder="optional" /></Field>
      </div>

      <div className="flex gap-3 mt-1">
        <button type="button" onClick={onClose} className="flex-1 border border-white/10 text-muted py-2.5 rounded-lg text-sm hover:text-cream transition-all">Cancel</button>
        <button type="submit" disabled={loading} className="flex-[2] bg-lime text-black font-bold py-2.5 rounded-lg text-sm hover:bg-lime-dark transition-all disabled:opacity-60">
          {loading ? 'Adding…' : 'Add member'}
        </button>
      </div>
    </form>
  )
}

function EditMemberForm({ member, plans, error, loading, onSubmit, onClose }) {
  const [form, setForm] = useState({
    name: member.name || '',
    phone: member.phone || '',
    email: member.email || '',
    dob: member.dob ? member.dob.slice(0, 10) : '',
    age: member.age ?? '',
    gender: member.gender || '',
    height: member.height ?? '',
    healthNotes: member.healthNotes || '',
    membershipStartDate: member.membershipStartDate ? member.membershipStartDate.slice(0, 10) : '',
    membershipExpiryDate: member.membershipExpiryDate ? member.membershipExpiryDate.slice(0, 10) : '',
    currentPlanId: member.currentPlanId?._id || '',
  })
  const set = (f) => (e) => setForm((v) => ({ ...v, [f]: e.target.value }))

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form) }} className="flex flex-col gap-4">
      {error && <p className="px-3 py-2 text-sm text-red-400 border rounded-lg bg-red-500/10 border-red-500/20">{error}</p>}
      <Field label="Full name *"><input type="text" value={form.name} onChange={set('name')} className="field-input" /></Field>
      <Field label="Phone *"><input type="tel" value={form.phone} onChange={set('phone')} className="field-input" /></Field>
      <Field label="Email"><input type="email" value={form.email} onChange={set('email')} className="field-input" placeholder="optional" /></Field>
      <Field label="Membership plan">
        <Select
          value={form.currentPlanId}
          onChange={(val) => setForm((v) => ({ ...v, currentPlanId: val }))}
          options={plans.map((p) => ({ value: p._id, label: planLabel(p) }))}
          placeholder="Select plan"
        />
        <p className="text-[11px] mt-1 text-muted">
          Reassigns the plan directly without changing the dates below. To extend validity, use Renew instead.
        </p>
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Membership start date">
          <input type="date" value={form.membershipStartDate} onChange={set('membershipStartDate')} className="field-input" />
        </Field>
        <Field label="Membership expiry date">
          <input type="date" value={form.membershipExpiryDate} onChange={set('membershipExpiryDate')} className="field-input" />
        </Field>
      </div>
      <p className="text-[11px] -mt-2 text-muted">Both dates can be corrected to any date — past or future — independent of the plan's default validity.</p>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Date of birth"><input type="date" value={form.dob} onChange={set('dob')} className="field-input" /></Field>
        <Field label="Age (if DOB unknown)"><input type="number" min="0" value={form.age} onChange={set('age')} className="field-input" placeholder="optional" /></Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Gender">
          <Select
            value={form.gender}
            onChange={(val) => setForm((v) => ({ ...v, gender: val }))}
            options={['male', 'female', 'other'].map((g) => ({ value: g, label: g }))}
            placeholder="optional" isClearable
          />
        </Field>
        <Field label="Height (cm)"><input type="number" min="0" value={form.height} onChange={set('height')} className="field-input" placeholder="optional" /></Field>
      </div>
      <Field label="Health notes">
        <textarea rows={2} value={form.healthNotes} onChange={set('healthNotes')} className="resize-none field-input" placeholder="optional" />
      </Field>
      <div className="flex gap-3 mt-1">
        <button type="button" onClick={onClose} className="flex-1 border border-white/10 text-muted py-2.5 rounded-lg text-sm hover:text-cream transition-all">Cancel</button>
        <button type="submit" disabled={loading} className="flex-[2] bg-lime text-black font-bold py-2.5 rounded-lg text-sm hover:bg-lime-dark transition-all disabled:opacity-60">
          {loading ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  )
}

function RenewForm({ member, plans, onSubmit, onClose }) {
  const [planId, setPlanId] = useState(member.currentPlanId?._id || '')
  const [startDate, setStartDate] = useState('')
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted">
        Current expiry:{' '}
        <span className="font-medium text-cream">
          {member.membershipExpiryDate
            ? new Date(member.membershipExpiryDate).toLocaleDateString('en-IN')
            : 'Not set'}
        </span>
      </p>

      <Field label={`Select a plan (${plans.length} available)`}>
        <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
          {plans.length === 0 ? (
            <p className="text-sm text-muted">No active plans found. Create one under Plans first.</p>
          ) : plans.map((p) => {
            const duration = p.durationUnit === 'months'
              ? `${p.durationValue ?? Math.round((p.durationDays || 0) / 30)} month${p.durationValue === 1 ? '' : 's'}`
              : `${p.durationValue ?? p.durationDays} days`
            const selected = planId === p._id
            return (
              <button
                key={p._id}
                type="button"
                onClick={() => setPlanId(p._id)}
                className={`flex items-center justify-between px-4 py-3 rounded-lg border text-left transition-all ${
                  selected ? 'border-lime bg-lime/10' : 'border-white/10 hover:border-white/25'
                }`}
              >
                <div>
                  <p className="text-sm font-semibold">{p.name}</p>
                  <p className="text-xs text-muted">{duration}{p.sessionsIncluded > 0 && ` · ${p.sessionsIncluded} PT sessions`}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">₹{p.price}</span>
                  {selected && <span className="text-lime">✓</span>}
                </div>
              </button>
            )
          })}
        </div>
      </Field>

      <Field label="Renew from date (optional)">
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="field-input" />
        <p className="text-[11px] mt-1 text-muted">
          Leave blank to extend from the current expiry (or today, if already lapsed). Set any date — past or future — to override.
        </p>
      </Field>
      <div className="flex gap-3 mt-1">
        <button onClick={onClose} className="flex-1 border border-white/10 text-muted py-2.5 rounded-lg text-sm hover:text-cream transition-all">Cancel</button>
        <button onClick={() => onSubmit(planId, startDate)} disabled={!planId} className="flex-[2] bg-lime text-black font-bold py-2.5 rounded-lg text-sm hover:bg-lime-dark transition-all disabled:opacity-60">
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