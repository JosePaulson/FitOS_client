import { useState } from 'react'
import { authApi } from '../../api/auth.api'

export default function ChangePasswordModal({ onClose }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const set = (field) => (e) => setForm((v) => ({ ...v, [field]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    setError('')

    if (form.newPassword.length < 6) { setError('New password must be at least 6 characters'); return }
    if (form.newPassword !== form.confirm) { setError("New passwords don't match"); return }

    setLoading(true)
    try {
      await authApi.changePassword(form.currentPassword, form.newPassword)
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70">
      <div className="bg-card border border-white/[0.1] rounded-2xl w-full max-w-sm p-7 relative">
        <button onClick={onClose} className="absolute text-xl leading-none top-4 right-5 text-muted hover:text-cream">×</button>
        <h2 className="mb-5 text-lg font-bold">Change password</h2>

        {success ? (
          <>
            <p className="px-3 py-2 text-sm text-lime border rounded-lg bg-lime/10 border-lime/20">
              Password changed successfully. Other signed-in devices have been signed out.
            </p>
            <button onClick={onClose} className="w-full mt-4 bg-lime text-black font-bold py-2.5 rounded-lg text-sm hover:bg-lime-dark transition-all">
              Done
            </button>
          </>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-4">
            {error && <p className="px-3 py-2 text-sm text-red-400 border rounded-lg bg-red-500/10 border-red-500/20">{error}</p>}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted">Current password</label>
              <input type="password" autoComplete="current-password" value={form.currentPassword} onChange={set('currentPassword')} className="field-input" autoFocus />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted">New password</label>
              <input type="password" autoComplete="new-password" value={form.newPassword} onChange={set('newPassword')} className="field-input" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted">Confirm new password</label>
              <input type="password" autoComplete="new-password" value={form.confirm} onChange={set('confirm')} className="field-input" />
            </div>

            <div className="flex gap-3 mt-1">
              <button type="button" onClick={onClose} className="flex-1 border border-white/10 text-muted py-2.5 rounded-lg text-sm hover:text-cream transition-all">Cancel</button>
              <button type="submit" disabled={loading} className="flex-[2] bg-lime text-black font-bold py-2.5 rounded-lg text-sm hover:bg-lime-dark transition-all disabled:opacity-60">
                {loading ? 'Saving…' : 'Change password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
