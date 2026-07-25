import { useState } from 'react'
import { exerciseCatalogApi } from '../../api/index'
import { useExerciseCatalog } from '../../hooks/useExerciseCatalog'
import { useAuth } from '../../context/AuthContext'

/**
 * Owner/manager page for managing the gym's exercise catalog: the
 * categories (muscle groups) and named exercises filed under them that
 * power the "add exercise" chips + name suggestions across PT sessions
 * and member workout logs.
 */
export default function ExerciseCatalog() {
  const { user } = useAuth()
  const canManage = ['owner', 'manager'].includes(user?.role)
  const { muscleGroups, catalog, categories, exercises, loading, reload } = useExerciseCatalog()

  const [activeCategory, setActiveCategory] = useState(null)
  const selectedKey = activeCategory ?? muscleGroups[0]?.key ?? null

  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [showExerciseForm, setShowExerciseForm] = useState(false)
  const [editingExercise, setEditingExercise] = useState(null)

  const [error, setError] = useState('')

  async function handleDeleteCategory(group) {
    if (!confirm(`Delete "${group.label}"? This also removes every exercise filed under it.`)) return
    setError('')
    try {
      await exerciseCatalogApi.categories.remove(group.id)
      if (selectedKey === group.key) setActiveCategory(null)
      reload()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete category')
    }
  }

  async function handleDeleteExercise(ex) {
    if (!confirm(`Delete "${ex.name}"?`)) return
    setError('')
    try {
      await exerciseCatalogApi.exercises.remove(ex.id)
      reload()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete exercise')
    }
  }

  // `categories`/`exercises` are the raw server documents (with Mongo
  // _id), used here for edit/delete; `muscleGroups`/`catalog` are the
  // display-friendly shape shared with the rest of the app.
  const groupsWithId = muscleGroups.map((g) => ({
    ...g,
    id: categories.find((c) => c.key === g.key)?._id,
  }))
  const exerciseNames = (catalog[selectedKey] || [])
  const selectedExercises = exercises
    .filter((ex) => ex.categoryKey === selectedKey)
    .sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Exercise catalog</h1>
          <p className="text-muted text-sm mt-0.5">
            Manage the categories and named exercises members and trainers pick from when logging a workout.
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => { setEditingCategory(null); setShowCategoryForm(true) }}
            className="bg-lime text-black font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-lime-dark transition-all whitespace-nowrap"
          >
            + Add category
          </button>
        )}
      </div>

      {error && (
        <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg mb-4">
          {error}
        </p>
      )}

      {loading ? (
        <div className="h-64 bg-card border border-white/[0.08] rounded-xl animate-pulse" />
      ) : muscleGroups.length === 0 ? (
        <div className="text-center py-20 text-muted text-sm">No categories yet.</div>
      ) : (
        <div className="grid md:grid-cols-[240px_1fr] gap-5">
          {/* Category list */}
          <div className="bg-card border border-white/[0.08] rounded-xl p-2 flex flex-col gap-1 h-fit">
            {groupsWithId.map((g) => (
              <div key={g.key} className="group flex items-center gap-1">
                <button
                  onClick={() => setActiveCategory(g.key)}
                  className={`flex-1 text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedKey === g.key ? 'bg-lime text-black' : 'text-muted hover:text-cream hover:bg-white/[0.04]'
                  }`}
                >
                  {g.label}
                  <span className="ml-1.5 text-[10px] opacity-60">{(catalog[g.key] || []).length}</span>
                </button>
                {canManage && (
                  <div className="hidden group-hover:flex gap-1 pr-1">
                    <button
                      title="Edit"
                      onClick={() => { setEditingCategory(g); setShowCategoryForm(true) }}
                      className="text-xs text-muted hover:text-cream px-1.5"
                    >✎</button>
                    <button
                      title="Delete"
                      onClick={() => handleDeleteCategory(g)}
                      className="text-xs text-red-400/70 hover:text-red-400 px-1.5"
                    >×</button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Exercises for the selected category */}
          <div className="bg-card border border-white/[0.08] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm">
                {groupsWithId.find((g) => g.key === selectedKey)?.label || 'Exercises'}
              </h2>
              {canManage && (
                <button
                  onClick={() => { setEditingExercise(null); setShowExerciseForm(true) }}
                  className="text-xs font-semibold text-lime hover:text-lime-dark border border-lime/25 hover:border-lime/40 px-3 py-1.5 rounded-lg transition-all"
                >
                  + Add exercise
                </button>
              )}
            </div>

            {exerciseNames.length === 0 ? (
              <p className="text-muted text-sm py-8 text-center">No exercises in this category yet.</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-2">
                {selectedExercises.map((ex) => (
                  <div
                    key={ex._id}
                    className="flex items-center justify-between gap-2 bg-white/[0.02] border border-white/[0.06] rounded-lg px-3 py-2"
                  >
                    <span className="text-sm">{ex.name}</span>
                    {canManage && (
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => { setEditingExercise(ex); setShowExerciseForm(true) }}
                          className="text-xs text-muted hover:text-cream"
                        >Edit</button>
                        <button
                          onClick={() => handleDeleteExercise({ id: ex._id, name: ex.name })}
                          className="text-xs text-red-400/70 hover:text-red-400"
                        >Delete</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showCategoryForm && (
        <CategoryFormModal
          category={editingCategory}
          onClose={() => { setShowCategoryForm(false); setEditingCategory(null) }}
          onSaved={() => { setShowCategoryForm(false); setEditingCategory(null); reload() }}
        />
      )}

      {showExerciseForm && (
        <ExerciseFormModal
          exercise={editingExercise}
          categories={groupsWithId}
          defaultCategoryKey={selectedKey}
          onClose={() => { setShowExerciseForm(false); setEditingExercise(null) }}
          onSaved={() => { setShowExerciseForm(false); setEditingExercise(null); reload() }}
        />
      )}
    </div>
  )
}

function CategoryFormModal({ category, onClose, onSaved }) {
  const [label, setLabel] = useState(category?.label || '')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function save() {
    if (!label.trim()) { setError('Category name is required'); return }
    setError('')
    setSaving(true)
    try {
      if (category) await exerciseCatalogApi.categories.update(category.id, { label: label.trim() })
      else await exerciseCatalogApi.categories.create({ label: label.trim() })
      onSaved()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save category')
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
      <div className="bg-card border border-white/[0.1] rounded-2xl w-full max-w-sm p-7 relative">
        <button onClick={onClose} className="absolute top-4 right-5 text-muted hover:text-cream text-2xl leading-none">×</button>
        <h2 className="font-bold text-lg mb-5">{category ? 'Edit category' : 'Add category'}</h2>

        {error && (
          <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg mb-4">{error}</p>
        )}

        <div className="flex flex-col gap-1.5 mb-6">
          <label className="text-xs font-medium text-muted">Name *</label>
          <input
            type="text" value={label} onChange={(e) => setLabel(e.target.value)}
            className="field-input" placeholder="e.g. Forearms" autoFocus
          />
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 border border-white/10 text-muted py-2.5 rounded-lg text-sm hover:text-cream transition-all">
            Cancel
          </button>
          <button onClick={save} disabled={saving} className="flex-[2] bg-lime text-black font-bold py-2.5 rounded-lg text-sm hover:bg-lime-dark transition-all disabled:opacity-60">
            {saving ? 'Saving…' : category ? 'Save changes' : 'Add category'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ExerciseFormModal({ exercise, categories, defaultCategoryKey, onClose, onSaved }) {
  const [name, setName] = useState(exercise?.name || '')
  const [categoryKey, setCategoryKey] = useState(exercise?.categoryKey || defaultCategoryKey || categories[0]?.key || '')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function save() {
    if (!name.trim()) { setError('Exercise name is required'); return }
    if (!categoryKey) { setError('Choose a category'); return }
    setError('')
    setSaving(true)
    try {
      if (exercise) await exerciseCatalogApi.exercises.update(exercise._id, { name: name.trim(), categoryKey })
      else await exerciseCatalogApi.exercises.create({ name: name.trim(), categoryKey })
      onSaved()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save exercise')
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
      <div className="bg-card border border-white/[0.1] rounded-2xl w-full max-w-sm p-7 relative">
        <button onClick={onClose} className="absolute top-4 right-5 text-muted hover:text-cream text-2xl leading-none">×</button>
        <h2 className="font-bold text-lg mb-5">{exercise ? 'Edit exercise' : 'Add exercise'}</h2>

        {error && (
          <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg mb-4">{error}</p>
        )}

        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted">Name *</label>
            <input
              type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="field-input" placeholder="e.g. Cable Lateral Raise" autoFocus
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted">Category *</label>
            <select
              value={categoryKey}
              onChange={(e) => setCategoryKey(e.target.value)}
              className="field-input"
            >
              {categories.map((c) => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 border border-white/10 text-muted py-2.5 rounded-lg text-sm hover:text-cream transition-all">
            Cancel
          </button>
          <button onClick={save} disabled={saving} className="flex-[2] bg-lime text-black font-bold py-2.5 rounded-lg text-sm hover:bg-lime-dark transition-all disabled:opacity-60">
            {saving ? 'Saving…' : exercise ? 'Save changes' : 'Add exercise'}
          </button>
        </div>
      </div>
    </div>
  )
}
