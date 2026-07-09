import { useEffect, useState, useRef } from 'react'
import { workoutLibraryApi } from '../../api/index'
import Select from '../../components/ui/Select'
import { useAuth } from '../../context/AuthContext'

const MAX_VIDEO_SECONDS = 20

const CATEGORY_OPTIONS = [
  { value: 'strength', label: 'Strength' },
  { value: 'cardio',   label: 'Cardio' },
  { value: 'mobility', label: 'Mobility' },
  { value: 'hiit',     label: 'HIIT' },
  { value: 'core',     label: 'Core' },
  { value: 'other',    label: 'Other' },
]
const CATEGORY_LABEL = Object.fromEntries(CATEGORY_OPTIONS.map((c) => [c.value, c.label]))

export default function WorkoutLibrary() {
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
      const { data } = await workoutLibraryApi.list(filter ? { category: filter } : {})
      setItems(data)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [filter])

  async function handleDelete(item) {
    if (!confirm(`Delete "${item.name}"? This can't be undone.`)) return
    try {
      await workoutLibraryApi.remove(item._id)
      load()
    } catch {
      alert('Failed to delete workout')
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Workout library</h1>
          <p className="text-muted text-sm mt-0.5">
            {items.length} workout{items.length !== 1 ? 's' : ''} · optionally link these to PT sessions
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => { setEditing(null); setShowForm(true) }}
            className="bg-lime text-black font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-lime-dark transition-all"
          >
            + Add workout
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
            ? 'No workouts added yet. Add reference exercises with a photo or short demo video.'
            : 'No workouts added yet.'}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item._id} className="bg-card border border-white/[0.08] rounded-xl overflow-hidden flex flex-col">
              <div className="aspect-video bg-white/[0.03] flex items-center justify-center overflow-hidden relative">
                {item.videoUrl ? (
                  <>
                    <video src={item.videoUrl} className="w-full h-full object-cover" muted playsInline />
                    <span className="absolute bottom-1.5 right-1.5 text-[10px] bg-black/70 text-white px-1.5 py-0.5 rounded">
                      ▶ {item.videoDurationSec ? `${Math.round(item.videoDurationSec)}s` : 'video'}
                    </span>
                  </>
                ) : item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl opacity-30">🏋️</span>
                )}
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
        <WorkoutFormModal
          item={editing}
          onClose={() => { setShowForm(false); setEditing(null) }}
          onSaved={() => { setShowForm(false); setEditing(null); load() }}
        />
      )}
    </div>
  )
}

function WorkoutFormModal({ item, onClose, onSaved }) {
  const [form, setForm] = useState({
    name:        item?.name        || '',
    category:    item?.category    || 'other',
    description: item?.description || '',
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(item?.imageUrl || '')
  const [videoFile, setVideoFile] = useState(null)
  const [videoPreview, setVideoPreview] = useState(item?.videoUrl || '')
  const [videoDuration, setVideoDuration] = useState(item?.videoDurationSec || null)

  const [error,  setError]  = useState('')
  const [saving, setSaving] = useState(false)

  const imageInputRef = useRef(null)
  const videoInputRef = useRef(null)

  function onPickImage(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setError('Image must be under 5MB'); return }
    setError('')
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function onPickVideo(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 30 * 1024 * 1024) { setError('Video must be under 30MB'); return }

    // Client-side pre-check: read the video's real duration before
    // uploading anything, so an obviously-too-long clip is rejected
    // instantly instead of after a slow upload. The server re-checks this
    // authoritatively via Cloudinary's own metadata either way — this is
    // just to save the user time and bandwidth on the common case.
    const url = URL.createObjectURL(file)
    const probe = document.createElement('video')
    probe.preload = 'metadata'
    probe.src = url
    probe.onloadedmetadata = () => {
      const duration = probe.duration
      if (duration > MAX_VIDEO_SECONDS) {
        setError(`This video is ${duration.toFixed(1)}s long — the max is ${MAX_VIDEO_SECONDS}s. Trim it and try again.`)
        URL.revokeObjectURL(url)
        return
      }
      setError('')
      setVideoFile(file)
      setVideoPreview(url)
      setVideoDuration(duration)
    }
  }

  async function save() {
    setError('')
    if (!form.name.trim()) { setError('Workout name is required'); return }
    setSaving(true)
    try {
      const files = {}
      if (imageFile) files.image = imageFile
      if (videoFile) files.video = videoFile

      if (item) await workoutLibraryApi.update(item._id, form, files)
      else      await workoutLibraryApi.create(form, files)
      onSaved()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save workout')
    } finally { setSaving(false) }
  }

  const set    = (f) => (e) => setForm((v) => ({ ...v, [f]: e.target.value }))
  const setVal = (f) => (val) => setForm((v) => ({ ...v, [f]: val }))

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
      <div className="bg-card border border-white/[0.1] rounded-2xl w-full max-w-md p-7 relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-5 text-muted hover:text-cream text-2xl leading-none">×</button>
        <h2 className="font-bold text-lg mb-1">{item ? 'Edit workout' : 'Add workout'}</h2>
        <p className="text-muted text-xs mb-5">Photo and demo video (max {MAX_VIDEO_SECONDS}s) are both optional.</p>

        {error && (
          <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg mb-4">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-4">
          <Field label="Name *">
            <input type="text" value={form.name} onChange={set('name')} className="field-input" placeholder="e.g. Barbell Back Squat" autoFocus />
          </Field>

          <Field label="Category">
            <Select value={form.category} onChange={setVal('category')} options={CATEGORY_OPTIONS} />
          </Field>

          <Field label="Description (optional)">
            <textarea rows={2} value={form.description} onChange={set('description')} className="field-input resize-none" placeholder="Form cues, muscles worked, etc." />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted">Photo (optional)</label>
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="aspect-square bg-white/[0.03] border border-dashed border-white/15 rounded-lg flex items-center justify-center overflow-hidden hover:border-lime/30 transition-all"
              >
                {imagePreview
                  ? <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  : <span className="text-xs text-muted text-center px-2">Upload photo</span>
                }
              </button>
              <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={onPickImage} className="hidden" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted">
                Video (optional, ≤{MAX_VIDEO_SECONDS}s)
              </label>
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                className="aspect-square bg-white/[0.03] border border-dashed border-white/15 rounded-lg flex items-center justify-center overflow-hidden hover:border-lime/30 transition-all relative"
              >
                {videoPreview ? (
                  <>
                    <video src={videoPreview} className="w-full h-full object-cover" muted playsInline />
                    {videoDuration && (
                      <span className="absolute bottom-1 right-1 text-[9px] bg-black/70 text-white px-1 rounded">
                        {videoDuration.toFixed(1)}s
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-xs text-muted text-center px-2">Upload video</span>
                )}
              </button>
              <input ref={videoInputRef} type="file" accept="video/mp4,video/webm,video/quicktime" onChange={onPickVideo} className="hidden" />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 border border-white/10 text-muted py-2.5 rounded-lg text-sm hover:text-cream transition-all">
            Cancel
          </button>
          <button onClick={save} disabled={saving} className="flex-[2] bg-lime text-black font-bold py-2.5 rounded-lg text-sm hover:bg-lime-dark transition-all disabled:opacity-60">
            {saving ? 'Saving…' : item ? 'Save changes' : 'Add workout'}
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
