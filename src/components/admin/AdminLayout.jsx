import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useSuperAdmin } from '../../hooks/useSuperAdmin'

const NAV = [
  { to: '/dashboard',                icon: '📊', label: 'Dashboard',      roles: null },
  { to: '/dashboard/members',        icon: '👥', label: 'Members',        roles: null },
  { to: '/dashboard/leads',          icon: '🎯', label: 'Leads',          roles: null },
  { to: '/dashboard/billing',        icon: '💳', label: 'Billing',        roles: null },
  { to: '/dashboard/attendance',     icon: '📅', label: 'Attendance',     roles: null },
  { to: '/dashboard/plans',          icon: '📋', label: 'Plans',          roles: null },
  { to: '/dashboard/workout-plans',  icon: '🏋️', label: 'Workout & Diet', roles: null },
  { to: '/dashboard/staff',          icon: '👤', label: 'Staff',          roles: ['owner', 'manager'] },
]

export default function AdminLayout() {
  const { user, gym, logout } = useAuth()
  const { isSuperAdmin }        = useSuperAdmin()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  const trialDaysLeft = gym?.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(gym.trialEndsAt) - Date.now()) / 86400000))
    : null

  const visibleNav = NAV.filter((item) =>
    !item.roles || item.roles.includes(user?.role)
  )

  return (
    <div className="flex h-screen bg-ink overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-30
        w-60 flex flex-col bg-black border-r border-white/[0.06]
        transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-white/[0.06] shrink-0">
          <span className="text-lg font-black tracking-tight">
            Fit<span className="text-lime">OS</span>
          </span>
          {gym && (
            <span className="ml-2 text-xs text-muted truncate max-w-[100px]">
              · {gym.name}
            </span>
          )}
        </div>

        {/* Trial banner */}
        {gym?.planStatus === 'trialing' && trialDaysLeft !== null && (
          <div className="mx-3 mt-3 bg-lime/10 border border-lime/20 rounded-lg px-3 py-2">
            <p className="text-xs text-lime font-semibold">
              {trialDaysLeft > 0 ? `${trialDaysLeft} days left in trial` : 'Trial ended'}
            </p>
            <NavLink to="/pricing" className="text-[11px] text-lime/70 hover:text-lime underline">
              Upgrade now →
            </NavLink>
          </div>
        )}

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-0.5">
          {visibleNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  isActive
                    ? 'bg-lime/10 text-lime font-semibold'
                    : 'text-muted hover:text-cream hover:bg-white/[0.04]'
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}

          {/* Super admin link — only shown to platform owner */}
          {isSuperAdmin && (
            <>
              <div className="border-t border-white/[0.06] my-3" />
              <NavLink
                to="/superadmin"
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                    isActive
                      ? 'bg-red-500/10 text-red-400 font-semibold'
                      : 'text-muted hover:text-red-400 hover:bg-red-500/5'
                  }`
                }
              >
                <span className="text-base">⚡</span>
                Super admin
              </NavLink>
            </>
          )}
        </nav>

        {/* User footer */}
        <div className="border-t border-white/[0.06] p-4 shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-lime/15 border border-lime/30 flex items-center justify-center text-lime text-xs font-bold">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold truncate">{user?.name}</div>
              <div className="text-[11px] text-muted capitalize">{user?.role}</div>
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
        <header className="h-16 shrink-0 flex items-center justify-between px-5 border-b border-white/[0.06] bg-black">
          <button
            className="md:hidden text-muted hover:text-cream p-1"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="block w-5 h-0.5 bg-current mb-1" />
            <span className="block w-5 h-0.5 bg-current mb-1" />
            <span className="block w-5 h-0.5 bg-current" />
          </button>
          <div className="flex items-center gap-3 ml-auto">
            {gym?.plan && (
              <span className="bg-lime/10 text-lime border border-lime/20 px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider hidden sm:inline">
                {gym.planStatus === 'trialing' ? '⏳ Trial' : gym.plan}
              </span>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-5 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
