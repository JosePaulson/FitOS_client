import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const STEPS = ['Your gym', 'Your account', 'Done']
const passwordRule = /^(?=.*[A-Z])(?=.*\d).{8,}$/

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [form, setForm] = useState({
    gymName: '',
    subdomain: '',
    name: '',
    email: '',
    password: '',
    confirm: '',
  })

  const set = (f) => (e) => {
    const val = e.target.value
    setForm((v) => ({
      ...v,
      [f]: val,
      ...(f === 'gymName' && step === 0
        ? {
          subdomain: val
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, ''),
        }
        : {}),
    }))
  }

  function validateStep() {
    if (step === 0) {
      if (!form.gymName.trim()) return 'Gym name is required'
      if (!form.subdomain.trim()) return 'Subdomain is required'
      if (!/^[a-z0-9-]+$/.test(form.subdomain)) {
        return 'Subdomain: lowercase letters, numbers, hyphens only'
      }
    }

    if (step === 1) {
      if (!form.name.trim()) return 'Your name is required'
      if (!form.email.trim()) return 'Email is required'
      if (!/\S+@\S+\.\S+/.test(form.email)) return 'Enter a valid email'
      if (!passwordRule.test(form.password)) {
        return 'Password must be at least 8 characters and include 1 uppercase letter and 1 number'
      }
      if (form.password !== form.confirm) return 'Passwords do not match'
    }

    return null
  }

  function next(e) {
    e.preventDefault()
    const err = validateStep()
    if (err) {
      setError(err)
      return
    }
    setError('')
    setStep((s) => s + 1)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const err = validateStep()
    if (err) {
      setError(err)
      return
    }

    setLoading(true)
    try {
      await register({
        gymName: form.gymName,
        subdomain: form.subdomain,
        name: form.name,
        email: form.email,
        password: form.password,
      })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
      setStep(1)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex items-center justify-center min-h-screen px-4 py-16 bg-black">
      <div className="absolute inset-0 opacity-50 pointer-events-none bg-grid-lime bg-grid" />

      <div className="relative w-full max-w-md">
        <Link to="/" className="block mb-8 text-2xl font-black tracking-tight text-center text-cream">
          Fit<span className="text-lime">OS</span>
        </Link>

        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i < step
                    ? 'bg-lime text-black'
                    : i === step
                      ? 'bg-lime/20 border border-lime text-lime'
                      : 'bg-white/[0.06] text-muted'
                  }`}
              >
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`text-xs ${i === step ? 'text-cream' : 'text-muted'}`}>{s}</span>
              {i < STEPS.length - 1 && <div className="w-6 h-px mx-1 bg-white/10" />}
            </div>
          ))}
        </div>

        <div className="bg-card border border-white/[0.08] rounded-2xl p-8">
          {error && (
            <div className="px-4 py-3 mb-5 text-sm text-red-400 border rounded-lg bg-red-500/10 border-red-500/30">
              {error}
            </div>
          )}

          {step === 0 && (
            <form onSubmit={next} className="flex flex-col gap-4">
              <div>
                <h2 className="mb-1 text-lg font-bold">Tell us about your gym</h2>
                <p className="mb-6 text-sm text-muted">This is what your members will see.</p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted">Gym name *</label>
                <input
                  type="text"
                  placeholder="IronZone Fitness"
                  value={form.gymName}
                  onChange={set('gymName')}
                  className="field-input"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted">Subdomain *</label>
                <div className="flex items-center overflow-hidden border rounded-lg border-white/10 focus-within:border-lime/40">
                  <input
                    type="text"
                    placeholder="ironzone"
                    value={form.subdomain}
                    onChange={set('subdomain')}
                    className="flex-1 bg-white/[0.04] px-4 py-3 text-cream text-sm outline-none"
                  />
                  <span className="bg-white/[0.06] px-3 py-3 text-muted text-xs border-l border-white/10 whitespace-nowrap">
                    .fitos.in
                  </span>
                </div>
                <p className="text-xs text-muted">Your gym&apos;s unique URL. Lowercase, no spaces.</p>
              </div>

              <button
                type="submit"
                className="w-full py-3 mt-2 text-sm font-bold text-black transition-all rounded-lg bg-lime hover:bg-lime-dark"
              >
                Continue →
              </button>
            </form>
          )}

          {step === 1 && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <h2 className="mb-1 text-lg font-bold">Create your account</h2>
                <p className="mb-6 text-sm text-muted">You&apos;ll use these to log in.</p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted">Your name *</label>
                <input
                  type="text"
                  placeholder="Rahul Sharma"
                  value={form.name}
                  onChange={set('name')}
                  className="field-input"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted">Email address *</label>
                <input
                  type="email"
                  placeholder="you@yourgym.com"
                  value={form.email}
                  onChange={set('email')}
                  className="field-input"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted">Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 8 characters"
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

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted">Repeat password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Repeat password"
                    value={form.confirm}
                    onChange={set('confirm')}
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

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep(0)
                    setError('')
                  }}
                  className="flex-1 py-3 text-sm transition-all border rounded-lg border-white/10 text-muted hover:text-cream hover:border-white/20"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] bg-lime text-black font-bold py-3 rounded-lg text-sm hover:bg-lime-dark transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating account…' : 'Start 7-day free trial →'}
                </button>
              </div>

              <p className="text-xs text-center text-muted">No credit card required.</p>
            </form>
          )}
        </div>

        <p className="mt-6 text-sm text-center text-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-lime hover:text-lime-dark">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}