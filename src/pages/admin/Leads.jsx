import { useEffect, useState, useCallback } from 'react'
import { leadApi } from '../../api/lead.api'
import Select from '../../components/ui/Select'

const STAGES = [
  { key: 'new',            label: 'New',            color: 'border-blue-400/30   bg-blue-400/5' },
  { key: 'contacted',      label: 'Contacted',       color: 'border-yellow-400/30 bg-yellow-400/5' },
  { key: 'demo-scheduled', label: 'Demo scheduled',  color: 'border-purple-400/30 bg-purple-400/5' },
  { key: 'converted',      label: 'Converted',       color: 'border-lime/30       bg-lime/5' },
  { key: 'lost',           label: 'Lost',            color: 'border-red-400/30    bg-red-400/5' },
]

const STAGE_DOT = {
  new:             'bg-blue-400',
  contacted:       'bg-yellow-400',
  'demo-scheduled':'bg-purple-400',
  converted:       'bg-lime',
  lost:            'bg-red-400',
}

const SOURCE_LABEL = {
  'landing-page': 'Enquiry form',
  'walk-in':      'Walk-in',
  'referral':     'Referral',
  'social':       'Social',
  'ad':           'Ad',
  'other':        'Other',
}

const SOURCE_BADGE = {
  'landing-page': 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  'walk-in':      'text-lime bg-lime/10 border-lime/20',
  'referral':     'text-purple-400 bg-purple-400/10 border-purple-400/20',
  'social':       'text-pink-400 bg-pink-400/10 border-pink-400/20',
  'ad':           'text-orange-400 bg-orange-400/10 border-orange-400/20',
  'other':        'text-muted bg-white/5 border-white/10',
}

// Sources a staff member can pick when manually logging a lead.
// "landing-page" and "ad" are digital-funnel-only and excluded here.
const STAFF_SOURCE_OPTIONS = [
  { value: 'walk-in',  label: 'Walk-in' },
  { value: 'referral', label: 'Referral' },
  { value: 'social',   label: 'Social media' },
  { value: 'other',    label: 'Other' },
]

const INTEREST_OPTIONS = [
  { value: 'membership',        label: 'Membership' },
  { value: 'personal-training', label: 'Personal training' },
  { value: 'group-class',       label: 'Group class' },
  { value: 'day-pass',          label: 'Day pass' },
  { value: 'other',             label: 'Other' },
]

export default function Leads() {
  const [leads,   setLeads]   = useState([])
  const [filter,  setFilter]  = useState('')
  const [loading, setLoading] = useState(true)
  const [noteTarget, setNoteTarget] = useState(null)
  const [noteText,   setNoteText]   = useState('')
  const [noteLoading, setNoteLoading] = useState(false)

  const [showAddModal, setShowAddModal] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await leadApi.list({ limit: 100 })
      setLeads(data.leads)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  async function moveStage(lead, stage) {
    try {
      await leadApi.update(lead._id, { stage })
      setLeads((prev) => prev.map((l) => l._id === lead._id ? { ...l, stage } : l))
    } catch { alert('Failed to update stage') }
  }

  async function addNote() {
    if (!noteText.trim()) return
    setNoteLoading(true)
    try {
      const { data } = await leadApi.addNote(noteTarget._id, noteText)
      setLeads((prev) => prev.map((l) => l._id === data._id ? data : l))
      setNoteText('')
      setNoteTarget(null)
    } catch { alert('Failed to add note') }
    finally { setNoteLoading(false) }
  }

  const filtered = filter
    ? leads.filter((l) => l.stage === filter)
    : leads

  // Group by stage for counts
  const counts = STAGES.reduce((acc, s) => {
    acc[s.key] = leads.filter((l) => l.stage === s.key).length
    return acc
  }, {})

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted text-sm mt-0.5">{leads.length} total leads</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-lime text-black font-bold px-5 py-2.5 rounded-lg text-sm hover:bg-lime-dark transition-all"
        >
          + Add lead
        </button>
      </div>

      {/* Stage filter pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter('')}
          className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
            filter === '' ? 'bg-lime/10 border-lime/30 text-lime font-semibold' : 'border-white/10 text-muted hover:text-cream'
          }`}
        >
          All ({leads.length})
        </button>
        {STAGES.map((s) => (
          <button
            key={s.key}
            onClick={() => setFilter(s.key)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
              filter === s.key ? 'bg-lime/10 border-lime/30 text-lime font-semibold' : 'border-white/10 text-muted hover:text-cream'
            }`}
          >
            {s.label} ({counts[s.key] || 0})
          </button>
        ))}
      </div>

      {/* Lead cards */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-36 bg-card border border-white/[0.08] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted text-sm">
          {filter
            ? 'No leads in this stage.'
            : (
              <>
                No leads yet. They'll appear here from the enquiry form, or you can{' '}
                <button onClick={() => setShowAddModal(true)} className="text-lime underline underline-offset-2">
                  add a walk-in lead
                </button>.
              </>
            )
          }
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((lead) => {
            const stage = STAGES.find((s) => s.key === lead.stage)
            return (
              <div key={lead._id} className={`bg-card border rounded-xl p-5 flex flex-col gap-3 ${stage?.color || 'border-white/[0.08]'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold text-sm">{lead.name}</div>
                    {lead.gymName && <div className="text-xs text-muted">{lead.gymName}</div>}
                  </div>
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${STAGE_DOT[lead.stage] || 'bg-muted'}`} />
                </div>

                {/* Source + who logged it */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${SOURCE_BADGE[lead.source] || SOURCE_BADGE.other}`}>
                    {SOURCE_LABEL[lead.source] || lead.source}
                  </span>
                  {lead.createdBy?.name && (
                    <span className="text-[10px] text-muted">Added by {lead.createdBy.name}</span>
                  )}
                </div>

                <div className="flex flex-col gap-1 text-xs text-muted">
                  <span className="flex items-center gap-2">
                    📞 {lead.phone}
                    <ContactButtons phone={lead.phone} />
                  </span>
                  {lead.email && <span>✉️ {lead.email}</span>}
                  {lead.memberRange && <span>👥 {lead.memberRange} members</span>}
                  {lead.interest && <span>💡 {lead.interest.replace(/-/g, ' ')}</span>}
                </div>

                {lead.message && !lead.notes?.length && (
                  <div className="text-xs text-muted bg-white/[0.03] rounded-lg px-3 py-2 italic">
                    "{lead.message}"
                  </div>
                )}

                {lead.notes?.length > 0 && (
                  <div className="text-xs text-muted bg-white/[0.03] rounded-lg px-3 py-2 italic">
                    "{lead.notes[lead.notes.length - 1].text}"
                  </div>
                )}

                <div className="flex items-center gap-2 mt-auto pt-1">
                  <Select
                    value={lead.stage}
                    onChange={(val) => moveStage(lead, val)}
                    options={STAGES.map((s) => ({ value: s.key, label: s.label }))}
                    className="flex-1"
                  />
                  <button
                    onClick={() => { setNoteTarget(lead); setNoteText('') }}
                    className="text-xs text-muted hover:text-lime border border-white/10 px-2.5 py-1.5 rounded-lg hover:border-lime/30 transition-all"
                    title="Add note"
                  >
                    + Note
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add walk-in lead modal */}
      {showAddModal && (
        <AddLeadModal
          onClose={() => setShowAddModal(false)}
          onCreated={(lead) => {
            setLeads((prev) => [lead, ...prev])
            setShowAddModal(false)
          }}
        />
      )}

      {/* Note modal */}
      {noteTarget && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
          <div className="bg-card border border-white/[0.1] rounded-2xl w-full max-w-md p-7">
            <h2 className="font-bold text-lg mb-1">Add note</h2>
            <p className="text-muted text-sm mb-5">For lead: <span className="text-cream">{noteTarget.name}</span></p>

            {noteTarget.notes?.length > 0 && (
              <div className="flex flex-col gap-2 mb-4 max-h-32 overflow-y-auto">
                {noteTarget.notes.map((n, i) => (
                  <div key={i} className="text-xs text-muted bg-white/[0.04] rounded-lg px-3 py-2">
                    {n.text}
                  </div>
                ))}
              </div>
            )}

            <textarea
              rows={3} placeholder="Write your follow-up note…"
              value={noteText} onChange={(e) => setNoteText(e.target.value)}
              className="field-input resize-none w-full mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => setNoteTarget(null)} className="flex-1 border border-white/10 text-muted py-2.5 rounded-lg text-sm hover:text-cream transition-all">Cancel</button>
              <button onClick={addNote} disabled={noteLoading || !noteText.trim()} className="flex-[2] bg-lime text-black font-bold py-2.5 rounded-lg text-sm hover:bg-lime-dark transition-all disabled:opacity-60">
                {noteLoading ? 'Saving…' : 'Save note'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Add lead modal ──────────────────────────────────────────────────────── */
function AddLeadModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    name: '', phone: '', email: '',
    source: 'walk-in', interest: 'membership', message: '',
  })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const set    = (f) => (e) => setForm((v) => ({ ...v, [f]: e.target.value }))
  const setVal = (f) => (val) => setForm((v) => ({ ...v, [f]: val }))

  async function save() {
    setError('')
    if (!form.name.trim())  { setError('Name is required'); return }
    if (!form.phone.trim()) { setError('Phone is required'); return }
    setLoading(true)
    try {
      const { data } = await leadApi.create(form)
      onCreated(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add lead')
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
      <div className="bg-card border border-white/[0.1] rounded-2xl w-full max-w-md p-7 relative">
        <button onClick={onClose} className="absolute top-4 right-5 text-muted hover:text-cream text-2xl leading-none">×</button>
        <h2 className="font-bold text-lg mb-1">Add a lead</h2>
        <p className="text-muted text-sm mb-5">
          For a walk-in, referral, or anyone who enquired outside the online form.
        </p>

        {error && (
          <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg mb-4">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-4">
          <Field label="Name *">
            <input type="text" value={form.name} onChange={set('name')} className="field-input" placeholder="Full name" autoFocus />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone *">
              <input type="tel" value={form.phone} onChange={set('phone')} className="field-input" placeholder="+91 98765 43210" />
            </Field>
            <Field label="Email (optional)">
              <input type="email" value={form.email} onChange={set('email')} className="field-input" placeholder="name@email.com" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Source">
              <Select value={form.source} onChange={setVal('source')} options={STAFF_SOURCE_OPTIONS} />
            </Field>
            <Field label="Interested in">
              <Select value={form.interest} onChange={setVal('interest')} options={INTEREST_OPTIONS} />
            </Field>
          </div>
          <Field label="Notes (optional)">
            <textarea
              rows={3} value={form.message} onChange={set('message')}
              className="field-input resize-none"
              placeholder="Anything worth remembering — what they asked about, when to follow up…"
            />
          </Field>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 border border-white/10 text-muted py-2.5 rounded-lg text-sm hover:text-cream transition-all">
            Cancel
          </button>
          <button onClick={save} disabled={loading} className="flex-[2] bg-lime text-black font-bold py-2.5 rounded-lg text-sm hover:bg-lime-dark transition-all disabled:opacity-60">
            {loading ? 'Adding…' : 'Add lead'}
          </button>
        </div>
      </div>
    </div>
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

/* ── Click-to-call / WhatsApp ────────────────────────────────────────────── */

// Strips everything but digits and a leading +, and assumes a bare 10-digit
// Indian mobile number (no country code) is +91 — matches how numbers are
// entered elsewhere in this app (e.g. "+91 98765 43210" placeholders).
export function normalizePhone(raw) {
  if (!raw) return ''
  let cleaned = raw.replace(/[^\d+]/g, '')
  if (!cleaned.startsWith('+')) {
    cleaned = cleaned.length === 10 ? `+91${cleaned}` : `+${cleaned}`
  }
  return cleaned
}

export function ContactButtons({ phone, size = 'sm' }) {
  const normalized = normalizePhone(phone)
  if (!normalized) return null
  const waNumber = normalized.replace('+', '')
  const dims = size === 'sm' ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm'

  return (
    <span className="inline-flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
      <a
        href={`tel:${normalized}`}
        title={`Call ${phone}`}
        className={`inline-flex items-center justify-center ${dims} rounded-full bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 transition-all`}
      >
        📞
      </a>
      <a
        href={`https://wa.me/${waNumber}`}
        target="_blank" rel="noopener noreferrer"
        title={`WhatsApp ${phone}`}
        className={`inline-flex items-center justify-center ${dims} rounded-full bg-green-500/10 text-green-400 hover:bg-green-500/20 hover:text-green-300 transition-all`}
      >
        💬
      </a>
    </span>
  )
}
