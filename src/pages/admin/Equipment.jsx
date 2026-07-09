import { useEffect, useState, useRef } from 'react'
import { equipmentApi } from '../../api/index'
import Select from '../../components/ui/Select'
import { useAuth } from '../../context/AuthContext'

const CATEGORY_OPTIONS = [
  { value: 'cardio',       label: 'Cardio' },
  { value: 'strength',     label: 'Strength' },
  { value: 'free-weights', label: 'Free weights' },
  { value: 'machines',     label: 'Machines' },
  { value: 'accessories',  label: 'Accessories' },
  { value: 'other',        label: 'Other' },
]
const CATEGORY_LABEL = Object.fromEntries(CATEGORY_OPTIONS.map((c) => [c.value, c.label]))

export default function Equipment() {
  const { user } = useAuth()
  const canManage = ['owner', 'manager', 'trainer'].includes(user?.role)
  const canDelete = ['owner', 'manager'].includes(user?.role)
  const [items,   setItems]   = useState([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editing,  setEditing]  = useState(null)

  async function load() {
    setLoading(true)
    try {
      const { data } = await equipmentApi.list(filter ? { category: filter } : {})
      setItems(data)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [filter])

  async function handleDelete(item) {
    if (!confirm(`Delete "${item.name}"? This can't be undone.`)) return
    try {
      await equipmentApi.remove(item._id)
      load()
    } catch {
      alert('Failed to delete equipment')
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Equipment</h1>
          <p className="text-muted text-sm mt-0.5">{items.length} item{items.length !== 1 ? 's' : ''} · visible to members in the portal</p>
        </div>
        {canManage && (
          <button
            onClick={() => { setEditing(null); setShowForm(true) }}
            className="bg-lime text-black font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-lime-dark transition-all"
          >
            + Add equipment
          </button>
        )}
      </div>

      <div className="mb-6">
        <Select
          value={filter}
          onChange={setFilter}
          options={CATEGORY_OPTIONS}
          placeholder="All categories"
          isClearable
          className="w-52"
        />
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-56 bg-card border border-white/[0.08] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-muted text-sm">
          {canManage
            ? 'No equipment added yet. Add your first item so members can see what\'s available at the gym.'
            : 'No equipment added yet.'}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item._id} className="bg-card border border-white/[0.08] rounded-xl overflow-hidden flex flex-col">
              <div className="aspect-video bg-white/[0.03] flex items-center justify-center overflow-hidden">
                {item.imageUrl
                  ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  : <span className="text-3xl opacity-30">🏋️</span>
                }
              </div>
              <div className="p-4 flex flex-col gap-2 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-sm">{item.name}</h3>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/5 text-muted whitespace-nowrap">
                    {CATEGORY_LABEL[item.category] || item.category}
                  </span>
                </div>
                {item.description && (
                  <p className="text-xs text-muted line-clamp-2">{item.description}</p>
                )}
                {(canManage || canDelete) && (
                  <div className="flex gap-2 mt-auto pt-2">
                    {canManage && (
                      <button
                        onClick={() => { setEditing(item); setShowForm(true) }}
                        className="flex-1 text-xs text-muted hover:text-cream border border-white/10 py-1.5 rounded-lg hover:border-white/20 transition-all"
                      >
                        Edit
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(item)}
                        className="flex-1 text-xs text-red-400/70 hover:text-red-400 border border-white/10 hover:border-red-400/30 py-1.5 rounded-lg transition-all"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <EquipmentFormModal
          item={editing}
          onClose={() => { setShowForm(false); setEditing(null) }}
          onSaved={() => { setShowForm(false); setEditing(null); load() }}
        />
      )}
    </div>
  )
}

function EquipmentFormModal({ item, onClose, onSaved }) {
  const [form, setForm] = useState({
    name:        item?.name        || '',
    category:    item?.category    || 'other',
    description: item?.description || '',
  })
  const [imageFile, setImageFile]     = useState(null)
  const [preview,   setPreview]       = useState(item?.imageUrl || '')
  const [error,     setError]         = useState('')
  const [saving,    setSaving]        = useState(false)
  const fileInputRef = useRef(null)

  const set    = (f) => (e) => setForm((v) => ({ ...v, [f]: e.target.value }))
  const setVal = (f) => (val) => setForm((v) => ({ ...v, [f]: val }))

  function onPickImage(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB')
      return
    }
    setError('')
    setImageFile(file)
    setPreview(URL.createObjectURL(file))
  }

  async function save() {
    setError('')
    if (!form.name.trim()) { setError('Equipment name is required'); return }
    setSaving(true)
    try {
      if (item) await equipmentApi.update(item._id, form, imageFile)
      else      await equipmentApi.create(form, imageFile)
      onSaved()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save equipment')
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
      <div className="bg-card border border-white/[0.1] rounded-2xl w-full max-w-md p-7 relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-5 text-muted hover:text-cream text-2xl leading-none">×</button>
        <h2 className="font-bold text-lg mb-5">{item ? 'Edit equipment' : 'Add equipment'}</h2>

        {error && (
          <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg mb-4">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-4">
          {/* Image picker */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted">Photo (optional)</label>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-video bg-white/[0.03] border border-dashed border-white/15 rounded-lg flex items-center justify-center overflow-hidden hover:border-lime/30 transition-all"
            >
              {preview
                ? <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                : <span className="text-sm text-muted">Click to upload a photo</span>
              }
            </button>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={onPickImage} className="hidden" />
          </div>

          <Field label="Name *">
            <input type="text" value={form.name} onChange={set('name')} className="field-input" placeholder="e.g. Treadmill, Squat Rack" autoFocus />
          </Field>

          <Field label="Category">
            <Select value={form.category} onChange={setVal('category')} options={CATEGORY_OPTIONS} />
          </Field>

          <Field label="Description (optional)">
            <textarea rows={2} value={form.description} onChange={set('description')} className="field-input resize-none" placeholder="Any notes members should know…" />
          </Field>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 border border-white/10 text-muted py-2.5 rounded-lg text-sm hover:text-cream transition-all">
            Cancel
          </button>
          <button onClick={save} disabled={saving} className="flex-[2] bg-lime text-black font-bold py-2.5 rounded-lg text-sm hover:bg-lime-dark transition-all disabled:opacity-60">
            {saving ? 'Saving…' : item ? 'Save changes' : 'Add equipment'}
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
