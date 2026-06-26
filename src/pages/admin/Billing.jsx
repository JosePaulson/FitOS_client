import { useEffect, useState, useCallback } from 'react'
import { invoiceApi } from '../../api/index'
import Select from '../../components/ui/Select'
import api from '../../api/axios'

const STATUS_STYLES = {
  paid: 'bg-lime/10 text-lime',
  pending: 'bg-yellow-400/10 text-yellow-400',
  overdue: 'bg-red-400/10 text-red-400',
  cancelled: 'bg-white/5 text-muted',
  refunded: 'bg-blue-400/10 text-blue-400',
}

const PAYMENT_METHODS = ['cash', 'upi', 'card', 'netbanking', 'other']

export default function Billing() {
  const [invoices, setInvoices] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [revenue, setRevenue] = useState([])
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(null)   // invoice being paid
  const [method, setMethod] = useState('cash')

  const LIMIT = 15

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await invoiceApi.list({ status, page, limit: LIMIT })
      setInvoices(data.invoices)
      setTotal(data.total)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [status, page])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [status])
  useEffect(() => {
    invoiceApi.revenue().then(({ data }) => setRevenue(data)).catch(() => { })
  }, [])

  async function markPaid() {
    if (!paying) return
    try {
      await invoiceApi.markPaid(paying._id, method)
      setPaying(null)
      load()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark as paid')
    }
  }

  async function resendEmail(invoiceId) {
    setResending(invoiceId)
    try {
      const { data } = await api.post(`/invoices/${invoiceId}/resend-email`)
      alert(data.message)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to resend email')
    } finally {
      setResending(null)
    }
  }

  const thisMonthRevenue = revenue[0]?.revenue || 0
  const pendingTotal = invoices
    .filter((i) => i.status === 'pending')
    .reduce((s, i) => s + i.totalAmount, 0)

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-7">
        <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
        <p className="text-muted text-sm mt-0.5">Track invoices and member payments</p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 mb-7">
        <div className="bg-card border border-white/[0.08] rounded-xl p-5">
          <p className="mb-2 text-xs tracking-wider uppercase text-muted">This month</p>
          <p className="text-2xl font-black text-lime">₹{thisMonthRevenue.toLocaleString('en-IN')}</p>
          <p className="mt-1 text-xs text-muted">{revenue[0]?.count || 0} payments</p>
        </div>
        <div className="bg-card border border-white/[0.08] rounded-xl p-5">
          <p className="mb-2 text-xs tracking-wider uppercase text-muted">Pending (shown)</p>
          <p className="text-2xl font-black text-yellow-400">₹{pendingTotal.toLocaleString('en-IN')}</p>
          <p className="mt-1 text-xs text-muted">Awaiting collection</p>
        </div>
        <div className="bg-card border border-white/[0.08] rounded-xl p-5">
          <p className="mb-2 text-xs tracking-wider uppercase text-muted">Total invoices</p>
          <p className="text-2xl font-black">{total}</p>
          <p className="mt-1 text-xs text-muted">All time</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2 mb-5">
        {['', 'pending', 'paid', 'overdue', 'cancelled'].map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${status === s
                ? 'bg-lime/10 border-lime/30 text-lime font-semibold'
                : 'border-white/10 text-muted hover:text-cream'
              }`}
          >
            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Invoices table */}
      <div className="bg-card border border-white/[0.08] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-left">
                <th className="px-5 py-3 text-xs font-semibold tracking-wider uppercase text-muted">Invoice</th>
                <th className="px-5 py-3 text-xs font-semibold tracking-wider uppercase text-muted">Member</th>
                <th className="px-5 py-3 text-xs font-semibold tracking-wider uppercase text-muted">Plan</th>
                <th className="px-5 py-3 text-xs font-semibold tracking-wider uppercase text-muted">Amount</th>
                <th className="px-5 py-3 text-xs font-semibold tracking-wider uppercase text-muted">Status</th>
                <th className="px-5 py-3 text-xs font-semibold tracking-wider uppercase text-muted">Date</th>
                <th className="px-5 py-3 text-xs font-semibold tracking-wider uppercase text-muted">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-white/[0.05] rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-sm text-center text-muted">
                    No invoices found.
                  </td>
                </tr>
              ) : invoices.map((inv) => (
                <tr key={inv._id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs text-muted">{inv.invoiceNumber}</td>
                  <td className="px-5 py-3.5 font-medium">{inv.memberId?.name || '—'}</td>
                  <td className="px-5 py-3.5 text-muted text-xs">{inv.planId?.name || '—'}</td>
                  <td className="px-5 py-3.5">
                    <div className="font-semibold">₹{inv.totalAmount?.toLocaleString('en-IN')}</div>
                    {inv.taxAmount > 0 && <div className="text-[10px] text-muted">incl. ₹{inv.taxAmount?.toLocaleString('en-IN')} GST</div>}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[inv.status] || ''}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-muted text-xs">
                    {new Date(inv.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      {inv.status === 'pending' && (
                        <button
                          onClick={() => { setPaying(inv); setMethod('cash') }}
                          className="text-xs font-medium text-lime hover:text-lime-dark"
                        >
                          Mark paid
                        </button>
                      )}
                      {inv.memberId?.email && (
                        <button
                          onClick={() => resendEmail(inv._id)}
                          disabled={resending === inv._id}
                          className="text-xs transition-colors text-muted hover:text-cream disabled:opacity-50"
                          title={`Resend receipt to ${inv.memberId.email}`}
                        >
                          {resending === inv._id ? '…' : '✉️'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > LIMIT && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.06]">
            <span className="text-xs text-muted">
              {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}
            </span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}
                className="text-xs px-3 py-1.5 border border-white/10 rounded-lg text-muted disabled:opacity-40 hover:text-cream hover:border-white/20 transition-all">
                ← Prev
              </button>
              <button disabled={page * LIMIT >= total} onClick={() => setPage((p) => p + 1)}
                className="text-xs px-3 py-1.5 border border-white/10 rounded-lg text-muted disabled:opacity-40 hover:text-cream hover:border-white/20 transition-all">
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mark paid modal */}
      {paying && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70">
          <div className="bg-card border border-white/[0.1] rounded-2xl w-full max-w-sm p-7">
            <h2 className="mb-1 text-lg font-bold">Mark as paid</h2>
            <p className="mb-5 text-sm text-muted">
              Invoice <span className="font-mono text-cream">{paying.invoiceNumber}</span> —{' '}
              <span className="font-semibold text-cream">₹{paying.totalAmount?.toLocaleString('en-IN')}</span>
            </p>
            <div className="flex flex-col gap-1.5 mb-5">
              <label className="text-xs font-medium text-muted">Payment method</label>
              <Select
                value={method}
                onChange={setMethod}
                options={PAYMENT_METHODS.map((m) => ({ value: m, label: m.charAt(0).toUpperCase() + m.slice(1) }))}
                placeholder="Select method"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setPaying(null)} className="flex-1 border border-white/10 text-muted py-2.5 rounded-lg text-sm hover:text-cream transition-all">Cancel</button>
              <button onClick={markPaid} className="flex-[2] bg-lime text-black font-bold py-2.5 rounded-lg text-sm hover:bg-lime-dark transition-all">
                Confirm payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}