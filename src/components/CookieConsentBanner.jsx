import { useState } from 'react'
import { Link } from 'react-router-dom'

const STORAGE_KEY = 'fitos_admin_cookie_consent'

function readConsent() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/**
 * First-visit cookie/local-storage consent banner, shown across both the
 * public marketing site and the gym dashboard. FitOS today relies on
 * browser local storage — not third-party tracking cookies — for staff
 * sign-in sessions and dashboard preferences; there's no
 * advertising/analytics tracking. "Essential only" and "Accept all"
 * behave the same right now, but the choice is recorded so we can honor
 * it automatically if that ever changes — see the Cookie Policy.
 */
export default function CookieConsentBanner() {
  const [consent, setConsent] = useState(() => readConsent())

  function decide(analytics) {
    const value = { essential: true, analytics, decidedAt: new Date().toISOString() }
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(value)) } catch { /* ignore */ }
    setConsent(value)
  }

  if (consent) return null

  return (
    <div
      className="fixed top-0 inset-x-0 z-[200] px-4 py-3 bg-black/95 backdrop-blur-md border-b border-white/10"
      role="region"
      aria-label="Cookie consent"
    >
      <div className="flex flex-col items-start justify-between max-w-5xl gap-3 mx-auto sm:flex-row sm:items-center">
        <p className="text-xs leading-relaxed text-muted">
          We use essential local storage to keep you signed in and remember your
          preferences.{' '}
          <Link to="/cookie-policy" className="underline text-cream">Cookie Policy</Link>
        </p>
        <div className="flex items-center flex-shrink-0 w-full gap-2 sm:w-auto">
          <button
            onClick={() => decide(false)}
            className="flex-1 sm:flex-initial px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-white/15 text-cream hover:bg-white/5 transition-all whitespace-nowrap"
          >
            Essential only
          </button>
          <button
            onClick={() => decide(true)}
            className="flex-1 sm:flex-initial px-3.5 py-1.5 text-xs font-bold rounded-lg bg-lime text-black hover:bg-lime-dark transition-all whitespace-nowrap"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  )
}
