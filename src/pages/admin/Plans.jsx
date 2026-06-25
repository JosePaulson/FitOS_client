import { useEffect, useState } from 'react'
import { planApi } from '../../api/index'

export default function Plans() {
  const [plans,   setPlans]   = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing,  setEditing]  = useState(null)
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  async function load() {
    setLoading(true)
    try { const { data } = await planApi.list(); setPlans(data) }
    catch { /* ignore */ }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function handleSave(form) {
    setFormError('')
    setFormLoading(true)
    try {
      if (editing) {
        await planApi.update(editing._id, form)
      } else {
        await planApi.create(form)
      }
      setShowForm(false)
      setEditing(null)
      load()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save plan')
    } finally { setFormLoading(false) }
  }

  async function deactivate(plan) {
    if (!confirm(`Deactivate "${plan.name}"? Existing members won't be affected.`)) return
    try { await planApi.remove(plan._id); load() }
    catch { alert('Failed to deactivate plan') }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Membership plans</h1>
          <p className="text-muted text-sm mt-0.5">Define the plans you offer to members</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditing(null); setFormError('') }}
          className="bg-lime text-black font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-lime-dark transition-all"
        >
          + New plan
        </button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[1,2,3].map((i) => <div key={i} className="h-36 bg-card border border-white/[0.08] rounded-xl animate-pulse" />)}
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-20 text-muted text-sm">
          No plans yet. Create your first membership plan to start enrolling members.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {plans.map((plan) => (
            <div key={plan._id} className="bg-card border border-white/[0.08] rounded-xl p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-lg">{plan.name}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setEditing(plan); setShowForm(true); setFormError('') }}
                    className="text-xs text-muted hover:text-cream border border-white/10 px-2.5 py-1 rounded-lg hover:border-white/20 transition-all"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deactivate(plan)}
                    className="text-xs text-red-400/70 hover:text-red-400 border border-white/10 px-2.5 py-1 rounded-lg hover:border-red-400/20 transition-all"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div className="text-3xl font-black text-lime mb-0.5">
                ₹{plan.price.toLocaleString('en-IN')}
              </div>
              <div className="flex gap-3 text-xs text-muted mb-3">
                <span>Base: ₹{plan.baseAmount?.toLocaleString('en-IN')}</span>
                <span>·</span>
                <span>GST ({plan.taxRate}%): ₹{plan.taxAmount?.toLocaleString('en-IN')}</span>
              </div>
              <p className="text-muted text-sm mb-3">
                {plan.durationDays} days
                {plan.sessionsIncluded > 0 && ` · ${plan.sessionsIncluded} PT sessions`}
              </p>
              {plan.description && (
                <p className="text-xs text-muted border-t border-white/[0.06] pt-3">{plan.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Plan form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
          <div className="bg-card border border-white/[0.1] rounded-2xl w-full max-w-md p-7">
            <button
              onClick={() => { setShowForm(false); setEditing(null) }}
              className="absolute top-4 right-4 text-muted hover:text-cream text-xl leading-none"
            />
            <h2 className="font-bold text-lg mb-5">{editing ? 'Edit plan' : 'New plan'}</h2>
            <PlanForm
              initial={editing}
              error={formError}
              loading={formLoading}
              onSubmit={handleSave}
              onClose={() => { setShowForm(false); setEditing(null) }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function PlanForm({ initial, error, loading, onSubmit, onClose }) {
  const [form, setForm] = useState({
    name:             initial?.name             || '',
    description:      initial?.description      || '',
    durationDays:     initial?.durationDays     || 30,
    price:            initial?.price            || '',
    taxRate:          initial?.taxRate          ?? 18,
    sessionsIncluded: initial?.sessionsIncluded || 0,
  })
  const set = (f) => (e) => setForm((v) => ({ ...v, [f]: e.target.value }))

  // Live GST breakdown
  const priceNum  = parseFloat(form.price) || 0
  const taxRate   = parseFloat(form.taxRate) || 18
  const baseAmt   = priceNum > 0 ? Math.round((priceNum / (1 + taxRate / 100)) * 100) / 100 : 0
  const taxAmt    = Math.round((priceNum - baseAmt) * 100) / 100

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form) }} className="flex flex-col gap-4">
      {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">{error}</p>}

      <Field label="Plan name *">
        <input type="text" value={form.name} onChange={set('name')} className="field-input" placeholder="Monthly Premium" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Duration (days) *">
          <input type="number" min="1" value={form.durationDays} onChange={set('durationDays')} className="field-input" />
        </Field>
        <Field label="GST rate (%)">
          <select value={form.taxRate} onChange={set('taxRate')} className="field-input">
            <option value="0">0% (exempt)</option>
            <option value="5">5%</option>
            <option value="12">12%</option>
            <option value="18">18% (standard)</option>
            <option value="28">28%</option>
          </select>
        </Field>
      </div>
      <Field label="Final price member pays (₹, GST inclusive) *">
        <input type="number" min="0" value={form.price} onChange={set('price')} className="field-input" placeholder="1500" />
        {priceNum > 0 && (
          <div className="flex gap-4 mt-1.5 text-xs text-muted">
            <span>Base: <span className="text-cream">₹{baseAmt.toLocaleString('en-IN')}</span></span>
            <span>GST ({taxRate}%): <span className="text-cream">₹{taxAmt.toLocaleString('en-IN')}</span></span>
            <span className="text-lime font-semibold">Member pays: ₹{priceNum.toLocaleString('en-IN')}</span>
          </div>
        )}
      </Field>
      <Field label="PT sessions included (0 = unlimited gym access)">
        <input type="number" min="0" value={form.sessionsIncluded} onChange={set('sessionsIncluded')} className="field-input" />
      </Field>
      <Field label="Description (optional)">
        <textarea rows={2} value={form.description} onChange={set('description')} className="field-input resize-none" placeholder="What's included in this plan…" />
      </Field>
      <div className="flex gap-3 mt-1">
        <button type="button" onClick={onClose} className="flex-1 border border-white/10 text-muted py-2.5 rounded-lg text-sm hover:text-cream transition-all">Cancel</button>
        <button type="submit" disabled={loading} className="flex-[2] bg-lime text-black font-bold py-2.5 rounded-lg text-sm hover:bg-lime-dark transition-all disabled:opacity-60">
          {loading ? 'Saving…' : (initial ? 'Update plan' : 'Create plan')}
        </button>
      </div>
    </form>
  )
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted">{label}</label>
      {children}
    </div>
  )
}
