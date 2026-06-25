import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { NAV_LINKS } from '../../utils/data'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setMenuOpen(false), [location])

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-opacity duration-300 ${scrolled ? 'bg-black/90 backdrop-blur-md border-b border-white/[0.06]' : 'bg-transparent'
      }`}>
      <nav className="flex items-center justify-between h-16 px-5 mx-auto max-w-7xl md:px-8">
        {/* Logo */}
        <Link to="/" className="text-xl font-black tracking-tight text-cream">
          Fit<span className="text-lime">OS</span>
        </Link>

        {/* Desktop links */}
        <ul className="items-center hidden gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              {link.href.startsWith('/#') ? (
                <a href={link.href} className="text-sm transition-colors text-muted hover:text-cream">
                  {link.label}
                </a>
              ) : (
                <NavLink
                  to={link.href}
                  className={({ isActive }) =>
                    `text-sm transition-colors ${isActive ? 'text-cream font-semibold' : 'text-muted hover:text-cream'}`
                  }
                >
                  {link.label}
                </NavLink>
              )}
            </li>
          ))}
        </ul>

        {/* Desktop CTA — auth-aware */}
        <div className="items-center hidden gap-3 md:flex">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="px-4 py-2 text-sm font-semibold text-black transition-all rounded-lg bg-lime hover:bg-lime-dark hover:-translate-y-px"
              >
                Dashboard →
              </Link>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm transition-all border rounded-lg text-muted border-white/10 hover:text-cream hover:border-white/20"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-sm transition-all border rounded-lg text-muted border-white/10 hover:text-cream hover:border-white/20"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm font-semibold text-black transition-all rounded-lg bg-lime hover:bg-lime-dark hover:-translate-y-px"
              >
                Start free trial
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <span className={`block w-5 h-0.5 bg-cream transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-5 h-0.5 bg-cream transition-all ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-0.5 bg-cream transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-md border-t border-white/[0.06] px-5 py-6 flex flex-col gap-4">
          {NAV_LINKS.map((link) =>
            link.href.startsWith('/#') ? (
              <a key={link.label} href={link.href} onClick={() => setMenuOpen(false)}
                className="text-base transition-colors text-muted hover:text-cream">
                {link.label}
              </a>
            ) : (
              <NavLink key={link.label} to={link.href}
                className={({ isActive }) =>
                  `text-base transition-colors ${isActive ? 'text-cream font-semibold' : 'text-muted hover:text-cream'}`
                }>
                {link.label}
              </NavLink>
            )
          )}
          <div className="border-t border-white/[0.06] pt-4 flex flex-col gap-3 mt-2">
            {user ? (
              <>
                <Link to="/dashboard" className="text-sm font-semibold bg-lime text-black text-center py-2.5 rounded-lg">
                  Dashboard →
                </Link>
                <button onClick={logout} className="text-sm text-muted text-center border border-white/10 py-2.5 rounded-lg">
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-muted text-center border border-white/10 py-2.5 rounded-lg">Log in</Link>
                <Link to="/register" className="text-sm font-semibold bg-lime text-black text-center py-2.5 rounded-lg">Start free trial</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
