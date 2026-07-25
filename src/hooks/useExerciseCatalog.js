import { useEffect, useState } from 'react'
import { exerciseCatalogApi } from '../api/index'
import { MUSCLE_GROUPS as STATIC_MUSCLE_GROUPS, EXERCISE_CATALOG as STATIC_EXERCISE_CATALOG } from '../data/exerciseCatalog'

// Strips the old static file's icons for a shape-compatible fallback — the
// gym's own catalog (fetched below) never carries icons.
const STATIC_FALLBACK = {
  muscleGroups: STATIC_MUSCLE_GROUPS.map(({ key, label }) => ({ key, label })),
  catalog: STATIC_EXERCISE_CATALOG,
}

/**
 * The gym's exercise catalog (categories + exercise names), fetched from
 * the server so it reflects whatever an owner/manager has added, edited,
 * or removed on the Exercise Catalog admin page. Falls back to the
 * original static list if the request fails, so exercise-entry UI (e.g.
 * PT session muscle-group chips) never comes up empty.
 */
export function useExerciseCatalog() {
  const [data, setData] = useState({ ...STATIC_FALLBACK, categories: [], exercises: [] })
  const [loading, setLoading] = useState(true)

  function load() {
    setLoading(true)
    Promise.all([exerciseCatalogApi.categories.list(), exerciseCatalogApi.exercises.list()])
      .then(([catRes, exRes]) => {
        const muscleGroups = catRes.data.map((c) => ({ key: c.key, label: c.label }))
        const catalog = {}
        for (const ex of exRes.data) {
          if (!catalog[ex.categoryKey]) catalog[ex.categoryKey] = []
          catalog[ex.categoryKey].push(ex.name)
        }
        setData({ muscleGroups, catalog, categories: catRes.data, exercises: exRes.data })
      })
      .catch(() => { /* keep showing static fallback above */ })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  return {
    muscleGroups: data.muscleGroups,
    catalog: data.catalog,
    // Raw server documents (with _id) — for admin pages that need to
    // edit/delete a specific category or exercise, not just display it.
    categories: data.categories,
    exercises: data.exercises,
    loading,
    reload: load,
  }
}
