import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { authApi } from '../api/auth.api'

export default function ResetPassword() {
  const { token } = useParams()
  const navigate = useNavigate()

  const [form, setForm] = useState({ password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const set = (field) => (e) => setForm((v) => ({ ...v, [field]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
    if (form.password !== form.confirm) { setError("Passwords don't match"); return }

    setLoading(true)
    try {
      await authApi.resetPassword(token, form.password)
      setDone(true)
      setTimeout(() => navigate('/login'), 2500)
    } catch (err) {
      setError(err.response?.data?.message || 'This reset link is invalid or has expired.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex items-center justify-center min-h-screen px-4 bg-black">
      <div className="absolute inset-0 opacity-50 pointer-events-none bg-grid-lime bg-grid" />

      <div className="relative w-full max-w-md">
        <Link to="/" className="block mb-8 text-2xl font-black tracking-tight text-center text-cream">
          Fit<span className="text-lime">OS</span>
        </Link>

        <div className="bg-card border border-white/[0.08] rounded-2xl p-8">
          {done ? (
            <>
              <h1 className="mb-1 text-xl font-bold">Password reset ✓</h1>
              <p className="text-sm text-muted">Redirecting you to sign in…</p>
            </>
          ) : (
            <>
              <h1 className="mb-1 text-xl font-bold">Set a new password</h1>
              <p className="text-sm text-muted mb-7">Choose a new password for your account.</p>

              {error && (
                <div className="px-4 py-3 mb-5 text-sm text-red-400 border rounded-lg bg-red-500/10 border-red-500/30">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted">New password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    value={form.password}
                    onChange={set('password')}
                    className="field-input"
                    autoFocus
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted">Confirm new password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    value={form.confirm}
                    onChange={set('confirm')}
                    className="field-input"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 mt-2 text-sm font-bold text-black transition-all rounded-lg bg-lime hover:bg-lime-dark disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Resetting…' : 'Reset password →'}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="mt-6 text-sm text-center text-muted">
          <Link to="/login" className="font-medium text-lime hover:text-lime-dark">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
