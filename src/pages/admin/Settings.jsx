import { useEffect, useState } from 'react'
import { gymApi } from '../../api/index'
import Select from '../../components/ui/Select'
import { useAuth } from '../../context/AuthContext'

export default function Settings() {
  const { user } = useAuth()
  const [gym,      setGym]      = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [testing,  setTesting]  = useState(false)
  const [saved,    setSaved]    = useState(false)
  const [error,    setError]    = useState('')
  const [testMsg,  setTestMsg]  = useState('')
  const [testErr,  setTestErr]  = useState('')

  const [form, setForm] = useState({
    name:    '',
    phone:   '',
    address: '',
    city:    '',
    state:   '',
    settings: {
      emailFrom:  '',
      replyTo:    '',
      brandColor: '#C8F135',
      currency:   'INR',
      timezone:   'Asia/Kolkata',
    },
  })

  useEffect(() => {
    gymApi.getSettings()
      .then(({ data }) => {
        setGym(data)
        setForm({
          name:    data.name    || '',
          phone:   data.phone   || '',
          address: data.address || '',
          city:    data.city    || '',
          state:   data.state   || '',
          settings: {
            emailFrom:  data.settings?.emailFrom  || '',
            replyTo:    data.settings?.replyTo    || '',
            brandColor: data.settings?.brandColor || '#C8F135',
            currency:   data.settings?.currency   || 'INR',
            timezone:   data.settings?.timezone   || 'Asia/Kolkata',
          },
        })
      })
      .catch(() => setError('Could not load settings'))
      .finally(() => setLoading(false))
  }, [])

  const set     = (f) => (e) => setForm((v) => ({ ...v, [f]: e.target.value }))
  const setSett = (f) => (e) => setForm((v) => ({ ...v, settings: { ...v.settings, [f]: e.target.value } }))

  async function handleSave(e) {
    e.preventDefault()
    setError(''); setSaved(false); setSaving(true)
    try {
      const { data } = await gymApi.updateSettings(form)
      setGym(data)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save settings')
    } finally { setSaving(false) }
  }

  async function handleTestEmail() {
    setTestMsg(''); setTestErr(''); setTesting(true)
    try {
      const { data } = await gymApi.testEmail()
      setTestMsg(data.message)
    } catch (err) {
      setTestErr(err.response?.data?.detail || err.response?.data?.message || 'Test email failed')
    } finally { setTesting(false) }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-lime border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Gym settings</h1>
        <p className="text-muted text-sm mt-1">Profile, email sender and notification preferences</p>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-6">

        {/* ── Gym profile ── */}
        <Section title="Gym profile" icon="🏢">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Gym name *">
              <input type="text" value={form.name} onChange={set('name')} className="field-input" placeholder="IronZone Fitness" />
            </Field>
            <Field label="Phone">
              <input type="tel" value={form.phone} onChange={set('phone')} className="field-input" placeholder="+91 98765 43210" />
            </Field>
            <Field label="City">
              <input type="text" value={form.city} onChange={set('city')} className="field-input" placeholder="Bengaluru" />
            </Field>
            <Field label="State">
              <input type="text" value={form.state} onChange={set('state')} className="field-input" placeholder="Karnataka" />
            </Field>
          </div>
          <Field label="Address">
            <input type="text" value={form.address} onChange={set('address')} className="field-input" placeholder="Street, Area" />
          </Field>
        </Section>

        {/* ── Email sender ── */}
        <Section title="Email sender" icon="✉️">
          <div className="bg-lime/5 border border-lime/20 rounded-lg px-4 py-3 text-sm text-muted mb-4">
            <p>Member emails (invoices, welcome, renewal reminders) are sent via <strong className="text-cream">SendGrid</strong> from your gym's address.</p>
            <p className="mt-1">Leave blank to use the FitOS platform sender. Your sender domain must be <strong className="text-cream">verified in SendGrid → Sender Authentication</strong> for emails to arrive reliably.</p>
          </div>

          <div className="flex flex-col gap-4">
            <Field
              label='From address'
              hint='Format: "IronZone Fitness &lt;billing@ironzone.in&gt;" or just "billing@ironzone.in"'
            >
              <input
                type="text"
                value={form.settings.emailFrom}
                onChange={setSett('emailFrom')}
                className="field-input"
                placeholder='IronZone Fitness <billing@ironzone.in>'
              />
            </Field>

            <Field
              label='Reply-to address (optional)'
              hint="If members reply to an invoice email, it lands here. Useful if your sending address is a no-reply."
            >
              <input
                type="email"
                value={form.settings.replyTo}
                onChange={setSett('replyTo')}
                className="field-input"
                placeholder="owner@ironzone.in"
              />
            </Field>

            {/* Test email */}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleTestEmail}
                disabled={testing}
                className="self-start flex items-center gap-2 border border-white/10 hover:border-lime/30 text-muted hover:text-cream text-sm px-4 py-2 rounded-lg transition-all disabled:opacity-50"
              >
                {testing ? (
                  <><span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" /> Sending…</>
                ) : (
                  <><span>📨</span> Send test email to {user?.email}</>
                )}
              </button>
              {testMsg && <p className="text-xs text-lime">{testMsg}</p>}
              {testErr && (
                <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  <p className="font-semibold mb-0.5">Test failed</p>
                  <p className="font-mono">{testErr}</p>
                  <p className="mt-1 text-red-400/70">{testErr.includes('API_KEY') ? 'Set SENDGRID_API_KEY in server/.env' : 'Verify your sender domain in SendGrid → Sender Authentication'}</p>
                </div>
              )}
            </div>
          </div>
        </Section>

        {/* ── Preferences ── */}
        <Section title="Preferences" icon="⚙️">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Currency">
              <Select
                value={form.settings.currency}
                onChange={(val) => setForm((v) => ({ ...v, settings: { ...v.settings, currency: val } }))}
                options={[
                  { value: 'INR', label: '₹ INR' },
                  { value: 'USD', label: '$ USD' },
                  { value: 'EUR', label: '€ EUR' },
                ]}
              />
            </Field>
            <Field label="Timezone">
              <Select
                value={form.settings.timezone}
                onChange={(val) => setForm((v) => ({ ...v, settings: { ...v.settings, timezone: val } }))}
                options={[
                  { value: 'Asia/Kolkata',    label: 'Asia/Kolkata (IST)' },
                  { value: 'Asia/Dubai',      label: 'Asia/Dubai (GST)' },
                  { value: 'America/New_York',label: 'America/New_York (ET)' },
                  { value: 'Europe/London',   label: 'Europe/London (GMT)' },
                ]}
              />
            </Field>
            <Field label="Brand colour">
              <div className="flex gap-2">
                <input
                  type="color"
                  value={form.settings.brandColor}
                  onChange={setSett('brandColor')}
                  className="h-[42px] w-12 rounded-lg border border-white/10 bg-transparent cursor-pointer p-1"
                />
                <input
                  type="text"
                  value={form.settings.brandColor}
                  onChange={setSett('brandColor')}
                  className="field-input flex-1 font-mono text-sm"
                  placeholder="#C8F135"
                />
              </div>
            </Field>
          </div>
        </Section>

        {/* Save bar */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-lime text-black font-bold px-8 py-3 rounded-lg text-sm hover:bg-lime-dark transition-all disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save settings'}
          </button>
          {saved && <span className="text-sm text-lime">✓ Settings saved</span>}
        </div>
      </form>
    </div>
  )
}

function Section({ title, icon, children }) {
  return (
    <div className="bg-card border border-white/[0.08] rounded-xl p-6 flex flex-col gap-5">
      <h2 className="font-bold text-base flex items-center gap-2">
        <span>{icon}</span>
        {title}
      </h2>
      {children}
    </div>
  )
}

function Field({ label, hint, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-muted leading-relaxed">{hint}</p>}
    </div>
  )
}
