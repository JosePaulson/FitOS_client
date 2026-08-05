import { useEffect, useState } from 'react'
import { staffPayrollApi, staffApi } from '../../api/index'
import { useAuth } from '../../context/AuthContext'
import Select from '../../components/ui/Select'

const STATUS_STYLE = {
  present:       { bg: 'rgba(200,241,53,0.18)', border: 'rgba(200,241,53,0.5)', color: '#c8f135', label: 'Present' },
  absent:        { bg: 'rgba(248,113,113,0.16)', border: 'rgba(248,113,113,0.5)', color: '#f87171', label: 'Absent' },
  'half-day':    { bg: 'rgba(167,139,250,0.16)', border: 'rgba(167,139,250,0.5)', color: '#a78bfa', label: 'Half day' },
  off:           { bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.15)', color: '#9a9a94', label: 'Weekly off' },
  'leave-paid':  { bg: 'rgba(96,165,250,0.16)', border: 'rgba(96,165,250,0.5)', color: '#60a5fa', label: 'Paid leave' },
  'leave-unpaid':{ bg: 'rgba(251,191,36,0.14)', border: 'rgba(251,191,36,0.45)', color: '#fbbf24', label: 'Unpaid leave' },
  pending:       { bg: 'transparent', border: 'rgba(200,241,53,0.6)', color: '#c8f135', label: 'Pending approval' },
}

function canPayroll(user, action) {
  if (user?.role === 'owner') return true
  if (user?.role === 'manager') return !!user?.permissions?.payroll?.[action]
  return false
}

function thisMonthKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export default function Payroll() {
  const { user } = useAuth()
  const perms = {
    view: canPayroll(user, 'view'),
    edit: canPayroll(user, 'edit'),
    approve: canPayroll(user, 'approve'),
    delete: canPayroll(user, 'delete'),
  }
  const isOwner = user?.role === 'owner'

  // Owners aren't staff — they don't have attendance or a base salary of
  // their own, so they never see a "my attendance & pay" self-tab. They
  // manage everyone else's instead.
  const TABS = [
    ...(!isOwner ? [{ key: 'me', label: 'My attendance & pay' }] : []),
    ...(perms.approve ? [{ key: 'approvals', label: 'Approvals' }] : []),
    ...(perms.view ? [{ key: 'staff', label: 'Staff management' }] : []),
    ...(isOwner ? [{ key: 'basepay', label: 'Base pay' }] : []),
    ...(isOwner ? [{ key: 'analytics', label: 'Analytics' }] : []),
    ...(isOwner ? [{ key: 'access', label: 'Access control' }] : []),
  ]
  const [tab, setTab] = useState(isOwner ? 'approvals' : 'me')

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Payroll</h1>
        <p className="mt-0.5 text-sm text-muted">
          {isOwner ? "Attendance, leave, and pay for your team." : 'Attendance, leave, and pay — for you and, where you have access, your team.'}
        </p>
      </div>

      <div className="flex gap-1 mb-6 overflow-x-auto border-b border-white/10">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-all"
            style={{
              borderColor: tab === t.key ? '#c8f135' : 'transparent',
              color: tab === t.key ? '#F5F4EF' : '#888880',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'me' && !isOwner && <MyAttendanceTab />}
      {tab === 'approvals' && perms.approve && <ApprovalsTab />}
      {tab === 'staff' && perms.view && <StaffManagementTab perms={perms} currentUserId={user?._id} />}
      {tab === 'basepay' && isOwner && <BasePayTab />}
      {tab === 'analytics' && isOwner && <AnalyticsTab />}
      {tab === 'access' && isOwner && <AccessControlTab />}
    </div>
  )
}

/* ── My attendance & pay ──────────────────────────────────────────────────── */

function MyAttendanceTab() {
  const [month, setMonth] = useState(thisMonthKey())
  const [calendar, setCalendar] = useState(null)
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showSubmit, setShowSubmit] = useState(false)

  function load() {
    setLoading(true)
    Promise.all([staffPayrollApi.myCalendar(month), staffPayrollApi.mySummary(month)])
      .then(([c, s]) => { setCalendar(c.data); setSummary(s.data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }
  useEffect(load, [month])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <MonthPicker value={month} onChange={setMonth} />
        <button
          onClick={() => setShowSubmit(true)}
          className="bg-lime text-black font-bold text-sm px-4 py-2 rounded-lg hover:bg-lime-dark transition-all"
        >
          + Submit attendance
        </button>
      </div>

      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Base salary" value={summary.baseSalary != null ? `₹${summary.baseSalary.toLocaleString('en-IN')}` : '—'} />
          <StatCard label="Days worked" value={summary.summary.present} accent="#c8f135" />
          <StatCard label="Half days" value={summary.summary.halfDay} accent="#a78bfa" />
          <StatCard label="Days absent" value={summary.summary.absent} accent="#f87171" />
          <StatCard label="Net payable" value={summary.netPayable != null ? `₹${summary.netPayable.toLocaleString('en-IN')}` : '—'} accent="#c8f135" />
        </div>
      )}

      <div className="p-5 bg-card border border-white/[0.08] rounded-xl">
        <h3 className="mb-4 text-sm font-semibold">Calendar</h3>
        {loading ? (
          <div className="h-64 rounded-lg animate-pulse bg-white/5" />
        ) : calendar ? (
          <AttendanceCalendar monthKey={month} days={calendar.days} />
        ) : null}
      </div>

      {summary?.summary.pending > 0 && (
        <p className="text-xs text-muted">
          {summary.summary.pending} day{summary.summary.pending === 1 ? '' : 's'} awaiting approval from your gym.
        </p>
      )}

      {showSubmit && (
        <Modal title="Submit attendance" onClose={() => setShowSubmit(false)} wide>
          <BulkSubmitAttendanceForm
            monthKey={month}
            calendarDays={calendar?.days || []}
            onSaved={() => { setShowSubmit(false); load() }}
            onClose={() => setShowSubmit(false)}
          />
        </Modal>
      )}
    </div>
  )
}

/**
 * Lets a staff member pick several dates at once (e.g. every day of last
 * month) and submit them all for approval in a single request, instead of
 * one date at a time. Dates that already have a pending/approved record
 * can't be re-selected.
 */
function BulkSubmitAttendanceForm({ monthKey, calendarDays, onSaved, onClose }) {
  const [selected, setSelected] = useState([]) // array of dateKey, in click order
  const [status, setStatus] = useState('present')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const todayKey = new Date().toISOString().slice(0, 10)
  const takenKeys = new Set(
    calendarDays.filter((d) => d.status === 'pending' || (d.record && d.record.requestStatus !== 'rejected')).map((d) => d.date)
  )

  function toggleDate(dateKey) {
    if (dateKey > todayKey) return
    if (takenKeys.has(dateKey)) return
    setSelected((prev) => prev.includes(dateKey) ? prev.filter((d) => d !== dateKey) : [...prev, dateKey].sort())
  }

  function selectAllOpenDaysThisMonth() {
    const openDates = calendarDays
      .filter((d) => !d.isOff && d.date <= todayKey && !takenKeys.has(d.date))
      .map((d) => d.date)
    setSelected(openDates)
  }

  async function submit(e) {
    e.preventDefault()
    if (selected.length === 0) { setError('Select at least one date'); return }
    setError(''); setLoading(true)
    try {
      const entries = selected.map((date) => ({ date, status, notes }))
      const { data } = await staffPayrollApi.submitMyAttendanceBulk(entries)
      if (data.errors?.length) {
        setError(`${data.errors.length} date(s) couldn't be submitted — ${data.errors[0].message}`)
      } else {
        onSaved()
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit')
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      {error && <p className="px-3 py-2 text-sm text-red-400 border rounded-lg bg-red-500/10 border-red-500/20">{error}</p>}

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted">Tap dates to select them. Days already submitted or approved can't be re-selected.</p>
        <button type="button" onClick={selectAllOpenDaysThisMonth} className="shrink-0 text-xs font-semibold text-lime hover:text-lime-dark">
          Select all open days
        </button>
      </div>

      <MiniSelectableCalendar monthKey={monthKey} days={calendarDays} selected={selected} takenKeys={takenKeys} onToggle={toggleDate} />

      <p className="text-xs text-muted">{selected.length} date{selected.length === 1 ? '' : 's'} selected</p>

      <Field label="Status to apply to all selected dates">
        <Select
          value={status}
          onChange={setStatus}
          options={[
            { value: 'present', label: 'Present' },
            { value: 'half-day', label: 'Half day' },
            { value: 'absent', label: 'Absent' },
            { value: 'leave-unpaid', label: 'Leave (request)' },
          ]}
        />
        {status === 'leave-unpaid' && (
          <p className="mt-1 text-[11px] text-muted">Whether this leave is paid is decided when it's approved.</p>
        )}
      </Field>
      <Field label="Notes (optional, applied to all selected dates)">
        <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)}
          className="resize-none field-input" placeholder="Reason, context for your manager…" />
      </Field>

      <div className="flex gap-3 mt-1">
        <button type="button" onClick={onClose} className="flex-1 border border-white/10 text-muted py-2.5 rounded-lg text-sm hover:text-cream transition-all">Cancel</button>
        <button type="submit" disabled={loading || selected.length === 0} className="flex-[2] bg-lime text-black font-bold py-2.5 rounded-lg text-sm hover:bg-lime-dark transition-all disabled:opacity-60">
          {loading ? 'Submitting…' : `Submit ${selected.length || ''} for approval`}
        </button>
      </div>
    </form>
  )
}

function MiniSelectableCalendar({ monthKey, days, selected, takenKeys, onToggle }) {
  const [y, m] = monthKey.split('-').map(Number)
  const firstWeekday = new Date(Date.UTC(y, m - 1, 1)).getUTCDay()
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate()
  const todayKey = new Date().toISOString().slice(0, 10)
  const selectedSet = new Set(selected)

  const cells = []
  for (let i = 0; i < firstWeekday; i++) cells.push(null)
  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = `${monthKey}-${String(day).padStart(2, '0')}`
    cells.push({ day, dateKey })
  }

  return (
    <div>
      <div className="grid grid-cols-7 mb-1 text-[10px] font-semibold text-muted">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i} className="text-center py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((c, i) => {
          if (!c) return <div key={`empty-${i}`} />
          const disabled = c.dateKey > todayKey || takenKeys.has(c.dateKey)
          const isSelected = selectedSet.has(c.dateKey)
          return (
            <button
              key={c.dateKey}
              type="button"
              disabled={disabled}
              onClick={() => onToggle(c.dateKey)}
              title={disabled ? 'Already submitted / not yet reached' : c.dateKey}
              className="flex items-center justify-center text-xs font-semibold rounded-lg aspect-square transition-all disabled:cursor-not-allowed"
              style={{
                background: isSelected ? 'rgba(200,241,53,0.22)' : disabled ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)',
                border: `1.5px solid ${isSelected ? 'rgba(200,241,53,0.7)' : 'rgba(255,255,255,0.08)'}`,
                color: disabled ? '#555550' : isSelected ? '#c8f135' : '#F5F4EF',
                opacity: disabled ? 0.5 : 1,
              }}
            >
              {c.day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ── Approvals ────────────────────────────────────────────────────────────── */

function ApprovalsTab() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [busyGroupKey, setBusyGroupKey] = useState(null)

  function load() {
    setLoading(true)
    staffPayrollApi.pending().then(({ data }) => setRecords(data)).catch(() => {}).finally(() => setLoading(false))
  }
  useEffect(load, [])

  async function handleApprove(record, markPaid) {
    setBusyId(record._id); setError('')
    try {
      await staffPayrollApi.approve(record._id, markPaid)
      setRecords((prev) => prev.filter((r) => r._id !== record._id))
    } catch (err) { setError(err.response?.data?.message || 'Failed to approve') }
    finally { setBusyId(null) }
  }
  async function handleReject(record) {
    const reason = prompt('Reason for rejecting (optional):') || ''
    setBusyId(record._id); setError('')
    try {
      await staffPayrollApi.reject(record._id, reason)
      setRecords((prev) => prev.filter((r) => r._id !== record._id))
    } catch (err) { setError(err.response?.data?.message || 'Failed to reject') }
    finally { setBusyId(null) }
  }

  // Group pending requests by staff member + month, so an owner/manager
  // can review and approve an entire month's worth of submissions at once
  // (e.g. everything a staff member submitted at the start of the month
  // for the month prior) instead of clicking through day by day.
  const groups = groupByStaffMonth(records)

  async function handleApproveGroup(group) {
    const ids = group.records.map((r) => r._id)
    setBusyGroupKey(group.key); setError('')
    try {
      await staffPayrollApi.approveBulk(ids)
      setRecords((prev) => prev.filter((r) => !ids.includes(r._id)))
    } catch (err) { setError(err.response?.data?.message || 'Failed to approve the month') }
    finally { setBusyGroupKey(null) }
  }
  async function handleRejectGroup(group) {
    const reason = prompt(`Reason for rejecting all ${group.records.length} day(s) (optional):`) || ''
    const ids = group.records.map((r) => r._id)
    setBusyGroupKey(group.key); setError('')
    try {
      await staffPayrollApi.rejectBulk(ids, reason)
      setRecords((prev) => prev.filter((r) => !ids.includes(r._id)))
    } catch (err) { setError(err.response?.data?.message || 'Failed to reject the month') }
    finally { setBusyGroupKey(null) }
  }

  if (loading) return <div className="h-40 rounded-xl animate-pulse bg-white/5" />

  return (
    <div className="flex flex-col gap-5">
      {error && <p className="px-3 py-2 text-sm text-red-400 border rounded-lg bg-red-500/10 border-red-500/20">{error}</p>}
      {groups.length === 0 ? (
        <p className="py-16 text-sm text-center text-muted">No pending attendance requests 🎉</p>
      ) : groups.map((group) => (
        <div key={group.key} className="border border-white/[0.08] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-3 bg-white/[0.03] border-b border-white/[0.06]">
            <div>
              <p className="text-sm font-semibold">{group.staffName} <span className="font-normal text-muted">· {group.staffRole}</span></p>
              <p className="text-xs text-muted">{group.monthLabel} · {group.records.length} day{group.records.length === 1 ? '' : 's'} pending</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button disabled={busyGroupKey === group.key} onClick={() => handleApproveGroup(group)}
                className="text-xs font-semibold text-black bg-lime px-3 py-1.5 rounded-lg hover:bg-lime-dark transition-all disabled:opacity-50">
                Approve all {group.records.length}
              </button>
              <button disabled={busyGroupKey === group.key} onClick={() => handleRejectGroup(group)}
                className="text-xs font-semibold text-red-400 border border-red-400/30 px-3 py-1.5 rounded-lg hover:bg-red-400/10 transition-all disabled:opacity-50">
                Reject all
              </button>
            </div>
          </div>
          <div className="flex flex-col divide-y divide-white/[0.04]">
            {group.records.map((r) => (
              <div key={r._id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="text-xs text-muted">
                    {new Date(r.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} ·{' '}
                    <span style={{ color: STATUS_STYLE[r.status]?.color }}>{STATUS_STYLE[r.status]?.label}</span>
                  </p>
                  {r.notes && <p className="mt-1 text-xs italic text-muted">"{r.notes}"</p>}
                </div>
                <div className="flex gap-2 shrink-0">
                  {r.status === 'leave-unpaid' && (
                    <button disabled={busyId === r._id} onClick={() => handleApprove(r, true)}
                      className="text-xs font-semibold text-blue-400 border border-blue-400/30 px-2.5 py-1.5 rounded-lg hover:bg-blue-400/10 transition-all disabled:opacity-50">
                      Approve as paid
                    </button>
                  )}
                  <button disabled={busyId === r._id} onClick={() => handleApprove(r, undefined)}
                    className="text-xs font-semibold text-black bg-lime px-2.5 py-1.5 rounded-lg hover:bg-lime-dark transition-all disabled:opacity-50">
                    Approve
                  </button>
                  <button disabled={busyId === r._id} onClick={() => handleReject(r)}
                    className="text-xs font-semibold text-red-400 border border-red-400/30 px-2.5 py-1.5 rounded-lg hover:bg-red-400/10 transition-all disabled:opacity-50">
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function groupByStaffMonth(records) {
  const map = new Map()
  for (const r of records) {
    const monthKey = new Date(r.date).toISOString().slice(0, 7)
    const staffId = r.staffId?._id || r.staffId
    const key = `${staffId}-${monthKey}`
    if (!map.has(key)) {
      map.set(key, {
        key,
        staffName: r.staffId?.name || 'Staff member',
        staffRole: r.staffId?.role || '',
        monthLabel: new Date(r.date).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
        records: [],
      })
    }
    map.get(key).records.push(r)
  }
  // Sort each group's days chronologically, and put the most recent month first.
  return Array.from(map.values())
    .map((g) => ({ ...g, records: g.records.sort((a, b) => new Date(a.date) - new Date(b.date)) }))
    .sort((a, b) => new Date(b.records[0].date) - new Date(a.records[0].date))
}

function AttendanceCalendar({ monthKey, days, onDayClick, selectable }) {
  const [y, m] = monthKey.split('-').map(Number)
  const firstWeekday = new Date(Date.UTC(y, m - 1, 1)).getUTCDay()
  const dayMap = new Map(days.map((d) => [d.date, d]))
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate()

  const cells = []
  for (let i = 0; i < firstWeekday; i++) cells.push(null)
  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = `${monthKey}-${String(day).padStart(2, '0')}`
    cells.push({ day, dateKey, info: dayMap.get(dateKey) })
  }

  return (
    <div>
      <div className="grid grid-cols-7 mb-1 text-[10px] font-semibold text-muted">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i} className="text-center py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((c, i) => {
          if (!c) return <div key={`empty-${i}`} />
          const style = c.info ? STATUS_STYLE[c.info.status] : null
          return (
            <button
              key={c.dateKey}
              type="button"
              disabled={!selectable || !c.info}
              onClick={() => selectable && onDayClick?.(c)}
              className="flex items-center justify-center text-xs font-semibold rounded-lg aspect-square transition-all disabled:cursor-default"
              style={{
                background: style?.bg || 'rgba(255,255,255,0.02)',
                border: `1.5px solid ${style?.border || 'rgba(255,255,255,0.06)'}`,
                borderStyle: c.info?.status === 'pending' ? 'dashed' : 'solid',
                color: style?.color || '#888880',
              }}
            >
              {c.day}
            </button>
          )
        })}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-4">
        {Object.entries(STATUS_STYLE).map(([key, s]) => (
          <span key={key} className="flex items-center gap-1.5 text-[11px] text-muted">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.border }} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  )
}

function MonthPicker({ value, onChange }) {
  return (
    <input
      type="month"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-cream w-fit"
    />
  )
}

function StatCard({ label, value, accent }) {
  return (
    <div className="p-4 bg-card border border-white/[0.08] rounded-xl">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-xl font-bold" style={accent ? { color: accent } : undefined}>{value}</p>
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

function Modal({ title, onClose, children, wide }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70">
      <div className={`bg-card border border-white/[0.1] rounded-2xl w-full ${wide ? 'max-w-lg' : 'max-w-md'} p-7 relative max-h-[90vh] overflow-y-auto`}>
        <button onClick={onClose} className="absolute text-xl leading-none top-4 right-5 text-muted hover:text-cream">×</button>
        <h2 className="mb-5 text-lg font-bold">{title}</h2>
        {children}
      </div>
    </div>
  )
}

/* ── Staff management (salary, off-schedule, per-staff calendar) ─────────── */

function StaffManagementTab({ perms, currentUserId }) {
  const [staffList, setStaffList] = useState([])
  const [staffId, setStaffId] = useState('')
  const [month, setMonth] = useState(thisMonthKey())
  const [calendar, setCalendar] = useState(null)
  const [summary, setSummary] = useState(null)
  const [salary, setSalary] = useState(null)
  const [schedule, setSchedule] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showSalaryForm, setShowSalaryForm] = useState(false)
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [showSetDay, setShowSetDay] = useState(null)

  useEffect(() => {
    staffApi.list({ excludeOwner: 'true' }).then((res) => {
      const list = res.data.filter((s) => s._id !== currentUserId)
      setStaffList(list)
      if (list.length && !staffId) setStaffId(list[0]._id)
    }).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function load() {
    if (!staffId) return
    setLoading(true)
    Promise.all([
      staffPayrollApi.staffCalendar(staffId, month),
      staffPayrollApi.staffSummary(staffId, month),
      staffPayrollApi.getSalary(staffId),
      staffPayrollApi.getSchedule(staffId),
    ])
      .then(([c, s, sal, sched]) => { setCalendar(c.data); setSummary(s.data); setSalary(sal.data); setSchedule(sched.data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }
  useEffect(load, [staffId, month])

  const selectedStaff = staffList.find((s) => s._id === staffId)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3 flex-wrap">
        <Select
          value={staffId}
          onChange={setStaffId}
          options={staffList.map((s) => ({ value: s._id, label: `${s.name} · ${s.role}` }))}
          placeholder="Select staff member"
          className="w-64"
        />
        <MonthPicker value={month} onChange={setMonth} />
      </div>

      {!staffId ? (
        <p className="py-16 text-sm text-center text-muted">No other staff members yet.</p>
      ) : loading ? (
        <div className="h-64 rounded-xl animate-pulse bg-white/5" />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Base salary" value={salary?.monthlyBaseSalary != null ? `₹${salary.monthlyBaseSalary.toLocaleString('en-IN')}` : 'Not set'} />
            <StatCard label="Days worked" value={summary?.summary.present ?? 0} accent="#c8f135" />
            <StatCard label="Half days" value={summary?.summary.halfDay ?? 0} accent="#a78bfa" />
            <StatCard label="Days absent" value={summary?.summary.absent ?? 0} accent="#f87171" />
            <StatCard label="Net payable" value={summary?.netPayable != null ? `₹${summary.netPayable.toLocaleString('en-IN')}` : '—'} accent="#c8f135" />
          </div>

          {perms.edit && (
            <div className="flex gap-3 flex-wrap">
              <button onClick={() => setShowSalaryForm(true)}
                className="text-sm font-semibold text-cream border border-white/10 px-4 py-2 rounded-lg hover:border-white/20 transition-all">
                💰 Set salary
              </button>
              <button onClick={() => setShowScheduleForm(true)}
                className="text-sm font-semibold text-cream border border-white/10 px-4 py-2 rounded-lg hover:border-white/20 transition-all">
                📅 Set weekly off / custom offs
              </button>
              {perms.approve && summary?.summary.pending > 0 && (
                <button onClick={async () => {
                  await staffPayrollApi.approveMonth(staffId, month)
                  load()
                }}
                  className="text-sm font-semibold text-black bg-lime px-4 py-2 rounded-lg hover:bg-lime-dark transition-all">
                  ✓ Approve entire month ({summary.summary.pending} pending)
                </button>
              )}
            </div>
          )}

          <div className="p-5 bg-card border border-white/[0.08] rounded-xl">
            <h3 className="mb-1 text-sm font-semibold">{selectedStaff?.name}'s calendar</h3>
            <p className="mb-4 text-xs text-muted">{perms.edit ? 'Tap a day to set attendance directly.' : 'View only.'}</p>
            {calendar && (
              <AttendanceCalendar
                monthKey={month}
                days={calendar.days}
                selectable={perms.edit}
                onDayClick={(c) => setShowSetDay(c)}
              />
            )}
          </div>
        </>
      )}

      {showSalaryForm && (
        <Modal title={`Set ${selectedStaff?.name}'s salary`} onClose={() => setShowSalaryForm(false)}>
          <SalaryForm initial={salary} onSaved={() => { setShowSalaryForm(false); load() }} onClose={() => setShowSalaryForm(false)}
            onSubmit={(amount) => staffPayrollApi.setSalary(staffId, { monthlyBaseSalary: amount })} />
        </Modal>
      )}

      {showScheduleForm && (
        <Modal title={`${selectedStaff?.name}'s off schedule`} onClose={() => setShowScheduleForm(false)}>
          <ScheduleForm initial={schedule} onSaved={() => { setShowScheduleForm(false); load() }} onClose={() => setShowScheduleForm(false)}
            onSubmit={(data) => staffPayrollApi.setSchedule(staffId, data)} />
        </Modal>
      )}

      {showSetDay && (
        <Modal title={showSetDay.dateKey} onClose={() => setShowSetDay(null)}>
          <SetDayForm
            day={showSetDay}
            canDelete={perms.delete}
            onSaved={() => { setShowSetDay(null); load() }}
            onClose={() => setShowSetDay(null)}
            onSubmit={(status) => staffPayrollApi.setStaffAttendance(staffId, { date: showSetDay.dateKey, status })}
            onDelete={showSetDay.info?.record ? () => staffPayrollApi.deleteAttendance(showSetDay.info.record.id) : null}
          />
        </Modal>
      )}
    </div>
  )
}

function SalaryForm({ initial, onSubmit, onSaved, onClose }) {
  const [amount, setAmount] = useState(initial?.monthlyBaseSalary || '')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError(''); setLoading(true)
    try { await onSubmit(Number(amount)); onSaved() }
    catch (err) { setError(err.response?.data?.message || 'Failed to save') }
    finally { setLoading(false) }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      {error && <p className="px-3 py-2 text-sm text-red-400 border rounded-lg bg-red-500/10 border-red-500/20">{error}</p>}
      <Field label="Monthly base salary (₹)">
        <input type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} className="field-input" placeholder="25000" autoFocus />
      </Field>
      <p className="text-xs text-muted">Unpaid absences/leave are deducted from this at a per-day rate; weekly offs and paid leave aren't.</p>
      <div className="flex gap-3 mt-1">
        <button type="button" onClick={onClose} className="flex-1 border border-white/10 text-muted py-2.5 rounded-lg text-sm hover:text-cream transition-all">Cancel</button>
        <button type="submit" disabled={loading} className="flex-[2] bg-lime text-black font-bold py-2.5 rounded-lg text-sm hover:bg-lime-dark transition-all disabled:opacity-60">
          {loading ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  )
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function ScheduleForm({ initial, onSubmit, onSaved, onClose }) {
  const [weeklyOffDays, setWeeklyOffDays] = useState(initial?.weeklyOffDays ?? [0])
  const [customDates, setCustomDates] = useState((initial?.customOffDates || []).map((d) => new Date(d).toISOString().slice(0, 10)))
  const [newDate, setNewDate] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function toggleDay(d) {
    setWeeklyOffDays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort())
  }
  function addCustomDate() {
    if (!newDate || customDates.includes(newDate)) return
    setCustomDates((prev) => [...prev, newDate].sort())
    setNewDate('')
  }

  async function submit(e) {
    e.preventDefault()
    setError(''); setLoading(true)
    try { await onSubmit({ weeklyOffDays, customOffDates: customDates }); onSaved() }
    catch (err) { setError(err.response?.data?.message || 'Failed to save') }
    finally { setLoading(false) }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      {error && <p className="px-3 py-2 text-sm text-red-400 border rounded-lg bg-red-500/10 border-red-500/20">{error}</p>}
      <Field label="Weekly off days">
        <div className="flex flex-wrap gap-2">
          {WEEKDAY_LABELS.map((label, i) => (
            <button key={i} type="button" onClick={() => toggleDay(i)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all"
              style={weeklyOffDays.includes(i)
                ? { background: 'rgba(200,241,53,0.15)', borderColor: 'rgba(200,241,53,0.5)', color: '#c8f135' }
                : { background: 'transparent', borderColor: 'rgba(255,255,255,0.1)', color: '#888880' }}>
              {label}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Additional off days this month (optional)">
        <div className="flex gap-2">
          <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="flex-1 field-input" />
          <button type="button" onClick={addCustomDate} className="px-3 text-sm font-semibold border rounded-lg text-cream border-white/10 hover:border-white/20">+</button>
        </div>
        {customDates.length > 0 && (
          <div className="flex flex-col gap-1 mt-2">
            {customDates.map((d) => (
              <div key={d} className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-white/5">
                <span className="text-xs">{new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                <button type="button" onClick={() => setCustomDates((prev) => prev.filter((x) => x !== d))} className="text-xs text-red-400">Remove</button>
              </div>
            ))}
          </div>
        )}
      </Field>
      <div className="flex gap-3 mt-1">
        <button type="button" onClick={onClose} className="flex-1 border border-white/10 text-muted py-2.5 rounded-lg text-sm hover:text-cream transition-all">Cancel</button>
        <button type="submit" disabled={loading} className="flex-[2] bg-lime text-black font-bold py-2.5 rounded-lg text-sm hover:bg-lime-dark transition-all disabled:opacity-60">
          {loading ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  )
}

function SetDayForm({ day, canDelete, onSubmit, onDelete, onSaved, onClose }) {
  const [status, setStatus] = useState(day.info?.record?.status || day.info?.status || 'present')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError(''); setLoading(true)
    try { await onSubmit(status); onSaved() }
    catch (err) { setError(err.response?.data?.message || 'Failed to save') }
    finally { setLoading(false) }
  }

  async function handleDelete() {
    if (!onDelete || !confirm('Remove this attendance record? The day will fall back to off/absent based on schedule.')) return
    setLoading(true)
    try { await onDelete(); onSaved() }
    catch { setError('Failed to delete') }
    finally { setLoading(false) }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      {error && <p className="px-3 py-2 text-sm text-red-400 border rounded-lg bg-red-500/10 border-red-500/20">{error}</p>}
      <Field label="Status">
        <Select
          value={status}
          onChange={setStatus}
          options={[
            { value: 'present', label: 'Present' },
            { value: 'half-day', label: 'Half day' },
            { value: 'absent', label: 'Absent' },
            { value: 'leave-paid', label: 'Paid leave' },
            { value: 'leave-unpaid', label: 'Unpaid leave' },
          ]}
        />
      </Field>
      <p className="text-xs text-muted">Setting this directly auto-approves it — no request needed.</p>
      <div className="flex gap-3 mt-1">
        {canDelete && day.info?.record && (
          <button type="button" onClick={handleDelete} className="text-sm font-semibold text-red-400 border border-red-400/30 px-4 py-2.5 rounded-lg hover:bg-red-400/10 transition-all">
            Delete
          </button>
        )}
        <button type="button" onClick={onClose} className="flex-1 border border-white/10 text-muted py-2.5 rounded-lg text-sm hover:text-cream transition-all">Cancel</button>
        <button type="submit" disabled={loading} className="flex-[2] bg-lime text-black font-bold py-2.5 rounded-lg text-sm hover:bg-lime-dark transition-all disabled:opacity-60">
          {loading ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  )
}

/* ── Base pay (owner only) — set every staff member's salary in one screen ── */

function BasePayTab() {
  const [rows, setRows] = useState([]) // [{ staffId, name, role, salary, saving, saved, error }]
  const [loading, setLoading] = useState(true)

  function load() {
    setLoading(true)
    staffApi.list({ excludeOwner: 'true' })
      .then(async (res) => {
        const staff = res.data
        const salaries = await Promise.all(staff.map((s) => staffPayrollApi.getSalary(s._id).catch(() => ({ data: null }))))
        setRows(staff.map((s, i) => ({
          staffId: s._id,
          name: s.name,
          role: s.role,
          salary: salaries[i].data?.monthlyBaseSalary ?? '',
          saving: false,
          saved: false,
          error: '',
        })))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  function updateSalary(staffId, value) {
    setRows((prev) => prev.map((r) => r.staffId === staffId ? { ...r, salary: value, saved: false } : r))
  }

  async function saveRow(row) {
    if (row.salary === '' || Number(row.salary) < 0) {
      setRows((prev) => prev.map((r) => r.staffId === row.staffId ? { ...r, error: 'Enter a valid amount' } : r))
      return
    }
    setRows((prev) => prev.map((r) => r.staffId === row.staffId ? { ...r, saving: true, error: '' } : r))
    try {
      await staffPayrollApi.setSalary(row.staffId, { monthlyBaseSalary: Number(row.salary) })
      setRows((prev) => prev.map((r) => r.staffId === row.staffId ? { ...r, saving: false, saved: true } : r))
    } catch (err) {
      setRows((prev) => prev.map((r) => r.staffId === row.staffId
        ? { ...r, saving: false, error: err.response?.data?.message || 'Failed to save' } : r))
    }
  }

  async function saveAll() {
    for (const row of rows) {
      if (row.salary !== '' && Number(row.salary) >= 0) await saveRow(row)
    }
  }

  if (loading) return <div className="h-64 rounded-xl animate-pulse bg-white/5" />

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-muted">Set the monthly base salary for every staff member. Owners don't have a base salary here — only staff do.</p>
        <button onClick={saveAll} className="shrink-0 bg-lime text-black font-bold text-sm px-4 py-2 rounded-lg hover:bg-lime-dark transition-all">
          Save all
        </button>
      </div>

      {rows.length === 0 ? (
        <p className="py-16 text-sm text-center text-muted">No staff members yet.</p>
      ) : (
        <div className="overflow-x-auto bg-card border border-white/[0.08] rounded-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-left border-b text-muted border-white/10">
                <th className="px-4 py-3 font-medium">Staff</th>
                <th className="px-4 py-3 font-medium">Monthly base salary (₹)</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.staffId} className="border-b border-white/[0.04] last:border-0">
                  <td className="px-4 py-3">{row.name} <span className="text-xs text-muted">· {row.role}</span></td>
                  <td className="px-4 py-3">
                    <input
                      type="number" min="0" value={row.salary}
                      onChange={(e) => updateSalary(row.staffId, e.target.value)}
                      placeholder="Not set"
                      className="field-input w-36 py-1.5"
                    />
                    {row.error && <p className="mt-1 text-[11px] text-red-400">{row.error}</p>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => saveRow(row)}
                      disabled={row.saving}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all disabled:opacity-50"
                      style={row.saved
                        ? { background: 'rgba(200,241,53,0.15)', borderColor: 'rgba(200,241,53,0.5)', color: '#c8f135' }
                        : { background: 'transparent', borderColor: 'rgba(255,255,255,0.1)', color: '#F5F4EF' }}
                    >
                      {row.saving ? 'Saving…' : row.saved ? 'Saved ✓' : 'Save'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

/* ── Analytics (owner only) ───────────────────────────────────────────────── */

function AnalyticsTab() {
  const [month, setMonth] = useState(thisMonthKey())
  const [staffFilter, setStaffFilter] = useState('')
  const [staffList, setStaffList] = useState([])
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { staffApi.list({ excludeOwner: 'true' }).then((res) => setStaffList(res.data)).catch(() => {}) }, [])

  useEffect(() => {
    setLoading(true)
    staffPayrollApi.analytics(month, staffFilter || undefined)
      .then(({ data }) => setData(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [month, staffFilter])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3 flex-wrap">
        <MonthPicker value={month} onChange={setMonth} />
        <Select
          value={staffFilter}
          onChange={setStaffFilter}
          options={staffList.map((s) => ({ value: s._id, label: s.name }))}
          placeholder="All staff"
          isClearable
          className="w-56"
        />
      </div>

      {loading ? (
        <div className="h-64 rounded-xl animate-pulse bg-white/5" />
      ) : data && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatCard label="Total base payroll" value={`₹${data.totals.baseSalary.toLocaleString('en-IN')}`} />
            <StatCard label="Total net payable" value={`₹${data.totals.netPayable.toLocaleString('en-IN')}`} accent="#c8f135" />
            <StatCard label="Pending approvals" value={data.totals.pending} accent={data.totals.pending ? '#fbbf24' : undefined} />
          </div>

          <div className="overflow-x-auto bg-card border border-white/[0.08] rounded-xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-left border-b text-muted border-white/10">
                  <th className="px-4 py-3 font-medium">Staff</th>
                  <th className="px-4 py-3 font-medium">Base</th>
                  <th className="px-4 py-3 font-medium">Worked</th>
                  <th className="px-4 py-3 font-medium">Half day</th>
                  <th className="px-4 py-3 font-medium">Absent</th>
                  <th className="px-4 py-3 font-medium">Paid leave</th>
                  <th className="px-4 py-3 font-medium">Net payable</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((r) => (
                  <tr key={r.staffId} className="border-b border-white/[0.04] last:border-0">
                    <td className="px-4 py-3">{r.name} <span className="text-xs text-muted">· {r.role}</span></td>
                    <td className="px-4 py-3 text-muted">{r.baseSalary != null ? `₹${r.baseSalary.toLocaleString('en-IN')}` : '—'}</td>
                    <td className="px-4 py-3" style={{ color: '#c8f135' }}>{r.present}</td>
                    <td className="px-4 py-3" style={{ color: '#a78bfa' }}>{r.halfDay}</td>
                    <td className="px-4 py-3" style={{ color: '#f87171' }}>{r.absent}</td>
                    <td className="px-4 py-3" style={{ color: '#60a5fa' }}>{r.paidLeave}</td>
                    <td className="px-4 py-3 font-semibold">{r.netPayable != null ? `₹${r.netPayable.toLocaleString('en-IN')}` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

/* ── Access control (owner only) ──────────────────────────────────────────── */

function AccessControlTab() {
  const [staffList, setStaffList] = useState([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    staffApi.list({ excludeOwner: 'true' })
      .then((res) => setStaffList(res.data.filter((s) => s.role === 'manager')))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function togglePerm(manager, key) {
    const current = manager.permissions?.payroll || { view: false, edit: false, approve: false, delete: false }
    const next = { ...current, [key]: !current[key] }
    setSavingId(manager._id); setError('')
    try {
      await staffPayrollApi.setPermissions(manager._id, next)
      setStaffList((prev) => prev.map((s) => s._id === manager._id ? { ...s, permissions: { ...s.permissions, payroll: next } } : s))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update permissions')
    } finally { setSavingId(null) }
  }

  if (loading) return <div className="h-40 rounded-xl animate-pulse bg-white/5" />

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted">
        Control what each manager can do in Payroll. Owners always have full access; trainers and receptionists only ever see their own attendance and pay.
      </p>
      {error && <p className="px-3 py-2 text-sm text-red-400 border rounded-lg bg-red-500/10 border-red-500/20">{error}</p>}
      {staffList.length === 0 ? (
        <p className="py-16 text-sm text-center text-muted">No managers yet.</p>
      ) : staffList.map((m) => {
        const p = m.permissions?.payroll || {}
        return (
          <div key={m._id} className="flex items-center justify-between gap-4 p-4 bg-card border border-white/[0.08] rounded-xl flex-wrap">
            <p className="text-sm font-semibold">{m.name}</p>
            <div className="flex gap-2 flex-wrap">
              {['view', 'edit', 'approve', 'delete'].map((key) => (
                <button
                  key={key}
                  disabled={savingId === m._id}
                  onClick={() => togglePerm(m, key)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border capitalize transition-all disabled:opacity-50"
                  style={p[key]
                    ? { background: 'rgba(200,241,53,0.15)', borderColor: 'rgba(200,241,53,0.5)', color: '#c8f135' }
                    : { background: 'transparent', borderColor: 'rgba(255,255,255,0.1)', color: '#888880' }}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
