import { useEffect, useState, useCallback } from 'react'
import { complaintApi } from '../../api/index'
import Select from '../../components/ui/Select'
import { ContactButtons } from './Leads'

const STATUS_OPTIONS = [
  { value: 'open',        label: 'Open' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'resolved',    label: 'Resolved' },
  { value: 'closed',      label: 'Closed' },
]

const STATUS_BADGE = {
  open:          'text-blue-400 bg-blue-400/10 border-blue-400/20',
  'in-progress': 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  resolved:      'text-lime bg-lime/10 border-lime/20',
  closed:        'text-muted bg-white/5 border-white/10',
}

const PRIORITY_BADGE = {
  low:    'text-muted bg-white/5 border-white/10',
  medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  high:   'text-red-400 bg-red-400/10 border-red-400/20',
}

const TYPE_LABEL = { complaint: '⚠️ Complaint', request: '🙋 Request' }

const CATEGORY_LABEL = {
  trainer: 'Trainer', staff: 'Staff', equipment: 'Equipment', cleanliness: 'Cleanliness',
  facility: 'Facility', billing: 'Billing', 'class-schedule': 'Class schedule', other: 'Other',
}

export default function Complaints() {
  const [complaints, setComplaints] = useState([])
  const [openCount, setOpenCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [active, setActive] = useState(null)
  const [responseText, setResponseText] = useState('')
  const [responding, setResponding] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await complaintApi.list({
        status: statusFilter || undefined,
        type: typeFilter || undefined,
        limit: 100,
      })
      setComplaints(data.complaints)
      setOpenCount(data.openCount)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [statusFilter, typeFilter])

  useEffect(() => { load() }, [load])

  async function changeStatus(complaint, status) {
    try {
      const { data } = await complaintApi.updateStatus(complaint._id, { status })
      setComplaints((prev) => prev.map((c) => (c._id === data._id ? data : c)))
      if (active?._id === data._id) setActive(data)
    } catch { alert('Failed to update status') }
  }

  async function sendResponse() {
    if (!responseText.trim() || !active) return
    setResponding(true)
    try {
      const { data } = await complaintApi.respond(active._id, responseText)
      setComplaints((prev) => prev.map((c) => (c._id === data._id ? data : c)))
      setActive(data)
      setResponseText('')
    } catch { alert('Failed to send response') }
    finally { setResponding(false) }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Complaints & requests</h1>
          <p className="text-muted text-sm mt-0.5">
            {complaints.length} total · <span className="text-lime font-medium">{openCount} need attention</span>
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 mb-5 sm:flex-row">
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          options={STATUS_OPTIONS}
          placeholder="All statuses"
          isClearable
          className="sm:w-52"
        />
        <Select
          value={typeFilter}
          onChange={setTypeFilter}
          options={[{ value: 'complaint', label: 'Complaints' }, { value: 'request', label: 'Requests' }]}
          placeholder="All types"
          isClearable
          className="sm:w-52"
        />
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-40 bg-card border border-white/[0.08] rounded-xl animate-pulse" />)}
        </div>
      ) : complaints.length === 0 ? (
        <div className="py-20 text-sm text-center text-muted">
          No complaints or requests {statusFilter || typeFilter ? 'match these filters' : 'yet'}.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {complaints.map((c) => (
            <button
              key={c._id}
              onClick={() => setActive(c)}
              className="bg-card border border-white/[0.08] rounded-xl p-5 flex flex-col gap-2.5 text-left hover:border-white/20 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-semibold">{TYPE_LABEL[c.type]}</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_BADGE[c.status]}`}>
                  {STATUS_OPTIONS.find((s) => s.value === c.status)?.label}
                </span>
              </div>
              <h3 className="font-semibold text-sm leading-snug">{c.subject}</h3>
              <p className="text-xs text-muted line-clamp-2">{c.message}</p>
              <div className="flex items-center gap-2 flex-wrap mt-1">
                <span className="text-[10px] text-muted border border-white/10 px-2 py-0.5 rounded-full">
                  {CATEGORY_LABEL[c.category] || c.category}
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${PRIORITY_BADGE[c.priority]}`}>
                  {c.priority}
                </span>
              </div>
              <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/[0.06] text-xs text-muted">
                <span>{c.memberId?.name || 'Member'}</span>
                <span>{new Date(c.createdAt).toLocaleDateString('en-IN')}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {active && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70" onClick={() => setActive(null)}>
          <div
            className="bg-card border border-white/[0.1] rounded-2xl w-full max-w-lg p-7 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-1">
              <span className="text-xs font-semibold text-muted">{TYPE_LABEL[active.type]}</span>
              <button onClick={() => setActive(null)} className="text-xl leading-none text-muted hover:text-cream">×</button>
            </div>
            <h2 className="mb-1 text-lg font-bold">{active.subject}</h2>
            <p className="text-sm text-muted mb-4">{active.message}</p>

            <div className="flex items-center gap-3 mb-5 text-xs text-muted">
              <span>👤 {active.memberId?.name || 'Member'}</span>
              {active.memberId?.phone && (
                <span className="flex items-center gap-1.5">
                  📞 {active.memberId.phone}
                  <ContactButtons phone={active.memberId.phone} />
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <Field label="Status">
                <Select
                  value={active.status}
                  onChange={(val) => changeStatus(active, val)}
                  options={STATUS_OPTIONS}
                />
              </Field>
              <Field label="Category">
                <div className="px-3 py-2 text-sm border rounded-lg border-white/10 text-muted">
                  {CATEGORY_LABEL[active.category] || active.category}
                </div>
              </Field>
            </div>

            {/* Response thread */}
            {active.responses?.length > 0 && (
              <div className="flex flex-col gap-2 mb-4">
                <p className="text-xs font-semibold text-muted">Responses</p>
                {active.responses.map((r, i) => (
                  <div key={i} className="text-sm bg-white/[0.03] rounded-lg px-3 py-2">
                    <p>{r.text}</p>
                    <p className="mt-1 text-[11px] text-muted">
                      {r.respondedBy?.name || 'Staff'} · {new Date(r.createdAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <textarea
                rows={3}
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Write a response to the member…"
                className="resize-none field-input"
              />
              <button
                onClick={sendResponse}
                disabled={responding || !responseText.trim()}
                className="bg-lime text-black font-bold py-2.5 rounded-lg text-sm hover:bg-lime-dark transition-all disabled:opacity-60"
              >
                {responding ? 'Sending…' : 'Send response'}
              </button>
            </div>
          </div>
        </div>
      )}
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
