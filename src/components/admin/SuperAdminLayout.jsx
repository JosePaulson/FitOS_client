import { useState } from 'react'
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const SA_NAV = [
  { to: '/superadmin',        icon: '🏠', label: 'Overview',   end: true },
  { to: '/superadmin/gyms',   icon: '🏢', label: 'Gyms' },
  { to: '/superadmin/leads',  icon: '🎯', label: 'Enquiry Leads' },
]

export default function SuperAdminLayout() {
  const { user, logout }    = useAuth()
  const navigate            = useNavigate()
  const [open, setOpen]     = useState(false)

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  return (
    <div className="flex h-screen bg-ink overflow-hidden">
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/60 z-20 md:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-30
        w-60 flex flex-col border-r border-white/[0.06]
        transition-transform duration-200
        ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        bg-[#0a0006]
      `}>
        {/* Logo + badge */}
        <div className="h-16 flex items-center gap-2.5 px-5 border-b border-white/[0.06] shrink-0">
          <span className="text-lg font-black tracking-tight text-cream">
            Fit<span className="text-lime">OS</span>
          </span>
          <span className="text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
            Super Admin
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-0.5">
          {SA_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  isActive
                    ? 'bg-red-500/10 text-red-400 font-semibold'
                    : 'text-muted hover:text-cream hover:bg-white/[0.04]'
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}

          {/* Divider — back to gym dashboard */}
          <div className="border-t border-white/[0.06] my-3" />
          <Link
            to="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted hover:text-cream hover:bg-white/[0.04] transition-all"
          >
            <span className="text-base">←</span>
            Back to gym dashboard
          </Link>
        </nav>

        {/* User */}
        <div className="border-t border-white/[0.06] p-4 shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 text-xs font-bold">
              {user?.name?.[0]?.toUpperCase() || 'S'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold truncate">{user?.name}</div>
              <div className="text-[11px] text-red-400/70">Platform owner</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-xs text-muted hover:text-cream border border-white/[0.06] hover:border-white/20 py-2 rounded-lg transition-all"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 shrink-0 flex items-center justify-between px-5 border-b border-white/[0.06] bg-[#0a0006]/80 backdrop-blur-sm">
          <button className="md:hidden text-muted hover:text-cream p-1" onClick={() => setOpen(true)}>
            <span className="block w-5 h-0.5 bg-current mb-1" />
            <span className="block w-5 h-0.5 bg-current mb-1" />
            <span className="block w-5 h-0.5 bg-current" />
          </button>
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-red-400/70 hidden sm:block">FitOS Platform Console</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-5 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
