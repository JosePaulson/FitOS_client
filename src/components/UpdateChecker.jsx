import { useEffect, useRef, useState } from 'react'

const CHECK_INTERVAL_MS = 60000 // 1 minute
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

/**
 * Blocking "new version available" modal — mirrors the member portal's.
 * Two independent triggers:
 *   1. A new admin-dashboard build was deployed — detected by comparing
 *      this bundle's baked-in build version (__APP_VERSION__) against
 *      /version.json, fetched fresh every minute.
 *   2. The API server was redeployed/restarted — detected via
 *      GET /api/version changing from what was first observed this session.
 * Blocks all interaction until Update is tapped, which clears every cache
 * this app could be using and force-reloads.
 */
export default function UpdateChecker() {
  const [updateInfo, setUpdateInfo] = useState(null)
  const [updating, setUpdating] = useState(false)
  const serverVersionRef = useRef(null)

  useEffect(() => {
    let cancelled = false

    async function check() {
      try {
        const res = await fetch('/version.json', { cache: 'no-store' })
        if (res.ok) {
          const { version } = await res.json()
          if (version && version !== __APP_VERSION__ && !cancelled) {
            setUpdateInfo({ version })
            return
          }
        }
      } catch { /* offline — skip this round */ }

      try {
        const res = await fetch(`${API_BASE.replace(/\/api$/, '')}/api/version`, { cache: 'no-store' })
        if (res.ok) {
          const { version } = await res.json()
          if (version) {
            if (serverVersionRef.current === null) {
              serverVersionRef.current = version
            } else if (version !== serverVersionRef.current && !cancelled) {
              setUpdateInfo({ version })
            }
          }
        }
      } catch { /* offline — skip */ }
    }

    check()
    const interval = setInterval(check, CHECK_INTERVAL_MS)
    function onVisible() { if (document.visibilityState === 'visible') check() }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      cancelled = true
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  async function handleUpdate() {
    setUpdating(true)
    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations()
        await Promise.all(regs.map((r) => r.unregister()))
      }
      if ('caches' in window) {
        const keys = await caches.keys()
        await Promise.all(keys.map((k) => caches.delete(k)))
      }
    } catch { /* best-effort — reload below regardless */ }
    window.location.href = window.location.pathname + '?_v=' + Date.now()
  }

  if (!updateInfo) return null

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center px-6 bg-black/85">
      <div className="bg-card border border-white/[0.1] rounded-2xl w-full max-w-sm p-7 text-center">
        <div className="mb-3 text-4xl">🚀</div>
        <h2 className="text-lg font-bold text-cream">New update available</h2>
        <p className="mt-1 text-xs text-muted">new version: {updateInfo.version}</p>
        <p className="mt-3 text-sm text-muted">
          Please update to continue — this only takes a second.
        </p>
        <button onClick={handleUpdate} disabled={updating}
          className="w-full bg-lime text-black font-bold py-3.5 rounded-xl text-sm hover:bg-lime-dark transition-all disabled:opacity-60 mt-5">
          {updating ? 'Updating…' : 'Update'}
        </button>
      </div>
    </div>
  )
}
