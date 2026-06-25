import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { saasAdminApi } from '../../api/index'

const PLAN_PRICE = { lite: 500, basic: 1000, pro: 2000 }

function KPI({ label, value, sub, accent = false, loading = false }) {
  return (
    <div className={`rounded-xl border p-5 flex flex-col gap-2 ${
      accent ? 'bg-red-500/5 border-red-500/20' : 'bg-card border-white/[0.08]'
    }`}>
      <span className="text-xs text-muted uppercase tracking-wider font-medium">{label}</span>
      {loading
        ? <div className="h-8 w-20 bg-white/[0.06] rounded animate-pulse" />
        : <span className={`text-3xl font-black tracking-tight ${accent ? 'text-red-400' : 'text-cream'}`}>{value}</span>
      }
      {sub && <span className="text-xs text-muted">{sub}</span>}
    </div>
  )
}

export default function SAOverview() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    saasAdminApi.overview()
      .then(({ data }) => setData(data))
      .catch(() => setError('Could not load platform stats. Check SAAS_ADMIN_GYM_ID in your .env.'))
      .finally(() => setLoading(false))
  }, [])

  // Estimate MRR from active plan counts
  const mrrEstimate = data?.planBreakdown
    ?.filter((b) => b._id.status === 'active')
    ?.reduce((sum, b) => sum + b.count * (PLAN_PRICE[b._id.plan] || 0), 0) || 0

  const planCounts = {}
  data?.planBreakdown?.forEach((b) => {
    if (!planCounts[b._id.plan]) planCounts[b._id.plan] = {}
    planCounts[b._id.plan][b._id.status] = b.count
  })

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Platform overview</h1>
        <p className="text-muted text-sm mt-1">All gyms across FitOS — live stats</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Primary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <KPI label="Total gyms"        value={data?.gyms?.total     ?? '—'} loading={loading} accent />
        <KPI label="Active (paying)"   value={data?.gyms?.active    ?? '—'} loading={loading} />
        <KPI label="On trial"          value={data?.gyms?.trialing  ?? '—'} loading={loading} sub="7-day free trial" />
        <KPI label="Est. MRR"          value={`₹${mrrEstimate.toLocaleString('en-IN')}`} loading={loading} sub="Active subscriptions only" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPI label="Past due"          value={data?.gyms?.pastDue    ?? '—'} loading={loading} sub="Payment failed" />
        <KPI label="Cancelled"         value={data?.gyms?.cancelled  ?? '—'} loading={loading} />
        <KPI label="New this month"    value={data?.gyms?.newThisMonth ?? '—'} loading={loading} />
        <KPI label="Conversion target" value={data?.gyms?.trialing > 0
          ? `${Math.round((data.gyms.active / (data.gyms.active + data.gyms.trialing)) * 100)}%`
          : '—'
        } loading={loading} sub="Trial → paid rate" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plan breakdown */}
        <div className="bg-card border border-white/[0.08] rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-sm">Plan breakdown</h2>
            <Link to="/superadmin/gyms" className="text-xs text-red-400 hover:text-red-300">
              View all gyms →
            </Link>
          </div>
          {loading ? (
            <div className="flex flex-col gap-3">
              {[1,2,3].map((i) => <div key={i} className="h-12 bg-white/[0.04] rounded-lg animate-pulse" />)}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {['lite', 'basic', 'pro'].map((plan) => {
                const active   = planCounts[plan]?.active   || 0
                const trialing = planCounts[plan]?.trialing || 0
                const total    = active + trialing
                const pct      = data?.gyms?.total ? Math.round((total / data.gyms.total) * 100) : 0
                return (
                  <div key={plan} className="flex items-center gap-4">
                    <div className="w-16 text-xs font-bold capitalize text-muted">{plan}</div>
                    <div className="flex-1 bg-white/[0.05] rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 rounded-full bg-red-400/60 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="text-right min-w-[80px]">
                      <span className="text-sm font-semibold">{active}</span>
                      <span className="text-xs text-muted ml-1">paid</span>
                      {trialing > 0 && (
                        <span className="text-xs text-muted ml-1">+ {trialing} trial</span>
                      )}
                    </div>
                    <div className="text-xs text-muted w-10 text-right">
                      ₹{(active * PLAN_PRICE[plan]).toLocaleString('en-IN')}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Health summary */}
        <div className="bg-card border border-white/[0.08] rounded-xl p-6">
          <h2 className="font-bold text-sm mb-5">Subscription health</h2>
          {loading ? (
            <div className="h-40 bg-white/[0.04] rounded-lg animate-pulse" />
          ) : (
            <div className="flex flex-col gap-4">
              {[
                { label: 'Active',    count: data?.gyms?.active,      color: 'bg-lime',          pct: data?.gyms?.total },
                { label: 'Trialing',  count: data?.gyms?.trialing,    color: 'bg-yellow-400',    pct: data?.gyms?.total },
                { label: 'Past due',  count: data?.gyms?.pastDue,     color: 'bg-red-400',       pct: data?.gyms?.total },
                { label: 'Cancelled', count: data?.gyms?.cancelled,   color: 'bg-white/20',      pct: data?.gyms?.total },
              ].map(({ label, count = 0, color, pct: total }) => {
                const pct = total ? Math.round((count / total) * 100) : 0
                return (
                  <div key={label} className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${color}`} />
                    <span className="text-sm text-muted w-20">{label}</span>
                    <div className="flex-1 bg-white/[0.05] rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-sm font-semibold w-8 text-right">{count}</span>
                    <span className="text-xs text-muted w-8 text-right">{pct}%</span>
                  </div>
                )
              })}

              <div className="border-t border-white/[0.06] pt-4 mt-1">
                <div className="flex justify-between text-xs text-muted">
                  <span>Churn risk (past due + cancelled)</span>
                  <span className="text-red-400 font-semibold">
                    {(data?.gyms?.pastDue || 0) + (data?.gyms?.cancelled || 0)} gyms
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: 'View all gyms',      to: '/superadmin/gyms',         icon: '🏢' },
          { label: 'View enquiry leads', to: '/superadmin/leads',        icon: '🎯' },
          { label: 'Back to my gym',     to: '/dashboard',               icon: '←'  },
        ].map((a) => (
          <Link
            key={a.label}
            to={a.to}
            className="flex items-center gap-3 bg-card border border-white/[0.08] hover:border-red-400/30 px-5 py-3.5 rounded-lg text-sm text-muted hover:text-cream transition-all"
          >
            <span>{a.icon}</span>
            {a.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
