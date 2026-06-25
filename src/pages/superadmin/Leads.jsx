import { useEffect, useState, useCallback } from 'react'
import { saasAdminApi } from '../../api/index'
import { leadApi }      from '../../api/lead.api'

const STAGES = [
  { key: 'new',            label: 'New',           dot: 'bg-blue-400' },
  { key: 'contacted',      label: 'Contacted',     dot: 'bg-yellow-400' },
  { key: 'demo-scheduled', label: 'Demo scheduled',dot: 'bg-purple-400' },
  { key: 'converted',      label: 'Converted',     dot: 'bg-lime' },
  { key: 'lost',           label: 'Lost',          dot: 'bg-red-400' },
]

const LIMIT = 20

export default function SALeads() {
  const [leads,   setLeads]   = useState([])
  const [total,   setTotal]   = useState(0)
  const [page,    setPage]    = useState(1)
  const [stageF,  setStageF]  = useState('')
  const [loading, setLoading] = useState(true)
  const [noteTarget, setNoteTarget] = useState(null)
  const [noteText,   setNoteText]   = useState('')
  const [noteLoading, setNoteLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await saasAdminApi.leads({ page, limit: LIMIT, stage: stageF })
      setLeads(data.leads)
      setTotal(data.total)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [page, stageF])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [stageF])

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

  // Stage counts
  const counts = STAGES.reduce((acc, s) => {
    acc[s.key] = leads.filter((l) => l.stage === s.key).length
    return acc
  }, {})

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Enquiry leads</h1>
        <p className="text-muted text-sm mt-0.5">All pre-signup leads from the FitOS landing page — {total} total</p>
      </div>

      {/* Stage filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setStageF('')}
          className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
            stageF === '' ? 'bg-red-500/10 border-red-500/30 text-red-400 font-semibold' : 'border-white/10 text-muted hover:text-cream'
          }`}
        >
          All ({total})
        </button>
        {STAGES.map((s) => (
          <button
            key={s.key}
            onClick={() => setStageF(s.key)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
              stageF === s.key ? 'bg-red-500/10 border-red-500/30 text-red-400 font-semibold' : 'border-white/10 text-muted hover:text-cream'
            }`}
          >
            {s.label} ({counts[s.key] || 0})
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card border border-white/[0.08] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-left">
                {['Name', 'Gym', 'Contact', 'Members', 'Interest', 'Stage', 'Date', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs text-muted font-semibold uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="h-4 bg-white/[0.05] rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-muted text-sm">
                    No leads found{stageF ? ` in stage "${stageF}"` : ''}.
                  </td>
                </tr>
              ) : leads.map((lead) => {
                const stage = STAGES.find((s) => s.key === lead.stage)
                return (
                  <tr key={lead._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3.5 font-medium">{lead.name}</td>
                    <td className="px-4 py-3.5 text-muted text-xs max-w-[120px] truncate">{lead.gymName || '—'}</td>
                    <td className="px-4 py-3.5">
                      <div className="text-xs">
                        <div>{lead.phone}</div>
                        {lead.email && <div className="text-muted truncate max-w-[140px]">{lead.email}</div>}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-muted text-xs">{lead.memberRange || '—'}</td>
                    <td className="px-4 py-3.5 text-muted text-xs capitalize">{lead.interest?.replace(/-/g, ' ') || '—'}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${stage?.dot || 'bg-muted'}`} />
                        <select
                          value={lead.stage}
                          onChange={(e) => moveStage(lead, e.target.value)}
                          className="text-xs bg-transparent border border-white/10 rounded-lg px-2 py-1 text-cream focus:outline-none focus:border-red-400/40 cursor-pointer"
                        >
                          {STAGES.map((s) => <option key={s.key} value={s.key} className="bg-card">{s.label}</option>)}
                        </select>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-muted text-xs whitespace-nowrap">
                      {new Date(lead.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => { setNoteTarget(lead); setNoteText('') }}
                        className="text-xs text-red-400/70 hover:text-red-400 border border-white/10 hover:border-red-400/30 px-2.5 py-1 rounded-lg transition-all whitespace-nowrap"
                      >
                        + Note
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > LIMIT && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.06]">
            <span className="text-xs text-muted">
              {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}
            </span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}
                className="text-xs px-3 py-1.5 border border-white/10 rounded-lg text-muted disabled:opacity-40 hover:text-cream transition-all">
                ← Prev
              </button>
              <button disabled={page * LIMIT >= total} onClick={() => setPage((p) => p + 1)}
                className="text-xs px-3 py-1.5 border border-white/10 rounded-lg text-muted disabled:opacity-40 hover:text-cream transition-all">
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Note modal */}
      {noteTarget && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
          <div className="bg-card border border-white/[0.1] rounded-2xl w-full max-w-md p-7">
            <button onClick={() => setNoteTarget(null)} className="absolute top-4 right-5 text-muted hover:text-cream text-2xl leading-none">×</button>
            <h2 className="font-bold text-lg mb-1">Add follow-up note</h2>
            <p className="text-muted text-sm mb-4">Lead: <span className="text-cream">{noteTarget.name}</span></p>

            {noteTarget.notes?.length > 0 && (
              <div className="flex flex-col gap-2 mb-4 max-h-28 overflow-y-auto">
                {noteTarget.notes.map((n, i) => (
                  <div key={i} className="text-xs text-muted bg-white/[0.04] rounded-lg px-3 py-2">{n.text}</div>
                ))}
              </div>
            )}

            <textarea
              rows={3} placeholder="Call summary, next step, etc…"
              value={noteText} onChange={(e) => setNoteText(e.target.value)}
              className="field-input resize-none w-full mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => setNoteTarget(null)} className="flex-1 border border-white/10 text-muted py-2.5 rounded-lg text-sm hover:text-cream transition-all">Cancel</button>
              <button onClick={addNote} disabled={noteLoading || !noteText.trim()}
                className="flex-[2] bg-red-500 text-white font-bold py-2.5 rounded-lg text-sm hover:bg-red-600 transition-all disabled:opacity-60">
                {noteLoading ? 'Saving…' : 'Save note'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
