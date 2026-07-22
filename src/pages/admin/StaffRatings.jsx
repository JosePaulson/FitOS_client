import { useEffect, useState, useCallback } from 'react'
import { staffRatingApi } from '../../api/index'

function Stars({ value }) {
  return (
    <span className="text-amber-400 tracking-tight" title={`${value} / 5`}>
      {'★'.repeat(Math.round(value))}
      <span className="text-white/15">{'★'.repeat(5 - Math.round(value))}</span>
    </span>
  )
}

export default function StaffRatings() {
  const [summary, setSummary] = useState([])
  const [ratings, setRatings] = useState([])
  const [loading, setLoading] = useState(true)
  const [staffFilter, setStaffFilter] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await staffRatingApi.list({ staffId: staffFilter || undefined })
      setSummary(data.summary)
      setRatings(data.ratings)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [staffFilter])

  useEffect(() => { load() }, [load])

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Staff ratings</h1>
          <p className="text-muted text-sm mt-0.5">
            Member feedback on trainers and staff — visible only to you
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          {[1, 2, 3].map((i) => <div key={i} className="h-28 bg-card border border-white/[0.08] rounded-xl animate-pulse" />)}
        </div>
      ) : summary.length === 0 ? (
        <div className="py-20 text-sm text-center text-muted">
          No ratings submitted yet. They'll show up here as members rate trainers and staff from the member portal.
        </div>
      ) : (
        <>
          {/* Per-staff summary cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            {summary.map((s) => (
              <button
                key={s.staffId}
                onClick={() => setStaffFilter(staffFilter === s.staffId ? '' : s.staffId)}
                className={`bg-card border rounded-xl p-5 text-left transition-all ${
                  staffFilter === s.staffId ? 'border-lime/40' : 'border-white/[0.08] hover:border-white/20'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-sm">{s.name}</h3>
                    <p className="text-xs text-muted capitalize">{s.role}</p>
                  </div>
                  <span className="text-2xl font-black text-lime">{s.avgRating}</span>
                </div>
                <div className="flex items-center justify-between">
                  <Stars value={s.avgRating} />
                  <span className="text-xs text-muted">{s.count} rating{s.count === 1 ? '' : 's'}</span>
                </div>
              </button>
            ))}
          </div>

          {staffFilter && (
            <button
              onClick={() => setStaffFilter('')}
              className="text-xs text-lime hover:text-lime-dark mb-4"
            >
              ← Show all staff
            </button>
          )}

          {/* Individual ratings/remarks */}
          <div className="bg-card border border-white/[0.08] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06] text-left">
                    <th className="px-5 py-3 text-xs font-semibold tracking-wider uppercase text-muted">Staff</th>
                    <th className="px-5 py-3 text-xs font-semibold tracking-wider uppercase text-muted">Member</th>
                    <th className="px-5 py-3 text-xs font-semibold tracking-wider uppercase text-muted">Rating</th>
                    <th className="px-5 py-3 text-xs font-semibold tracking-wider uppercase text-muted">Remark</th>
                    <th className="px-5 py-3 text-xs font-semibold tracking-wider uppercase text-muted">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {ratings.length === 0 ? (
                    <tr><td colSpan={5} className="px-5 py-10 text-sm text-center text-muted">No ratings for this filter.</td></tr>
                  ) : ratings.map((r) => (
                    <tr key={r._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3.5 font-medium">{r.staffId?.name || 'Staff'}</td>
                      <td className="px-5 py-3.5 text-muted">{r.memberId?.name || 'Member'}</td>
                      <td className="px-5 py-3.5"><Stars value={r.rating} /></td>
                      <td className="px-5 py-3.5 text-muted max-w-xs">{r.remark || <span className="italic">No remark</span>}</td>
                      <td className="px-5 py-3.5 text-muted whitespace-nowrap">{new Date(r.createdAt).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
