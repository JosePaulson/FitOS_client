import api from './axios'

/* ── Members ──────────────────────────────────────────────────────────────── */
export const memberApi = {
  list:   (params = {}) => api.get('/members', { params }),
  get:    (id)          => api.get(`/members/${id}`),
  create: (data)        => api.post('/members', data),
  update: (id, data)    => api.patch(`/members/${id}`, data),
  renew:  (id, planId)  => api.post(`/members/${id}/renew`, { planId }),
  remove: (id)          => api.delete(`/members/${id}`),
}

/* ── Membership Plans ─────────────────────────────────────────────────────── */
export const planApi = {
  list:   ()           => api.get('/plans'),
  create: (data)       => api.post('/plans', data),
  update: (id, data)   => api.patch(`/plans/${id}`, data),
  remove: (id)         => api.delete(`/plans/${id}`),
}

/* ── Invoices ─────────────────────────────────────────────────────────────── */
export const invoiceApi = {
  list:       (params = {}) => api.get('/invoices', { params }),
  get:        (id)          => api.get(`/invoices/${id}`),
  markPaid:   (id, method)  => api.patch(`/invoices/${id}/mark-paid`, { paymentMethod: method }),
  revenue:    ()            => api.get('/invoices/stats/revenue'),
}

/* ── Attendance ───────────────────────────────────────────────────────────── */
export const attendanceApi = {
  checkin:  (memberId, type = 'gym') => api.post('/attendance/checkin', { memberId, type }),
  checkout: (id)                     => api.patch(`/attendance/${id}/checkout`),
  list:     (params = {})            => api.get('/attendance', { params }),
  summary:  (memberId)               => api.get('/attendance/summary', { params: { memberId } }),
}

/* ── Dashboard ────────────────────────────────────────────────────────────── */
export const dashboardApi = {
  stats: () => api.get('/dashboard'),
}

/* ── Workout & Diet Plans ─────────────────────────────────────────────────── */
export const workoutApi = {
  // Workout plans
  listWorkout:   (params = {})       => api.get('/workout-plans/workout', { params }),
  getWorkout:    (id)                => api.get(`/workout-plans/workout/${id}`),
  createWorkout: (data)              => api.post('/workout-plans/workout', data),
  updateWorkout: (id, data)          => api.patch(`/workout-plans/workout/${id}`, data),
  assignWorkout: (id, memberIds)     => api.post(`/workout-plans/workout/${id}/assign`, { memberIds }),
  removeWorkout: (id)                => api.delete(`/workout-plans/workout/${id}`),

  // Diet plans
  listDiet:      (params = {})       => api.get('/workout-plans/diet', { params }),
  createDiet:    (data)              => api.post('/workout-plans/diet', data),
  updateDiet:    (id, data)          => api.patch(`/workout-plans/diet/${id}`, data),
  assignDiet:    (id, memberIds)     => api.post(`/workout-plans/diet/${id}/assign`, { memberIds }),
  removeDiet:    (id)                => api.delete(`/workout-plans/diet/${id}`),
}

/* ── Staff ────────────────────────────────────────────────────────────────── */
export const staffApi = {
  list:   ()           => api.get('/staff'),
  create: (data)       => api.post('/staff', data),
  update: (id, data)   => api.patch(`/staff/${id}`, data),
  remove: (id)         => api.delete(`/staff/${id}`),
}

/* ── SaaS Admin ───────────────────────────────────────────────────────────── */
export const saasAdminApi = {
  overview: ()             => api.get('/saas-admin/overview'),
  gyms:     (params = {})  => api.get('/saas-admin/gyms', { params }),
  updateGym:(id, data)     => api.patch(`/saas-admin/gyms/${id}`, data),
  leads:    (params = {})  => api.get('/saas-admin/leads', { params }),
}

/* ── Subscriptions (SaaS billing — gym owner pays FitOS) ─────────────────── */
export const subscriptionApi = {
  create: (plan, interval) => api.post('/subscriptions/create', { plan, interval }),
  cancel: (atCycleEnd = true) => api.post('/subscriptions/cancel', { atCycleEnd }),
  status: () => api.get('/subscriptions/status'),
}
