import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { dashboardApi } from '../../api/index'
import { useAuth } from '../../context/AuthContext'
import StatCard from '../../components/admin/StatCard'

function fmt(n) { return (n || 0).toLocaleString('en-IN') }
function fmtRupee(n) { return `₹${fmt(n)}` }

const MONTH_NAMES = ['', 'Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function Dashboard() {
  const { gym, user } = useAuth()
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')

  useEffect(() => {
    dashboardApi.stats()
      .then(({ data }) => setData(data))
      .catch(() => setError('Could not load dashboard. Please refresh.'))
      .finally(() => setLoading(false))
  }, [])

  const trend = data?.revenue?.trend || []
  const maxRevenue = Math.max(...trend.map((t) => t.revenue), 1)

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          Good {greeting()}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-muted text-sm mt-1">Here's what's happening at {gym?.name} today.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon="👥" label="Active members"  value={fmt(data?.members?.active)}  loading={loading} accent />
        <StatCard icon="💰" label="Revenue this month" value={fmtRupee(data?.revenue?.thisMonth)} loading={loading} />
        <StatCard icon="📅" label="Today's check-ins" value={fmt(data?.attendance?.today)} loading={loading} />
        <StatCard icon="🎯" label="Open leads"      value={fmt(data?.leads?.open)}      loading={loading} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon="⚠️"  label="Expiring in 7 days"  value={fmt(data?.members?.expiringIn7)}  loading={loading} sub="Need renewal soon" />
        <StatCard icon="🔔"  label="Expiring in 30 days" value={fmt(data?.members?.expiringIn30)} loading={loading} />
        <StatCard icon="💸"  label="Pending amount"      value={fmtRupee(data?.revenue?.pendingAmount)} loading={loading} sub={`${fmt(data?.revenue?.pendingCount)} invoices`} />
        <StatCard icon="🆕"  label="New this month"      value={fmt(data?.members?.newThisMonth)}  loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue trend chart */}
        <div className="lg:col-span-2 bg-card border border-white/[0.08] rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-sm">Revenue — last 6 months</h2>
            <Link to="/dashboard/billing" className="text-xs text-lime hover:text-lime-dark">
              View all →
            </Link>
          </div>
          {loading ? (
            <div className="h-40 bg-white/[0.03] rounded-lg animate-pulse" />
          ) : trend.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-muted text-sm">
              No revenue data yet.
            </div>
          ) : (
            <div className="flex items-end gap-3 h-40">
              {trend.map((t) => {
                const height = Math.max(8, Math.round((t.revenue / maxRevenue) * 100))
                return (
                  <div key={`${t._id.year}-${t._id.month}`} className="flex-1 flex flex-col items-center gap-1 group">
                    <div
                      className="w-full bg-lime/20 group-hover:bg-lime/40 rounded-t transition-all relative"
                      style={{ height: `${height}%` }}
                    >
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-lime opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">
                        {fmtRupee(t.revenue)}
                      </div>
                    </div>
                    <span className="text-[10px] text-muted">
                      {MONTH_NAMES[t._id.month]}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Recent members */}
        <div className="bg-card border border-white/[0.08] rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-sm">Recent members</h2>
            <Link to="/dashboard/members" className="text-xs text-lime hover:text-lime-dark">
              View all →
            </Link>
          </div>
          {loading ? (
            <div className="flex flex-col gap-3">
              {[1,2,3,4,5].map((i) => (
                <div key={i} className="h-10 bg-white/[0.04] rounded-lg animate-pulse" />
              ))}
            </div>
          ) : !data?.recentMembers?.length ? (
            <p className="text-muted text-sm">No members yet.{' '}
              <Link to="/dashboard/members" className="text-lime underline">Add one</Link>
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-white/[0.05]">
              {data.recentMembers.map((m) => (
                <li key={m._id} className="py-2.5 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{m.name}</div>
                    <div className="text-xs text-muted">{m.phone}</div>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                    m.membershipStatus === 'active'
                      ? 'bg-lime/10 text-lime'
                      : 'bg-red-500/10 text-red-400'
                  }`}>
                    {m.membershipStatus}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Add member',       to: '/dashboard/members?action=new',    icon: '➕' },
          { label: 'Record check-in',  to: '/dashboard/attendance',             icon: '✅' },
          { label: 'New lead',         to: '/dashboard/leads?action=new',       icon: '🎯' },
          { label: 'Mark invoice paid',to: '/dashboard/billing',                icon: '💸' },
        ].map((a) => (
          <Link
            key={a.label}
            to={a.to}
            className="flex items-center gap-2 bg-card border border-white/[0.08] hover:border-lime/30 px-4 py-3 rounded-lg text-sm text-muted hover:text-cream transition-all"
          >
            <span>{a.icon}</span> {a.label}
          </Link>
        ))}
      </div>
    </div>
  )
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
