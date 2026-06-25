import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const from      = location.state?.from?.pathname || '/dashboard'

  const [form, setForm]     = useState({ email: '', password: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const set = (f) => (e) => setForm((v) => ({ ...v, [f]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.email || !form.password) { setError('Both fields are required'); return }
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
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      {/* Background grid */}
      <div className="absolute inset-0 bg-grid-lime bg-grid opacity-50 pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="block text-center text-2xl font-black tracking-tight text-cream mb-8">
          Fit<span className="text-lime">OS</span>
        </Link>

        <div className="bg-card border border-white/[0.08] rounded-2xl p-8">
          <h1 className="text-xl font-bold mb-1">Welcome back</h1>
          <p className="text-muted text-sm mb-7">Sign in to your gym dashboard</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted">Email address</label>
              <input
                type="email" placeholder="you@yourgym.com" autoComplete="email"
                value={form.email} onChange={set('email')}
                className="field-input"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-muted">Password</label>
                <Link to="/forgot-password" className="text-xs text-lime hover:text-lime-dark">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password" placeholder="••••••••" autoComplete="current-password"
                value={form.password} onChange={set('password')}
                className="field-input"
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="mt-2 w-full bg-lime text-black font-bold py-3 rounded-lg text-sm hover:bg-lime-dark transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-muted mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-lime hover:text-lime-dark font-medium">
            Start free trial
          </Link>
        </p>
      </div>
    </div>
  )
}
