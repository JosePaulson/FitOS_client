import { useEffect, useState, useCallback } from 'react'
import { attendanceApi, memberApi } from '../../api/index'

export default function Attendance() {
  const [records, setRecords]   = useState([])
  const [total,   setTotal]     = useState(0)
  const [date,    setDate]      = useState(todayStr())
  const [search,  setSearch]    = useState('')
  const [members, setMembers]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [checking, setChecking] = useState(false)
  const [query,   setQuery]     = useState('')
  const [results, setResults]   = useState([])
  const [searching, setSearching] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await attendanceApi.list({ date, limit: 100 })
      setRecords(data.records)
      setTotal(data.total)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [date])

  useEffect(() => { load() }, [load])

  // Member search for check-in
  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    const t = setTimeout(async () => {
      setSearching(true)
      try {
        const { data } = await memberApi.list({ search: query, status: 'active', limit: 5 })
        setResults(data.members)
      } catch { /* ignore */ }
      finally { setSearching(false) }
    }, 300)
    return () => clearTimeout(t)
  }, [query])

  async function checkIn(member) {
    setChecking(true)
    setQuery('')
    setResults([])
    try {
      await attendanceApi.checkin(member._id, 'gym')
      load()
    } catch (err) {
      alert(err.response?.data?.message || 'Check-in failed')
    } finally { setChecking(false) }
  }

  const filtered = search
    ? records.filter((r) =>
        r.memberId?.name?.toLowerCase().includes(search.toLowerCase()) ||
        r.memberId?.phone?.includes(search)
      )
    : records

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-7">
        <h1 className="text-2xl font-bold tracking-tight">Attendance</h1>
        <p className="text-muted text-sm mt-0.5">{total} check-ins on {new Date(date).toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long' })}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-7">
        {/* Check-in panel */}
        <div className="bg-card border border-white/[0.08] rounded-xl p-6">
          <h2 className="font-bold text-sm mb-4">Mark check-in</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search member by name or phone…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="field-input w-full"
            />
            {(results.length > 0 || searching) && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-black border border-white/10 rounded-xl overflow-hidden z-10 shadow-xl">
                {searching ? (
                  <div className="px-4 py-3 text-sm text-muted">Searching…</div>
                ) : results.map((m) => (
                  <button
                    key={m._id}
                    onClick={() => checkIn(m)}
                    disabled={checking}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.05] transition-colors text-left"
                  >
                    <div>
                      <div className="text-sm font-medium">{m.name}</div>
                      <div className="text-xs text-muted">{m.phone}</div>
                    </div>
                    <span className="text-xs text-lime font-semibold">Check in ✓</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <p className="text-xs text-muted mt-3">
            Members are marked as checked in for today. Duplicate check-ins are ignored.
          </p>
        </div>

        {/* Date picker */}
        <div className="bg-card border border-white/[0.08] rounded-xl p-6">
          <h2 className="font-bold text-sm mb-4">View date</h2>
          <input
            type="date"
            value={date}
            max={todayStr()}
            onChange={(e) => setDate(e.target.value)}
            className="field-input w-full"
          />
          <div className="flex gap-2 mt-3">
            {[0, 1, 2, 6].map((daysAgo) => (
              <button
                key={daysAgo}
                onClick={() => setDate(dateOffset(-daysAgo))}
                className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
                  date === dateOffset(-daysAgo)
                    ? 'bg-lime/10 border-lime/30 text-lime'
                    : 'border-white/10 text-muted hover:text-cream'
                }`}
              >
                {daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo}d ago`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Daily log */}
      <div className="bg-card border border-white/[0.08] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <h2 className="font-bold text-sm">Check-in log</h2>
          <input
            type="text" placeholder="Filter by name…"
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="field-input text-xs py-1.5 px-3 w-44"
          />
        </div>

        {loading ? (
          <div className="p-5 flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-white/[0.04] rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-muted text-sm">
            No check-ins recorded for this date.
          </div>
        ) : (
          <ul className="divide-y divide-white/[0.04]">
            {filtered.map((r) => (
              <li key={r._id} className="flex items-center justify-between px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-lime/10 border border-lime/20 flex items-center justify-center text-lime text-xs font-bold">
                    {r.memberId?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{r.memberId?.name || 'Unknown'}</div>
                    <div className="text-xs text-muted">{r.memberId?.phone}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-lime font-semibold">
                    {r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' }) : '—'}
                  </div>
                  <div className="text-[10px] text-muted capitalize">{r.type}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function todayStr() {
  return new Date().toISOString().split('T')[0]
}
function dateOffset(days) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}
