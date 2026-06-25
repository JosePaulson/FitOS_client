import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const STEPS = ['Your gym', 'Your account', 'Done']

export default function Register() {
  const { register } = useAuth()
  const navigate     = useNavigate()

  const [step, setStep]   = useState(0)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    gymName: '', subdomain: '',
    name: '', email: '', password: '', confirm: '',
  })

  const set = (f) => (e) => {
    const val = e.target.value
    setForm((v) => ({
      ...v,
      [f]: val,
      // Auto-suggest subdomain from gym name
      ...(f === 'gymName' && step === 0
        ? { subdomain: val.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') }
        : {}),
    }))
  }

  function validateStep() {
    if (step === 0) {
      if (!form.gymName.trim())  return 'Gym name is required'
      if (!form.subdomain.trim()) return 'Subdomain is required'
      if (!/^[a-z0-9-]+$/.test(form.subdomain)) return 'Subdomain: lowercase letters, numbers, hyphens only'
    }
    if (step === 1) {
      if (!form.name.trim())  return 'Your name is required'
      if (!form.email.trim()) return 'Email is required'
      if (!/\S+@\S+\.\S+/.test(form.email)) return 'Enter a valid email'
      if (form.password.length < 6) return 'Password must be at least 6 characters'
      if (form.password !== form.confirm) return 'Passwords do not match'
    }
    return null
  }

  function next(e) {
    e.preventDefault()
    const err = validateStep()
    if (err) { setError(err); return }
    setError('')
    setStep((s) => s + 1)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register({
        gymName:   form.gymName,
        subdomain: form.subdomain,
        name:      form.name,
        email:     form.email,
        password:  form.password,
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
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-16">
      <div className="absolute inset-0 bg-grid-lime bg-grid opacity-50 pointer-events-none" />

      <div className="relative w-full max-w-md">
        <Link to="/" className="block text-center text-2xl font-black tracking-tight text-cream mb-8">
          Fit<span className="text-lime">OS</span>
        </Link>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i < step  ? 'bg-lime text-black' :
                i === step ? 'bg-lime/20 border border-lime text-lime' :
                             'bg-white/[0.06] text-muted'
              }`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`text-xs ${i === step ? 'text-cream' : 'text-muted'}`}>{s}</span>
              {i < STEPS.length - 1 && <div className="w-6 h-px bg-white/10 mx-1" />}
            </div>
          ))}
        </div>

        <div className="bg-card border border-white/[0.08] rounded-2xl p-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg mb-5">
              {error}
            </div>
          )}

          {/* Step 0 — Gym details */}
          {step === 0 && (
            <form onSubmit={next} className="flex flex-col gap-4">
              <div>
                <h2 className="text-lg font-bold mb-1">Tell us about your gym</h2>
                <p className="text-muted text-sm mb-6">This is what your members will see.</p>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted">Gym name *</label>
                <input type="text" placeholder="IronZone Fitness" value={form.gymName} onChange={set('gymName')} className="field-input" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted">Subdomain *</label>
                <div className="flex items-center border border-white/10 rounded-lg overflow-hidden focus-within:border-lime/40">
                  <input
                    type="text" placeholder="ironzone"
                    value={form.subdomain} onChange={set('subdomain')}
                    className="flex-1 bg-white/[0.04] px-4 py-3 text-cream text-sm outline-none"
                  />
                  <span className="bg-white/[0.06] px-3 py-3 text-muted text-xs border-l border-white/10 whitespace-nowrap">
                    .fitos.in
                  </span>
                </div>
                <p className="text-xs text-muted">Your gym's unique URL. Lowercase, no spaces.</p>
              </div>
              <button type="submit" className="mt-2 w-full bg-lime text-black font-bold py-3 rounded-lg text-sm hover:bg-lime-dark transition-all">
                Continue →
              </button>
            </form>
          )}

          {/* Step 1 — Owner account */}
          {step === 1 && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <h2 className="text-lg font-bold mb-1">Create your account</h2>
                <p className="text-muted text-sm mb-6">You'll use these to log in.</p>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted">Your name *</label>
                <input type="text" placeholder="Rahul Sharma" value={form.name} onChange={set('name')} className="field-input" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted">Email address *</label>
                <input type="email" placeholder="you@yourgym.com" value={form.email} onChange={set('email')} className="field-input" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted">Password *</label>
                <input type="password" placeholder="Min. 6 characters" value={form.password} onChange={set('password')} className="field-input" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted">Confirm password *</label>
                <input type="password" placeholder="••••••••" value={form.confirm} onChange={set('confirm')} className="field-input" />
              </div>
              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => { setStep(0); setError('') }}
                  className="flex-1 border border-white/10 text-muted py-3 rounded-lg text-sm hover:text-cream hover:border-white/20 transition-all">
                  ← Back
                </button>
                <button type="submit" disabled={loading}
                  className="flex-[2] bg-lime text-black font-bold py-3 rounded-lg text-sm hover:bg-lime-dark transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                  {loading ? 'Creating account…' : 'Start 7-day free trial →'}
                </button>
              </div>
              <p className="text-xs text-muted text-center">No credit card required.</p>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-muted mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-lime hover:text-lime-dark font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
