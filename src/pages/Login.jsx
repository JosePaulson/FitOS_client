import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const set = (field) => (e) =>
    setForm((v) => ({ ...v, [field]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.email || !form.password) {
      setError('Both fields are required')
      return
    }

    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
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
          <h1 className="mb-1 text-xl font-bold">Welcome back</h1>
          <p className="text-sm text-muted mb-7">Sign in to your gym dashboard</p>

          {error && (
            <div className="px-4 py-3 mb-5 text-sm text-red-400 border rounded-lg bg-red-500/10 border-red-500/30">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted">Email address</label>
              <input
                type="email"
                placeholder="you@yourgym.com"
                autoComplete="email"
                value={form.email}
                onChange={set('email')}
                className="field-input"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted">Password</label>
                <Link to="/forgot-password" className="text-xs text-lime hover:text-lime-dark">
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={form.password}
                  onChange={set('password')}
                  className="pr-20 field-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 text-xs font-medium right-3 text-lime hover:text-lime-dark"
                  aria-pressed={showPassword}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 text-sm font-bold text-black transition-all rounded-lg bg-lime hover:bg-lime-dark disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-sm text-center text-muted">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-lime hover:text-lime-dark">
            Start free trial
          </Link>
        </p>
      </div>
    </div>
  )
}