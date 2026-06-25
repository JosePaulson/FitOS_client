import { useState } from 'react'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { leadApi } from '../api/lead.api'

const CONTACT_ITEMS = [
  { icon: '📧', label: 'Email',             value: 'hello@fitos.in' },
  { icon: '📞', label: 'Phone / WhatsApp',  value: '+91 98765 43210' },
  { icon: '🕐', label: 'Support hours',     value: 'Mon – Sat, 9 AM to 7 PM IST' },
  { icon: '📍', label: 'Office',            value: 'Bengaluru, Karnataka, India' },
]

const PERKS = [
  'Free data migration from your old system',
  'Onboarding call with a product specialist',
  'Live demo scheduled within 24 hours',
]

const MEMBER_RANGES = ['Under 50', '50 – 150', '150 – 300', '300+']
const INTERESTS     = ['Free trial', 'Product demo', 'Pricing info', 'Migration help']

const INITIAL = {
  name: '', phone: '', email: '', gymName: '',
  members: '', interest: '', message: '',
}

export default function Contact() {
  useScrollReveal()

  const [form, setForm]       = useState(INITIAL)
  const [errors, setErrors]   = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading]  = useState(false)

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  function validate() {
    const errs = {}
    if (!form.name.trim())  errs.name  = 'Name is required'
    if (!form.email.trim()) errs.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email'
    if (!form.phone.trim()) errs.phone = 'Phone number is required'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)

    await leadApi.submitEnquiry(form)

    setLoading(false)
    setSubmitted(true)
  }

  return (
    <div className="pt-24">
      {/* Header */}
      <section className="py-20 px-5 md:px-8">
        <div className="max-w-7xl mx-auto">
          <p className="eyebrow">Get in touch</p>
          <h1 className="text-[clamp(36px,5vw,60px)] font-black tracking-tight leading-[1.05] mb-4 max-w-2xl reveal">
            Start your free trial, or just ask a question
          </h1>
          <p className="text-muted text-lg leading-relaxed max-w-lg reveal">
            Our team will get back to you within a few hours. We also help with
            data migration at no extra cost.
          </p>
        </div>
      </section>

      {/* 2-col layout */}
      <section className="pb-24 px-5 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* Left — contact info */}
          <div className="flex flex-col gap-8 reveal">
            {CONTACT_ITEMS.map((item) => (
              <div key={item.label} className="flex gap-4 items-start">
                <div className="w-11 h-11 rounded-xl bg-lime/10 border border-lime/20 flex items-center justify-center text-lg shrink-0">
                  {item.icon}
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-widest text-muted">
                    {item.label}
                  </div>
                  <div className="text-sm text-cream mt-1">{item.value}</div>
                </div>
              </div>
            ))}

            <div className="mt-4">
              <div className="text-xs font-semibold uppercase tracking-widest text-muted mb-4">
                We also offer
              </div>
              <ul className="flex flex-col gap-3">
                {PERKS.map((p) => (
                  <li key={p} className="flex items-center gap-2.5 text-sm text-muted">
                    <span className="text-lime font-bold shrink-0">✓</span> {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right — form */}
          <div className="bg-card border border-white/[0.08] rounded-2xl p-8 reveal">
            {submitted ? (
              <div className="flex flex-col items-center justify-center text-center py-16 gap-4">
                <div className="text-5xl">🎉</div>
                <h3 className="text-xl font-bold">Message sent!</h3>
                <p className="text-muted text-sm max-w-xs">
                  Thanks for reaching out. We'll get back to you within a few hours.
                </p>
                <button
                  onClick={() => { setForm(INITIAL); setSubmitted(false) }}
                  className="mt-4 text-sm text-lime underline underline-offset-2"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
                {/* Row 1 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Your name *" error={errors.name}>
                    <input
                      type="text" placeholder="Rahul Sharma"
                      value={form.name} onChange={set('name')}
                      className={fieldCls(errors.name)}
                    />
                  </Field>
                  <Field label="Phone number *" error={errors.phone}>
                    <input
                      type="tel" placeholder="+91 98765 43210"
                      value={form.phone} onChange={set('phone')}
                      className={fieldCls(errors.phone)}
                    />
                  </Field>
                </div>

                {/* Row 2 */}
                <Field label="Email address *" error={errors.email}>
                  <input
                    type="email" placeholder="you@yourgym.com"
                    value={form.email} onChange={set('email')}
                    className={fieldCls(errors.email)}
                  />
                </Field>

                {/* Row 3 */}
                <Field label="Gym name">
                  <input
                    type="text" placeholder="Your Gym Name"
                    value={form.gymName} onChange={set('gymName')}
                    className={fieldCls()}
                  />
                </Field>

                {/* Row 4 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Active members">
                    <select value={form.members} onChange={set('members')} className={fieldCls()}>
                      <option value="">Select range</option>
                      {MEMBER_RANGES.map((r) => <option key={r}>{r}</option>)}
                    </select>
                  </Field>
                  <Field label="Interested in">
                    <select value={form.interest} onChange={set('interest')} className={fieldCls()}>
                      <option value="">Select one</option>
                      {INTERESTS.map((i) => <option key={i}>{i}</option>)}
                    </select>
                  </Field>
                </div>

                {/* Row 5 */}
                <Field label="Anything to add? (optional)">
                  <textarea
                    rows={3} placeholder="Current software, specific questions, etc."
                    value={form.message} onChange={set('message')}
                    className={`${fieldCls()} resize-y`}
                  />
                </Field>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-lime text-black font-bold py-3.5 rounded-lg text-sm hover:bg-lime-dark transition-all hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed mt-1"
                >
                  {loading ? 'Sending…' : 'Send message →'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

/* ── helpers ── */
function fieldCls(error) {
  return `field-input ${error ? 'border-red-500/50 focus:border-red-500/70' : ''}`
}

function Field({ label, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted">{label}</label>
      {children}
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  )
}
