import { useEffect, useState, useCallback } from 'react'
import { leadApi } from '../../api/lead.api'

const STAGES = [
  { key: 'new', label: 'New', color: 'border-blue-400/30   bg-blue-400/5' },
  { key: 'contacted', label: 'Contacted', color: 'border-yellow-400/30 bg-yellow-400/5' },
  { key: 'demo-scheduled', label: 'Demo scheduled', color: 'border-purple-400/30 bg-purple-400/5' },
  { key: 'converted', label: 'Converted', color: 'border-lime/30       bg-lime/5' },
  { key: 'lost', label: 'Lost', color: 'border-red-400/30    bg-red-400/5' },
]

const STAGE_DOT = {
  new: 'bg-blue-400',
  contacted: 'bg-yellow-400',
  'demo-scheduled': 'bg-purple-400',
  converted: 'bg-lime',
  lost: 'bg-red-400',
}

export default function Leads() {
  const [leads, setLeads] = useState([])
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [noteTarget, setNoteTarget] = useState(null)
  const [noteText, setNoteText] = useState('')
  const [noteLoading, setNoteLoading] = useState(false)

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
      </div>

      {/* Stage filter pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter('')}
          className={`text-xs px-3 py-1.5 rounded-full border transition-all ${filter === '' ? 'bg-lime/10 border-lime/30 text-lime font-semibold' : 'border-white/10 text-muted hover:text-cream'
            }`}
        >
          All ({leads.length})
        </button>
        {STAGES.map((s) => (
          <button
            key={s.key}
            onClick={() => setFilter(s.key)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${filter === s.key ? 'bg-lime/10 border-lime/30 text-lime font-semibold' : 'border-white/10 text-muted hover:text-cream'
              }`}
          >
            {s.label} ({counts[s.key] || 0})
          </button>
        ))}
      </div>

      {/* Lead cards */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-36 bg-card border border-white/[0.08] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-sm text-center text-muted">
          {filter ? 'No leads in this stage.' : "No leads yet. They'll appear here when someone submits the enquiry form."}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((lead) => {
            const stage = STAGES.find((s) => s.key === lead.stage)
            return (
              <div key={lead._id} className={`bg-card border rounded-xl p-5 flex flex-col gap-3 ${stage?.color || 'border-white/[0.08]'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold">{lead.name}</div>
                    {lead.gymName && <div className="text-xs text-muted">{lead.gymName}</div>}
                  </div>
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${STAGE_DOT[lead.stage] || 'bg-muted'}`} />
                </div>

                <div className="flex flex-col gap-1 text-xs text-muted">
                  <span>📞 {lead.phone}</span>
                  {lead.email && <span>✉️ {lead.email}</span>}
                  {lead.memberRange && <span>👥 {lead.memberRange} members</span>}
                  {lead.interest && <span>💡 {lead.interest.replace(/-/g, ' ')}</span>}
                </div>

                {lead.notes?.length > 0 && (
                  <div className="text-xs text-muted bg-white/[0.03] rounded-lg px-3 py-2 italic">
                    "{lead.notes[lead.notes.length - 1].text}"
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1 mt-auto">
                  <select
                    value={lead.stage}
                    onChange={(e) => moveStage(lead, e.target.value)}
                    className="flex-1 text-xs bg-black border border-white/10 rounded-lg px-2 py-1.5 text-cream focus:outline-none focus:border-lime/40"
                  >
                    {STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                  </select>
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

      {/* Note modal */}
      {noteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70">
          <div className="bg-card border border-white/[0.1] rounded-2xl w-full max-w-md p-7">
            <h2 className="mb-1 text-lg font-bold">Add note</h2>
            <p className="mb-5 text-sm text-muted">For lead: <span className="text-cream">{noteTarget.name}</span></p>

            {noteTarget.notes?.length > 0 && (
              <div className="flex flex-col gap-2 mb-4 overflow-y-auto max-h-32">
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
              className="w-full mb-4 resize-none field-input"
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
