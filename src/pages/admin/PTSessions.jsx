// import { useEffect, useState, useCallback } from 'react'
// import { ptApi, memberApi, staffApi, equipmentApi, workoutLibraryApi } from '../../api/index'
// import Select from '../../components/ui/Select'
// import { useAuth } from '../../context/AuthContext'

// const STATUS_STYLES = {
//   scheduled: 'bg-blue-400/10 text-blue-400',
//   completed: 'bg-lime/10 text-lime',
//   missed: 'bg-red-400/10 text-red-400',
//   cancelled: 'bg-white/5 text-muted',
// }
// const STATUS_OPTIONS = [
//   { value: 'scheduled', label: 'Scheduled' },
//   { value: 'completed', label: 'Completed' },
//   { value: 'missed', label: 'Missed' },
//   { value: 'cancelled', label: 'Cancelled' },
// ]

// function fmt(d) {
//   if (!d) return '—'
//   return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
// }
// function fmtISO(d) {
//   if (!d) return ''
//   return new Date(d).toISOString().split('T')[0]
// }

// export default function PTSessions() {
//   const { user } = useAuth()
//   const [sessions, setSessions] = useState([])
//   const [total, setTotal] = useState(0)
//   const [page, setPage] = useState(1)
//   const [loading, setLoading] = useState(true)

//   const [filterMember, setFilterMember] = useState('')
//   const [filterStatus, setFilterStatus] = useState('')

//   const [members, setMembers] = useState([])
//   const [trainers, setTrainers] = useState([])

//   const [equipmentList, setEquipmentList] = useState([])
//   const [workoutList, setWorkoutList] = useState([])

//   const [showForm, setShowForm] = useState(false)
//   const [editing, setEditing] = useState(null)
//   const [weightTarget, setWeightTarget] = useState(null)
//   const [detail, setDetail] = useState(null)
//   const [progTarget, setProgTarget] = useState(null)
//   const [progData, setProgData] = useState([])

//   const [deleteId, setDeleteId] = useState(null)
//   const [deleteError, setDeleteError] = useState('')
//   const [confirmDelete, setConfirmDelete] = useState(null)

//   const LIMIT = 15
//   const isTrainer = user?.role === 'trainer'

//   const load = useCallback(async () => {
//     setLoading(true)
//     try {
//       const params = { page, limit: LIMIT }
//       if (filterMember) params.memberId = filterMember
//       if (filterStatus) params.status = filterStatus
//       const { data } = await ptApi.list(params)
//       setSessions(data.sessions)
//       setTotal(data.total)
//     } catch {
//     } finally {
//       setLoading(false)
//     }
//   }, [page, filterMember, filterStatus])

//   useEffect(() => { load() }, [load])

//   useEffect(() => {
//     memberApi.list({ limit: 100 }).then(({ data }) => setMembers(data.members || [])).catch(() => { })
//     if (!isTrainer) {
//       staffApi.list().then(({ data }) => {
//         setTrainers((data.length ? data : []).filter((s) => s.role === 'trainer' || s.role === 'owner'))
//       }).catch(() => { })
//     }
//     equipmentApi.list().then(({ data }) => setEquipmentList(data || [])).catch(() => { })
//     workoutLibraryApi.list().then(({ data }) => setWorkoutList(data || [])).catch(() => { })
//   }, [])

//   async function openProgress(memberId, memberName) {
//     setProgTarget(memberName)
//     const { data } = await ptApi.progress(memberId)
//     setProgData(data)
//   }

//   async function deleteSession(session) {
//     setDeleteId(session._id)
//     setDeleteError('')
//     try {
//       await ptApi.delete(session._id)
//       if (detail?._id === session._id) setDetail(null)
//       setConfirmDelete(null)
//       await load()
//     } catch (err) {
//       setDeleteError(err.response?.data?.message || 'Failed to delete session')
//     } finally {
//       setDeleteId(null)
//     }
//   }

//   const memberOptions = members.map((m) => ({ value: m._id, label: `${m.name} (${m.phone})` }))
//   const trainerOptions = trainers.map((t) => ({ value: t._id, label: t.name }))
//   const equipmentOptions = equipmentList.map((e) => ({ value: e._id, label: e.name }))
//   const workoutOptions = workoutList.map((w) => ({ value: w._id, label: w.name }))

//   return (
//     <div className="mx-auto max-w-7xl">
//       <div className="flex items-center justify-between mb-6">
//         <div>
//           <h1 className="text-2xl font-bold tracking-tight">PT Sessions</h1>
//           <p className="text-muted text-sm mt-0.5">{total} session{total !== 1 ? 's' : ''} · schedule, track workouts and body weight</p>
//         </div>
//         <button onClick={() => { setEditing(null); setShowForm(true) }}
//           className="bg-lime text-black font-bold px-5 py-2.5 rounded-lg text-sm hover:bg-lime-dark transition-all">
//           + Schedule session
//         </button>
//       </div>

//       <div className="flex flex-wrap gap-3 mb-5">
//         <Select
//           value={filterMember}
//           onChange={(v) => { setFilterMember(v); setPage(1) }}
//           options={memberOptions}
//           placeholder="All members"
//           isClearable
//           className="w-56"
//         />
//         <Select
//           value={filterStatus}
//           onChange={(v) => { setFilterStatus(v); setPage(1) }}
//           options={STATUS_OPTIONS}
//           placeholder="All statuses"
//           isClearable
//           className="w-44"
//         />
//       </div>

//       {deleteError && (
//         <div className="px-4 py-3 mb-4 text-sm text-red-400 border rounded-lg bg-red-500/10 border-red-500/20">
//           {deleteError}
//         </div>
//       )}

//       <div className="bg-card border border-white/[0.08] rounded-xl overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full text-sm">
//             <thead>
//               <tr className="border-b border-white/[0.06] text-left">
//                 {['Date', 'Member', 'Trainer', 'Session', 'Body weight', 'Status', 'Ack.', 'Actions'].map((h) => (
//                   <th key={h} className="px-4 py-3 text-xs font-semibold tracking-wider uppercase text-muted whitespace-nowrap">{h}</th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-white/[0.04]">
//               {loading ? (
//                 Array.from({ length: 6 }).map((_, i) => (
//                   <tr key={i}>{Array.from({ length: 8 }).map((_, j) => (
//                     <td key={j} className="px-4 py-4"><div className="h-4 bg-white/[0.05] rounded animate-pulse" /></td>
//                   ))}</tr>
//                 ))
//               ) : sessions.length === 0 ? (
//                 <tr><td colSpan={8} className="px-4 py-12 text-sm text-center text-muted">
//                   No PT sessions found. Schedule one using the button above.
//                 </td></tr>
//               ) : sessions.map((s) => (
//                 <tr key={s._id} className="hover:bg-white/[0.02] transition-colors">
//                   <td className="px-4 py-3.5 whitespace-nowrap">
//                     <div className="text-sm font-medium">{fmt(s.date)}</div>
//                   </td>
//                   <td className="px-4 py-3.5">
//                     <div className="text-sm font-medium">{s.memberId?.name}</div>
//                     <div className="text-xs text-muted">{s.memberId?.phone}</div>
//                   </td>
//                   <td className="px-4 py-3.5 text-muted text-xs">{s.trainerId?.name || '—'}</td>
//                   <td className="px-4 py-3.5">
//                     <div className="text-sm font-medium">{s.title || 'PT Session'}</div>
//                     {s.exercises?.length > 0 && <div className="text-xs text-muted mt-0.5">{s.exercises.length} exercises</div>}
//                   </td>
//                   <td className="px-4 py-3.5">
//                     {s.bodyWeight ? (
//                       <div>
//                         <span className="font-semibold">{s.bodyWeight} kg</span>
//                         {s.bodyFat && <span className="ml-1 text-xs text-muted">· {s.bodyFat}% fat</span>}
//                       </div>
//                     ) : (
//                       <button onClick={() => setWeightTarget(s)}
//                         className="px-2 py-1 text-xs transition-all border rounded-lg text-muted hover:text-cream border-white/10 hover:border-lime/30">
//                         + Log
//                       </button>
//                     )}
//                   </td>
//                   <td className="px-4 py-3.5">
//                     <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[s.status] || ''}`}>
//                       {s.status}
//                     </span>
//                   </td>
//                   <td className="px-4 py-3.5">
//                     {s.acknowledgedByMember
//                       ? <span className="text-xs text-lime">✓ {fmt(s.acknowledgedAt)}</span>
//                       : <span className="text-xs text-muted">Pending</span>
//                     }
//                   </td>
//                   <td className="px-4 py-3.5">
//                     <div className="flex items-center gap-2 whitespace-nowrap">
//                       <button onClick={() => setDetail(s)}
//                         className="text-xs transition-colors text-muted hover:text-cream">View</button>
//                       {!s.acknowledgedByMember && <button onClick={() => { setEditing(s); setShowForm(true) }}
//                         className="text-xs transition-colors text-lime hover:text-lime-dark">Edit</button>}

//                       {!s.acknowledgedByMember && (
//                         <button
//                           onClick={() => setConfirmDelete(s)}
//                           disabled={deleteId === s._id}
//                           className="text-xs text-red-400 transition-colors hover:text-red-300 disabled:opacity-50"
//                         >
//                           Delete
//                         </button>
//                       )}

//                       <button onClick={() => openProgress(s.memberId?._id, s.memberId?.name)}
//                         className="text-xs text-blue-400 transition-colors hover:text-blue-300">Progress</button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {total > LIMIT && (
//           <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.06]">
//             <span className="text-xs text-muted">{(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}</span>
//             <div className="flex gap-2">
//               <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}
//                 className="text-xs px-3 py-1.5 border border-white/10 rounded-lg text-muted disabled:opacity-40 hover:text-cream transition-all">← Prev</button>
//               <button disabled={page * LIMIT >= total} onClick={() => setPage((p) => p + 1)}
//                 className="text-xs px-3 py-1.5 border border-white/10 rounded-lg text-muted disabled:opacity-40 hover:text-cream transition-all">Next →</button>
//             </div>
//           </div>
//         )}
//       </div>

//       {showForm && (
//         <SessionFormModal
//           session={editing}
//           memberOptions={memberOptions}
//           trainerOptions={trainerOptions}
//           equipmentOptions={equipmentOptions}
//           workoutOptions={workoutOptions}
//           isTrainer={isTrainer}
//           userId={user?._id}
//           onClose={() => { setShowForm(false); setEditing(null) }}
//           onSaved={() => { setShowForm(false); setEditing(null); load() }}
//         />
//       )}
//       {weightTarget && (
//         <WeightModal
//           session={weightTarget}
//           onClose={() => setWeightTarget(null)}
//           onSaved={() => { setWeightTarget(null); load() }}
//         />
//       )}
//       {detail && <DetailModal session={detail} onClose={() => setDetail(null)} />}
//       {progTarget && (
//         <ProgressModal name={progTarget} data={progData} onClose={() => { setProgTarget(null); setProgData([]) }} />
//       )}

//       {confirmDelete && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70">
//           <div className="w-full max-w-md p-6 rounded-2xl border bg-card border-white/[0.1]">
//             <h2 className="text-lg font-bold">Delete PT session?</h2>
//             <p className="mt-2 text-sm text-muted">
//               This will permanently delete the session for {confirmDelete.memberId?.name || 'this member'} on {fmt(confirmDelete.date)}.
//             </p>
//             <p className="mt-3 text-xs text-red-400">
//               This action cannot be undone.
//             </p>

//             <div className="flex gap-3 mt-6">
//               <button
//                 onClick={() => setConfirmDelete(null)}
//                 className="flex-1 border border-white/10 text-muted py-2.5 rounded-lg text-sm hover:text-cream transition-all"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={() => deleteSession(confirmDelete)}
//                 disabled={deleteId === confirmDelete._id}
//                 className="flex-1 bg-red-500 text-white font-bold py-2.5 rounded-lg text-sm disabled:opacity-60 transition-all"
//               >
//                 {deleteId === confirmDelete._id ? 'Deleting…' : 'Delete'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

import { useEffect, useState, useCallback, useRef } from 'react'
import { ptApi, memberApi, staffApi, equipmentApi, workoutLibraryApi, workoutLogApi } from '../../api/index'
import Select from '../../components/ui/Select'
import { useAuth } from '../../context/AuthContext'
import ExerciseRow from '../../components/admin/ExerciseRow'
import CopyExercisesModal from '../../components/admin/CopyExercisesModal'
import { computePR, formatPR, sortByMuscleGroup } from '../../lib/exercisePR'
import { useExerciseCatalog } from '../../hooks/useExerciseCatalog'
import { useDragReorder } from '../../hooks/useDragReorder'

const STATUS_STYLES = {
  pending: 'bg-amber-400/10 text-amber-400',
  scheduled: 'bg-blue-400/10 text-blue-400',
  completed: 'bg-lime/10 text-lime',
  missed: 'bg-red-400/10 text-red-400',
  cancelled: 'bg-white/5 text-muted',
  declined: 'bg-red-400/10 text-red-400',
}
const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending request' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'completed', label: 'Completed' },
  { value: 'missed', label: 'Missed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'declined', label: 'Declined' },
]

function fmt(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
function fmtTime(d) {
  if (!d) return ''
  const dt = new Date(d)
  if (dt.getHours() === 0 && dt.getMinutes() === 0) return ''
  return dt.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })
}
function fmtISO(d) {
  if (!d) return ''
  // Local date parts, NOT toISOString() — that gives the UTC date, which
  // silently shifts to the previous day for any local time before ~5:30am
  // IST, showing the wrong date in the picker on reopen/edit.
  const dt = new Date(d)
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
}
function todayLocalISO() {
  return fmtISO(new Date())
}
function fmtHHMM(d) {
  if (!d) return ''
  const dt = new Date(d)
  return `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`
}
function nowHHMM() {
  return fmtHHMM(new Date())
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

  // Optional link catalogs — equipment and workout library entries a
  // trainer can attach to a session
  const [equipmentList, setEquipmentList] = useState([])
  const [workoutList, setWorkoutList] = useState([])

  // Modals
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)   // session being edited
  const [weightTarget, setWeightTarget] = useState(null) // session for weight log
  const [detail, setDetail] = useState(null)   // session detail view
  const [progTarget, setProgTarget] = useState(null)   // member for progress chart
  const [progData, setProgData] = useState([])

  // Delete confirmation & deletion
  const [deleteId, setDeleteId] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)

  // Member-booked requests awaiting a trainer's confirmation
  const [pending, setPending] = useState([])
  const [pendingLoading, setPendingLoading] = useState(true)
  const [confirmTarget, setConfirmTarget] = useState(null) // request being confirmed (trainer assignment)
  const [declineTarget, setDeclineTarget] = useState(null) // request being declined (reason)

  const loadPending = useCallback(async () => {
    setPendingLoading(true)
    try {
      const { data } = await ptApi.list({ status: 'pending', limit: 50 })
      setPending(data.sessions || [])
    } catch { /* ignore */ }
    finally { setPendingLoading(false) }
  }, [])

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
  useEffect(() => { loadPending() }, [loadPending])

  useEffect(() => {
    memberApi.list({ limit: 100 }).then(({ data }) => setMembers(data.members || [])).catch(() => { })
    if (!isTrainer) {
      staffApi.list().then(({ data }) => {
        setTrainers((data.length ? data : []).filter((s) => s.role === 'trainer' || s.role === 'owner'))
      }).catch(() => { })
    }
    equipmentApi.list().then(({ data }) => setEquipmentList(data || [])).catch(() => { })
    workoutLibraryApi.list().then(({ data }) => setWorkoutList(data || [])).catch(() => { })
  }, [])

  async function openProgress(memberId, memberName) {
    setProgTarget(memberName)
    const { data } = await ptApi.progress(memberId)
    setProgData(data)
  }

  async function deleteSession(session) {
    setDeleteId(session._id)
    setDeleteError('')
    try {
      await ptApi.delete(session._id)
      if (detail?._id === session._id) setDetail(null)
      setConfirmDelete(null)
      await load()
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to delete session')
    } finally {
      setDeleteId(null)
    }
  }

  // Confirm directly when a trainer is already known (assigned or the
  // acting trainer themselves) — otherwise open the assign-trainer modal.
  async function quickConfirm(request) {
    if (!request.trainerId && !isTrainer) { setConfirmTarget(request); return }
    try {
      await ptApi.confirm(request._id, {})
      loadPending(); load()
    } catch { setConfirmTarget(request) }
  }

  const memberOptions = members.map((m) => ({ value: m._id, label: `${m.name} (${m.phone})` }))
  const trainerOptions = trainers.map((t) => ({ value: t._id, label: t.name }))
  const equipmentOptions = equipmentList.map((e) => ({ value: e._id, label: e.name }))
  const workoutOptions = workoutList.map((w) => ({ value: w._id, label: w.name }))

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

      {/* Member-booked requests awaiting confirmation */}
      {!pendingLoading && pending.length > 0 && (
        <div className="bg-amber-400/[0.06] border border-amber-400/20 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg text-amber-400">📅</span>
            <h2 className="text-sm font-bold">
              {pending.length} session request{pending.length !== 1 ? 's' : ''} awaiting confirmation
            </h2>
          </div>
          <div className="flex flex-col gap-2">
            {pending.map((r) => (
              <div key={r._id} className="flex items-center justify-between gap-3 bg-black/20 border border-white/[0.06] rounded-lg px-3.5 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {r.memberId?.name} <span className="font-normal text-muted">· {fmt(r.date)}{fmtTime(r.date) ? ` · ${fmtTime(r.date)}` : ''}</span>
                  </p>
                  <p className="text-xs text-muted mt-0.5">
                    {r.trainerId?.name
                      ? `Requested trainer: ${r.trainerId.name}`
                      : 'No trainer preference — pick one to confirm'}
                    {r.notes ? ` · "${r.notes}"` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => quickConfirm(r)}
                    className="text-xs font-semibold bg-lime text-black px-3 py-1.5 rounded-lg hover:bg-lime-dark transition-all">
                    Confirm
                  </button>
                  <button onClick={() => setDeclineTarget(r)}
                    className="text-xs font-semibold text-red-400 border border-red-400/30 px-3 py-1.5 rounded-lg hover:bg-red-400/10 transition-all">
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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

      {deleteError && (
        <div className="px-4 py-3 mb-4 text-sm text-red-400 border rounded-lg bg-red-500/10 border-red-500/20">
          {deleteError}
        </div>
      )}

      {/* Table */}
      <div className="bg-card border border-white/[0.08] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-left">
                {['Date', 'Member', 'Trainer', 'Session', 'Body weight', 'Calories', 'Status', 'Ack.', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs font-semibold tracking-wider uppercase text-muted whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 9 }).map((_, j) => (
                    <td key={j} className="px-4 py-4"><div className="h-4 bg-white/[0.05] rounded animate-pulse" /></td>
                  ))}</tr>
                ))
              ) : sessions.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-12 text-sm text-center text-muted">
                  No PT sessions found. Schedule one using the button above.
                </td></tr>
              ) : sessions.map((s) => (
                <tr key={s._id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="text-sm font-medium">{fmt(s.date)}</div>
                    {fmtTime(s.date) && <div className="text-xs text-muted">{fmtTime(s.date)}</div>}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="text-sm font-medium">{s.memberId?.name}</div>
                    <div className="text-xs text-muted">{s.memberId?.phone}</div>
                  </td>
                  <td className="px-4 py-3.5 text-muted text-xs">
                    {s.trainerId?.name || (s.status === 'pending' ? 'Unassigned' : '—')}
                  </td>
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
                    {s.caloriesBurned ? (
                      <span className="font-semibold text-amber-400">🔥 {s.caloriesBurned}</span>
                    ) : (
                      <span className="text-xs text-muted">—</span>
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
                      <button onClick={() => { setEditing(s); setShowForm(true) }}
                        className="text-xs transition-colors text-lime hover:text-lime-dark">Edit</button>

                      {!s.acknowledgedByMember && (
                        <button
                          onClick={() => setConfirmDelete(s)}
                          disabled={deleteId === s._id}
                          className="text-xs text-red-400 transition-colors hover:text-red-300 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      )}

                      {/* ── Confirm delete modal ────────────────────────────────────────────────── */}

                      {confirmDelete && <Modal title="Delete session" onClose={() => setConfirmDelete(null)}>
                        <p className="mb-5 text-sm text-muted text-wrap">
                          Are you sure you want to delete this session? This will permanently delete the session for {confirmDelete.memberId?.name || 'this member'} on {fmt(confirmDelete.date)}.
                        </p>
                        <div className="flex gap-3">
                          <button onClick={() => setConfirmDelete(null)} className="flex-1 border border-white/10 text-muted py-2.5 rounded-lg text-sm hover:text-cream transition-all">Cancel</button>
                          <button onClick={() => deleteSession(confirmDelete)} className="flex-[2] bg-red-500/90 text-white font-bold py-2.5 rounded-lg text-sm hover:bg-red-500 transition-all">Delete session</button>
                        </div>
                      </Modal>}
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
          equipmentOptions={equipmentOptions}
          workoutOptions={workoutOptions}
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
      {confirmTarget && (
        <ConfirmRequestModal
          request={confirmTarget}
          trainerOptions={trainerOptions}
          onClose={() => setConfirmTarget(null)}
          onConfirmed={() => { setConfirmTarget(null); loadPending(); load() }}
        />
      )}
      {declineTarget && (
        <DeclineRequestModal
          request={declineTarget}
          onClose={() => setDeclineTarget(null)}
          onDeclined={() => { setDeclineTarget(null); loadPending(); load() }}
        />
      )}
    </div>
  )
}

/* ── Session form modal ──────────────────────────────────────────────────── */
function SessionFormModal({ session, memberOptions, trainerOptions, equipmentOptions, workoutOptions, isTrainer, userId, onClose, onSaved }) {
  // A member-booked session keeps the time they originally requested — staff
  // can still reschedule the date, but shouldn't silently change the time
  // they committed to. Purely trainer/admin-scheduled sessions get a normal
  // editable time field that defaults to "right now".
  const isMemberBooked = session?.bookingSource === 'member'

  const [form, setForm] = useState({
    memberId: session?.memberId?._id || '',
    trainerId: session?.trainerId?._id || '',
    date: fmtISO(session?.date) || todayLocalISO(),
    time: session?.date ? fmtHHMM(session.date) : nowHHMM(),
    durationMinutes: session?.durationMinutes || 60,
    title: session?.title || '',
    notes: session?.notes || '',
    status: session?.status || 'scheduled',
    bodyWeight: session?.bodyWeight || '',
    bodyFat: session?.bodyFat || '',
    exercises: session?.exercises || [],
    // Optional links into the shared catalogs — arrays of ids
    equipment: session?.equipment?.map((e) => e._id) || [],
    workouts: session?.workouts?.map((w) => w._id) || [],
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Selected member's past PT sessions AND self-logged workouts, fetched
  // fresh whenever they change — used to compute PRs shown next to each
  // exercise. A PR is a PR regardless of which side it was logged from.
  // Excludes the session currently being edited so a re-save doesn't just
  // match itself.
  const [memberHistory, setMemberHistory] = useState([])
  useEffect(() => {
    if (!form.memberId) { setMemberHistory([]); return }
    let cancelled = false
    Promise.all([
      ptApi.list({ memberId: form.memberId, limit: 50 }),
      workoutLogApi.list({ memberId: form.memberId, limit: 100 }),
    ])
      .then(([ptRes, logRes]) => {
        if (cancelled) return
        const ptHistory = (ptRes.data.sessions || []).filter((s) => s._id !== session?._id)
        setMemberHistory([...ptHistory, ...(logRes.data.logs || [])])
      })
      .catch(() => { if (!cancelled) setMemberHistory([]) })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.memberId])

  const [showCopyModal, setShowCopyModal] = useState(false)
  function copyExercises(copied) {
    setForm((v) => ({ ...v, exercises: [...v.exercises.filter((e) => e.name?.trim()), ...copied] }))
    setShowCopyModal(false)
  }

  const set = (f) => (e) => setForm((v) => ({ ...v, [f]: e.target.value }))
  const setVal = (f) => (v) => setForm((prev) => ({ ...prev, [f]: v }))

  // Refs to each exercise row so a newly-added one can be scrolled into
  // view — cleared and rebuilt every render, indexed to match form.exercises.
  const exerciseRefs = useRef([])
  const [scrollToIndex, setScrollToIndex] = useState(null)

  function addExercise() {
    setScrollToIndex(form.exercises.length) // index the new row will land at
    setForm((v) => ({ ...v, exercises: [...v.exercises, { name: '', sets: '', reps: '', weight: '', notes: '', muscleGroup: '' }] }))
  }

  useEffect(() => {
    if (scrollToIndex == null) return
    const el = exerciseRefs.current[scrollToIndex]
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setScrollToIndex(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollToIndex, form.exercises.length])

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

  const { list: orderedExercises, dragIndex, getHandleProps, setRowRef } = useDragReorder(
    form.exercises,
    (reordered) => setForm((v) => ({ ...v, exercises: reordered }))
  )

  async function save() {
    setError(''); setSaving(true)
    try {
      // Member-booked sessions keep their original time-of-day even if the
      // date is changed; everything else combines the date + time fields.
      const time = isMemberBooked ? fmtHHMM(session.date) : (form.time || '00:00')
      const combinedDate = new Date(`${form.date}T${time}:00`).toISOString()

      const { time: _time, ...rest } = form
      const payload = {
        ...rest,
        date: combinedDate,
        durationMinutes: form.durationMinutes ? Number(form.durationMinutes) : 60,
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
    } finally { setSaving(false) }
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

        <div className="grid grid-cols-4 gap-3">
          <Field label="Date *">
            <input type="date" value={form.date} onChange={set('date')} className="field-input" />
          </Field>
          <Field label={isMemberBooked ? 'Time (booked by member)' : 'Time'}>
            <input
              type="time"
              value={isMemberBooked ? fmtHHMM(session.date) : form.time}
              onChange={set('time')}
              disabled={isMemberBooked}
              className="field-input disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </Field>
          <Field label="Session duration (min)">
            <input type="number" min="5" step="5" value={form.durationMinutes} onChange={set('durationMinutes')} className="field-input" placeholder="60" />
          </Field>
          <Field label="Status">
            <Select value={form.status} onChange={setVal('status')} options={[
              { value: 'scheduled', label: 'Scheduled' },
              { value: 'completed', label: 'Completed' },
              { value: 'missed', label: 'Missed' },
              { value: 'cancelled', label: 'Cancelled' },
            ]} />
          </Field>
        </div>
        {isMemberBooked && (
          <p className="text-[11px] text-muted -mt-2">
            🔒 This session was booked by the member for this time — reschedule the date if needed, but the time they requested is kept.
          </p>
        )}

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
        <p className="text-[11px] text-muted -mt-2">
          🔥 Calories burned is calculated automatically from body weight, session duration, and the exercises logged below — no need to enter it manually.
        </p>

        <Field label="Session notes">
          <textarea rows={2} value={form.notes} onChange={set('notes')} className="resize-none field-input" placeholder="Observations, member feedback, intensity…" />
        </Field>

        {/* Optional links to the shared equipment/workout catalogs — lets the
            member see exactly what this session used, with photos/video */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Link equipment (optional)">
            <Select
              isMulti
              value={form.equipment}
              onChange={setVal('equipment')}
              options={equipmentOptions}
              placeholder="None linked"
            />
          </Field>
          <Field label="Link workouts (optional)">
            <Select
              isMulti
              value={form.workouts}
              onChange={setVal('workouts')}
              options={workoutOptions}
              placeholder="None linked"
            />
          </Field>
        </div>

        {/* Exercises */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-muted">Exercises</label>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setShowCopyModal(true)} disabled={!form.memberId}
                title={!form.memberId ? 'Select a member first' : 'Copy exercises from a previous session'}
                className="text-xs transition-colors text-muted hover:text-cream disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-muted">
                📋 Copy from previous
              </button>
              <button type="button" onClick={addExercise}
                className="text-xs transition-colors text-lime hover:text-lime-dark">+ Add exercise</button>
            </div>
          </div>
          {form.exercises.length === 0 && (
            <p className="text-xs text-muted bg-white/[0.02] border border-white/[0.06] rounded-lg px-3 py-2">
              No exercises added — click "+ Add exercise" to build the session programme, or copy them from a previous session
            </p>
          )}
          <div className="flex flex-col gap-2">
            {orderedExercises.map((ex, i) => (
              <div
                key={i}
                ref={(el) => { exerciseRefs.current[i] = el; setRowRef(i)(el) }}
                className="flex items-stretch gap-1.5"
                style={{ opacity: dragIndex === i ? 0.5 : 1 }}
              >
                <span
                  {...getHandleProps(i)}
                  aria-label="Drag to reorder"
                  className="flex items-center justify-center px-1 text-muted hover:text-cream shrink-0 select-none"
                >
                  ⠿
                </span>
                <div className="flex-1 min-w-0">
                  <ExerciseRow
                    exercise={ex}
                    history={memberHistory}
                    onChange={(field, val) => updateExercise(i, field, val)}
                    onRemove={() => removeExercise(i)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2 border-t border-white/[0.06]">
          <button onClick={onClose} className="flex-1 border border-white/10 text-muted py-2.5 rounded-lg text-sm hover:text-cream transition-all">Cancel</button>
          <button onClick={save} disabled={saving}
            className="flex-[2] bg-lime text-black font-bold py-2.5 rounded-lg text-sm hover:bg-lime-dark transition-all disabled:opacity-60">
            {saving ? 'Saving…' : session ? 'Update session' : 'Schedule session'}
          </button>
        </div>
      </div>
      {showCopyModal && (
        <CopyExercisesModal
          history={memberHistory}
          onClose={() => setShowCopyModal(false)}
          onCopy={copyExercises}
        />
      )}
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

/* ── Confirm booking request modal ──────────────────────────────────────── */
function ConfirmRequestModal({ request, trainerOptions, onClose, onConfirmed }) {
  const [trainerId, setTrainerId] = useState(request.trainerId?._id || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function confirm() {
    if (!trainerId) { setError('Select a trainer'); return }
    setSaving(true); setError('')
    try {
      await ptApi.confirm(request._id, { trainerId })
      onConfirmed()
    } catch (err) { setError(err.response?.data?.message || 'Failed to confirm') }
    finally { setSaving(false) }
  }

  return (
    <Modal title="Confirm PT session request" onClose={onClose}>
      <p className="mb-5 text-sm text-muted">
        <span className="font-medium text-cream">{request.memberId?.name}</span> requested{' '}
        {fmt(request.date)}{fmtTime(request.date) ? ` at ${fmtTime(request.date)}` : ''}.
      </p>
      {error && <p className="px-3 py-2 mb-4 text-xs text-red-400 border rounded-lg bg-red-500/10 border-red-500/20">{error}</p>}
      <Field label="Assign trainer *">
        <Select value={trainerId} onChange={setTrainerId} options={trainerOptions} placeholder="Select trainer" />
      </Field>
      <div className="flex gap-3 mt-5">
        <button onClick={onClose} className="flex-1 border border-white/10 text-muted py-2.5 rounded-lg text-sm hover:text-cream transition-all">Cancel</button>
        <button onClick={confirm} disabled={saving}
          className="flex-[2] bg-lime text-black font-bold py-2.5 rounded-lg text-sm disabled:opacity-60 transition-all">
          {saving ? 'Confirming…' : 'Confirm session'}
        </button>
      </div>
    </Modal>
  )
}

/* ── Decline booking request modal ──────────────────────────────────────── */
function DeclineRequestModal({ request, onClose, onDeclined }) {
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function decline() {
    setSaving(true); setError('')
    try {
      await ptApi.decline(request._id, { reason })
      onDeclined()
    } catch (err) { setError(err.response?.data?.message || 'Failed to decline') }
    finally { setSaving(false) }
  }

  return (
    <Modal title="Decline session request" onClose={onClose}>
      <p className="mb-5 text-sm text-muted">
        <span className="font-medium text-cream">{request.memberId?.name}</span> requested{' '}
        {fmt(request.date)}{fmtTime(request.date) ? ` at ${fmtTime(request.date)}` : ''}. The member will be notified.
      </p>
      {error && <p className="px-3 py-2 mb-4 text-xs text-red-400 border rounded-lg bg-red-500/10 border-red-500/20">{error}</p>}
      <Field label="Reason (optional, shown to the member)">
        <textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)}
          className="resize-none field-input" placeholder="e.g. Fully booked that day — try another slot" />
      </Field>
      <div className="flex gap-3 mt-5">
        <button onClick={onClose} className="flex-1 border border-white/10 text-muted py-2.5 rounded-lg text-sm hover:text-cream transition-all">Cancel</button>
        <button onClick={decline} disabled={saving}
          className="flex-[2] bg-red-500/90 text-white font-bold py-2.5 rounded-lg text-sm disabled:opacity-60 hover:bg-red-500 transition-all">
          {saving ? 'Declining…' : 'Decline request'}
        </button>
      </div>
    </Modal>
  )
}

/* ── Session detail modal ────────────────────────────────────────────────── */
function DetailModal({ session: s, onClose }) {
  const { muscleGroups } = useExerciseCatalog()
  const [history, setHistory] = useState([])
  const [showPR, setShowPR] = useState(false)
  useEffect(() => {
    const memberId = s.memberId?._id
    if (!memberId) return
    let cancelled = false
    Promise.all([
      ptApi.list({ memberId, limit: 50 }),
      workoutLogApi.list({ memberId, limit: 100 }),
    ])
      .then(([ptRes, logRes]) => {
        if (cancelled) return
        const ptHistory = (ptRes.data.sessions || []).filter((sess) => sess._id !== s._id)
        setHistory([...ptHistory, ...(logRes.data.logs || [])])
      })
      .catch(() => {})
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.memberId?._id])

  return (
    <Modal title="Session details" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold">{s.title || 'PT Session'}</p>
            <p className="text-sm text-muted">{s.memberId?.name} · {fmt(s.date)}{fmtTime(s.date) ? ` · ${fmtTime(s.date)}` : ''}</p>
            {s.bookingSource === 'member' && (
              <p className="text-xs text-amber-400 mt-0.5">📅 Booked by member</p>
            )}
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[s.status] || ''}`}>{s.status}</span>
        </div>

        {s.status === 'declined' && s.declineReason && (
          <div className="px-4 py-3 border bg-red-500/10 border-red-500/20 rounded-xl">
            <p className="mb-1 text-xs font-semibold tracking-wider uppercase text-muted">Decline reason</p>
            <p className="text-sm text-cream/80">{s.declineReason}</p>
          </div>
        )}

        {(s.bodyWeight || s.bodyFat || s.caloriesBurned || s.durationMinutes) && (
          <div className="flex gap-6 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 flex-wrap">
            {s.bodyWeight && <div><p className="text-xs text-muted">Body weight</p><p className="text-xl font-bold">{s.bodyWeight} kg</p></div>}
            {s.bodyFat && <div><p className="text-xs text-muted">Body fat</p><p className="text-xl font-bold">{s.bodyFat}%</p></div>}
            {s.durationMinutes && <div><p className="text-xs text-muted">Duration</p><p className="text-xl font-bold">{s.durationMinutes} min</p></div>}
            {s.caloriesBurned ? (
              <div><p className="text-xs text-muted">Calories burned</p><p className="text-xl font-bold text-amber-400">🔥 {s.caloriesBurned}</p></div>
            ) : (
              <div><p className="text-xs text-muted">Calories burned</p><p className="mt-1 text-xs text-muted">Log body weight to estimate</p></div>
            )}
          </div>
        )}

        {s.exercises?.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold tracking-wider uppercase text-muted">Exercises</p>
              <button
                onClick={() => setShowPR((v) => !v)}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-all border ${
                  showPR ? 'bg-purple-500/15 text-purple-400 border-purple-500/40' : 'text-muted border-white/10 hover:text-cream'
                }`}
              >
                {showPR ? 'Hide PR' : 'Show PR'}
              </button>
            </div>
            <div className="flex flex-col gap-1.5">
              {sortByMuscleGroup(s.exercises, muscleGroups).map((ex, i) => {
                const pr = computePR(history, ex.name)
                const weightIsPR = pr != null && ex.weight != null && Number(ex.weight) === pr.weight
                return (
                  <div key={i} className="flex items-center justify-between bg-white/[0.02] border border-white/[0.06] rounded-lg px-3 py-2">
                    <span className="text-sm font-medium">{ex.name}</span>
                    <div className="flex flex-col items-end gap-0.5">
                      <div className="flex gap-3 text-xs text-muted">
                        {ex.sets && <span>{ex.sets} sets</span>}
                        {ex.reps && <span>× {ex.reps}</span>}
                        {ex.weight && (
                          <span className={weightIsPR ? 'font-semibold text-purple-400' : ''}>@ {ex.weight}kg</span>
                        )}
                      </div>
                      {showPR && pr && (
                        <span className="text-[10px] font-bold text-purple-400">PR {formatPR(pr)}</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {s.equipment?.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold tracking-wider uppercase text-muted">Equipment used</p>
            <div className="flex flex-wrap gap-2">
              {s.equipment.map((eq) => (
                <div key={eq._id} className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] rounded-lg pl-1.5 pr-3 py-1.5">
                  <div className="flex items-center justify-center w-6 h-6 overflow-hidden rounded bg-white/5 shrink-0">
                    {eq.imageUrl ? <img src={eq.imageUrl} alt={eq.name} className="object-cover w-full h-full" /> : <span className="text-xs">🏋️</span>}
                  </div>
                  <span className="text-xs font-medium">{eq.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {s.workouts?.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold tracking-wider uppercase text-muted">Reference workouts</p>
            <div className="flex flex-wrap gap-2">
              {s.workouts.map((w) => (
                <div key={w._id} className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] rounded-lg pl-1.5 pr-3 py-1.5">
                  <div className="flex items-center justify-center w-6 h-6 overflow-hidden rounded bg-white/5 shrink-0">
                    {w.imageUrl
                      ? <img src={w.imageUrl} alt={w.name} className="object-cover w-full h-full" />
                      : w.videoUrl ? <span className="text-xs">▶</span> : <span className="text-xs">🏋️</span>
                    }
                  </div>
                  <span className="text-xs font-medium">{w.name}</span>
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