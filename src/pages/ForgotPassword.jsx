import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authApi } from '../api/auth.api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!email) { setError('Enter your email address'); return }

    setLoading(true)
    try {
      await authApi.forgotPassword(email)
      setSent(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.')
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
          {sent ? (
            <>
              <h1 className="mb-1 text-xl font-bold">Check your email</h1>
              <p className="text-sm text-muted mb-2">
                If an account exists for <strong className="text-cream">{email}</strong>, we've sent a link to reset your password. It expires in 1 hour.
              </p>
              <p className="text-sm text-muted">
                Didn't get it? Check spam, or{' '}
                <button onClick={() => setSent(false)} className="text-lime hover:text-lime-dark font-medium">try again</button>.
              </p>
            </>
          ) : (
            <>
              <h1 className="mb-1 text-xl font-bold">Forgot your password?</h1>
              <p className="text-sm text-muted mb-7">Enter your email and we'll send you a reset link.</p>

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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="field-input"
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 mt-2 text-sm font-bold text-black transition-all rounded-lg bg-lime hover:bg-lime-dark disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending…' : 'Send reset link →'}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="mt-6 text-sm text-center text-muted">
          Remembered your password?{' '}
          <Link to="/login" className="font-medium text-lime hover:text-lime-dark">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
