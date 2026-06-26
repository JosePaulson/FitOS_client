import { useState } from 'react'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { leadApi } from '../api/lead.api'
import Select from '../components/ui/Select'

const CONTACT_ITEMS = [
  { icon: '📧', label: 'Email', value: 'hello@fitos.in' },
  { icon: '📞', label: 'Phone / WhatsApp', value: '+91 98765 43210' },
  { icon: '🕐', label: 'Support hours', value: 'Mon – Sat, 9 AM to 7 PM IST' },
  { icon: '📍', label: 'Office', value: 'Bengaluru, Karnataka, India' },
]

const PERKS = [
  'Free data migration from your old system',
  'Onboarding call with a product specialist',
  'Live demo scheduled within 24 hours',
]

const MEMBER_RANGES = ['Under 50', '50 – 150', '150 – 300', '300+']
const INTERESTS = ['Free trial', 'Product demo', 'Pricing info', 'Migration help']

const MEMBER_RANGE_OPTIONS = MEMBER_RANGES.map((r) => ({ value: r, label: r }))
const INTEREST_OPTIONS = INTERESTS.map((i) => ({ value: i, label: i }))

const INITIAL = { name: '', phone: '', email: '', gymName: '', members: '', interest: '', message: '' }

export default function Contact() {
  useScrollReveal()
  const [form, setForm] = useState(INITIAL)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  const setVal = (field) => (val) => setForm((f) => ({ ...f, [field]: val }))

  function validate() {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
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
    try {
      await leadApi.submitEnquiry(form)
      setSubmitted(true)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  return (
    <div className="pt-24">
      <section className="px-5 py-20 md:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="eyebrow">Get in touch</p>
          <h1 className="text-[clamp(36px,5vw,60px)] font-black tracking-tight leading-[1.05] mb-4 max-w-2xl reveal">
            Start your free trial, or just ask a question
          </h1>
          <p className="max-w-lg text-lg leading-relaxed text-muted reveal">
            Our team will get back to you within a few hours. We also help with data migration at no extra cost.
          </p>
        </div>
      </section>

      <section className="px-5 pb-24 md:px-8">
        <div className="grid items-start grid-cols-1 gap-16 mx-auto max-w-7xl lg:grid-cols-2">
          <div className="flex flex-col gap-8 reveal">
            {CONTACT_ITEMS.map((item) => (
              <div key={item.label} className="flex items-start gap-4">
                <div className="flex items-center justify-center text-lg border w-11 h-11 rounded-xl bg-lime/10 border-lime/20 shrink-0">
                  {item.icon}
                </div>
                <div>
                  <div className="text-xs font-semibold tracking-widest uppercase text-muted">{item.label}</div>
                  <div className="mt-1 text-sm text-cream">{item.value}</div>
                </div>
              </div>
            ))}
            <div className="mt-4">
              <div className="mb-4 text-xs font-semibold tracking-widest uppercase text-muted">We also offer</div>
              <ul className="flex flex-col gap-3">
                {PERKS.map((p) => (
                  <li key={p} className="flex items-center gap-2.5 text-sm text-muted">
                    <span className="font-bold text-lime shrink-0">✓</span> {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-card border border-white/[0.08] rounded-2xl p-8 reveal">
            {submitted ? (
              <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
                <div className="text-5xl">🎉</div>
                <h3 className="text-xl font-bold">Message sent!</h3>
                <p className="max-w-xs text-sm text-muted">Thanks for reaching out. We'll get back to you within a few hours.</p>
                <button onClick={() => { setForm(INITIAL); setSubmitted(false) }} className="mt-4 text-sm underline text-lime underline-offset-2">
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Your name *" error={errors.name}>
                    <input type="text" placeholder="Rahul Sharma" value={form.name} onChange={set('name')} className={fieldCls(errors.name)} />
                  </Field>
                  <Field label="Phone number *" error={errors.phone}>
                    <input type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={set('phone')} className={fieldCls(errors.phone)} />
                  </Field>
                </div>
                <Field label="Email address *" error={errors.email}>
                  <input type="email" placeholder="you@yourgym.com" value={form.email} onChange={set('email')} className={fieldCls(errors.email)} />
                </Field>
                <Field label="Gym name">
                  <input type="text" placeholder="Your Gym Name" value={form.gymName} onChange={set('gymName')} className={fieldCls()} />
                </Field>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Active members">
                    <Select
                      value={form.members}
                      onChange={setVal('members')}
                      options={MEMBER_RANGE_OPTIONS}
                      placeholder="Select range"
                      isClearable
                    />
                  </Field>
                  <Field label="Interested in">
                    <Select
                      value={form.interest}
                      onChange={setVal('interest')}
                      options={INTEREST_OPTIONS}
                      placeholder="Select one"
                      isClearable
                    />
                  </Field>
                </div>
                <Field label="Anything to add? (optional)">
                  <textarea rows={3} placeholder="Current software, specific questions, etc." value={form.message} onChange={set('message')} className="resize-y field-input" />
                </Field>
                <button type="submit" disabled={loading}
                  className="w-full bg-lime text-black font-bold py-3.5 rounded-lg text-sm hover:bg-lime-dark transition-all hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed mt-1">
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