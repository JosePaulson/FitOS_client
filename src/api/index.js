// import api from './axios'

// /* ── Members ──────────────────────────────────────────────────────────────── */
// export const memberApi = {
//   list:   (params = {}) => api.get('/members', { params }),
//   get:    (id)          => api.get(`/members/${id}`),
//   create: (data)        => api.post('/members', data),
//   update: (id, data)    => api.patch(`/members/${id}`, data),
//   renew:  (id, planId)  => api.post(`/members/${id}/renew`, { planId }),
//   remove: (id)          => api.delete(`/members/${id}`),
// }

// /* ── Membership Plans ─────────────────────────────────────────────────────── */
// export const planApi = {
//   list:   ()           => api.get('/plans'),
//   create: (data)       => api.post('/plans', data),
//   update: (id, data)   => api.patch(`/plans/${id}`, data),
//   remove: (id)         => api.delete(`/plans/${id}`),
// }

// /* ── Invoices ─────────────────────────────────────────────────────────────── */
// export const invoiceApi = {
//   list:       (params = {}) => api.get('/invoices', { params }),
//   get:        (id)          => api.get(`/invoices/${id}`),
//   markPaid:    (id, method) => api.patch(`/invoices/${id}/mark-paid`, { paymentMethod: method }),
//   resendEmail: (id)         => api.post(`/invoices/${id}/resend-email`),
//   revenue:     ()           => api.get('/invoices/stats/revenue'),
// }

// /* ── Attendance ───────────────────────────────────────────────────────────── */
// export const attendanceApi = {
//   checkin:  (memberId, type = 'gym') => api.post('/attendance/checkin', { memberId, type }),
//   checkout: (id)                     => api.patch(`/attendance/${id}/checkout`),
//   list:     (params = {})            => api.get('/attendance', { params }),
//   summary:  (memberId)               => api.get('/attendance/summary', { params: { memberId } }),
// }

// /* ── Dashboard ────────────────────────────────────────────────────────────── */
// export const dashboardApi = {
//   stats: () => api.get('/dashboard'),
// }

// /* ── Workout & Diet Plans ─────────────────────────────────────────────────── */
// export const workoutApi = {
//   // Workout plans
//   listWorkout:   (params = {})       => api.get('/workout-plans/workout', { params }),
//   getWorkout:    (id)                => api.get(`/workout-plans/workout/${id}`),
//   createWorkout: (data)              => api.post('/workout-plans/workout', data),
//   updateWorkout: (id, data)          => api.patch(`/workout-plans/workout/${id}`, data),
//   assignWorkout: (id, memberIds)     => api.post(`/workout-plans/workout/${id}/assign`, { memberIds }),
//   removeWorkout: (id)                => api.delete(`/workout-plans/workout/${id}`),

//   // Diet plans
//   listDiet:      (params = {})       => api.get('/workout-plans/diet', { params }),
//   createDiet:    (data)              => api.post('/workout-plans/diet', data),
//   updateDiet:    (id, data)          => api.patch(`/workout-plans/diet/${id}`, data),
//   assignDiet:    (id, memberIds)     => api.post(`/workout-plans/diet/${id}/assign`, { memberIds }),
//   removeDiet:    (id)                => api.delete(`/workout-plans/diet/${id}`),

//   // Prebuilt starter library
//   seedTemplates: ()                  => api.post('/workout-plans/seed-templates'),
// }

// /* ── Staff ────────────────────────────────────────────────────────────────── */
// export const staffApi = {
//   list:   ()           => api.get('/staff'),
//   create: (data)       => api.post('/staff', data),
//   update: (id, data)   => api.patch(`/staff/${id}`, data),
//   remove: (id)         => api.delete(`/staff/${id}`),
// }

// /* ── SaaS Admin ───────────────────────────────────────────────────────────── */
// export const saasAdminApi = {
//   overview: ()             => api.get('/saas-admin/overview'),
//   gyms:     (params = {})  => api.get('/saas-admin/gyms', { params }),
//   updateGym:(id, data)     => api.patch(`/saas-admin/gyms/${id}`, data),
//   leads:    (params = {})  => api.get('/saas-admin/leads', { params }),
// }

// /* ── Subscriptions (SaaS billing — gym owner pays FitOS) ─────────────────── */
// export const subscriptionApi = {
//   create: (plan, interval) => api.post('/subscriptions/create', { plan, interval }),
//   cancel: (atCycleEnd = true) => api.post('/subscriptions/cancel', { atCycleEnd }),
//   status: () => api.get('/subscriptions/status'),
// }

// /* ── Gym settings ─────────────────────────────────────────────────────────── */
// export const gymApi = {
//   getSettings:   ()       => api.get('/gym/settings'),
//   updateSettings:(data)   => api.patch('/gym/settings', data),
//   testEmail:     ()       => api.post('/gym/settings/test-email'),
// }

// /* ── PT Sessions (admin) ──────────────────────────────────────────────────── */
// export const ptApi = {
//   list:       (params)       => api.get('/pt-sessions', { params }),
//   get:        (id)           => api.get(`/pt-sessions/${id}`),
//   create:     (data)         => api.post('/pt-sessions', data),
//   update:     (id, data)     => api.patch(`/pt-sessions/${id}`, data),
//   delete:     (id)           => api.delete(`/pt-sessions/${id}`),
//   logWeight:  (id, data)     => api.post(`/pt-sessions/${id}/body-weight`, data),
//   progress:   (memberId)     => api.get(`/pt-sessions/member/${memberId}/progress`),
// }

// /* ── Equipment (admin) ────────────────────────────────────────────────────── */
// export const equipmentApi = {
//   list:   (params)   => api.get('/equipment', { params }),
//   get:    (id)        => api.get(`/equipment/${id}`),
//   // `data` is a plain object; `imageFile` is an optional File — built into
//   // FormData here so callers never have to think about multipart encoding.
//   create: (data, imageFile) => {
//     const fd = toEquipmentFormData(data, imageFile)
//     return api.post('/equipment', fd, { headers: { 'Content-Type': undefined } })
//   },
//   update: (id, data, imageFile) => {
//     const fd = toEquipmentFormData(data, imageFile)
//     return api.patch(`/equipment/${id}`, fd, { headers: { 'Content-Type': undefined } })
//   },
//   remove: (id) => api.delete(`/equipment/${id}`),
// }

// function toEquipmentFormData(data, imageFile) {
//   const fd = new FormData()
//   Object.entries(data).forEach(([k, v]) => { if (v !== undefined && v !== null) fd.append(k, v) })
//   if (imageFile) fd.append('image', imageFile)
//   return fd
// }

// /* ── Workout Library (admin) ─────────────────────────────────────────────── */
// export const workoutLibraryApi = {
//   list:   (params) => api.get('/workout-library', { params }),
//   get:    (id)      => api.get(`/workout-library/${id}`),
//   // `files` is an optional { image?: File, video?: File }
//   create: (data, files = {}) => {
//     const fd = toWorkoutFormData(data, files)
//     return api.post('/workout-library', fd, { headers: { 'Content-Type': undefined } })
//   },
//   update: (id, data, files = {}) => {
//     const fd = toWorkoutFormData(data, files)
//     return api.patch(`/workout-library/${id}`, fd, { headers: { 'Content-Type': undefined } })
//   },
//   remove: (id) => api.delete(`/workout-library/${id}`),
// }

// function toWorkoutFormData(data, files) {
//   const fd = new FormData()
//   Object.entries(data).forEach(([k, v]) => { if (v !== undefined && v !== null) fd.append(k, v) })
//   if (files.image) fd.append('image', files.image)
//   if (files.video) fd.append('video', files.video)
//   return fd
// }


import api from './axios'

/* ── Members ──────────────────────────────────────────────────────────────── */
export const memberApi = {
  list: (params = {}) => api.get('/members', { params }),
  get: (id) => api.get(`/members/${id}`),
  create: (data) => api.post('/members', data),
  update: (id, data) => api.patch(`/members/${id}`, data),
  renew: (id, planId, startDate) => api.post(`/members/${id}/renew`, { planId, startDate }),
  remove: (id) => api.delete(`/members/${id}`),
}

/* ── Membership Plans ─────────────────────────────────────────────────────── */
export const planApi = {
  list: () => api.get('/plans'),
  create: (data) => api.post('/plans', data),
  update: (id, data) => api.patch(`/plans/${id}`, data),
  remove: (id) => api.delete(`/plans/${id}`),
}

/* ── PT Plans (catalog) — independent of membership plans, optional ────────── */
export const ptPlanApi = {
  list: () => api.get('/pt-plans'),
  create: (data) => api.post('/pt-plans', data),
  update: (id, data) => api.patch(`/pt-plans/${id}`, data),
  remove: (id) => api.delete(`/pt-plans/${id}`),
}

/* ── PT Plan assignments (a member's actual purchase of a PT plan) ─────────── */
export const memberPTPlanApi = {
  list: (params = {}) => api.get('/member-pt-plans', { params }),
  assign: (data) => api.post('/member-pt-plans', data),
  logClass: (id) => api.patch(`/member-pt-plans/${id}/log-class`),
  undoClass: (id) => api.patch(`/member-pt-plans/${id}/undo-class`),
  update: (id, data) => api.patch(`/member-pt-plans/${id}`, data),
  cancel: (id) => api.delete(`/member-pt-plans/${id}`),
}

/* ── Invoices ─────────────────────────────────────────────────────────────── */
export const invoiceApi = {
  list: (params = {}) => api.get('/invoices', { params }),
  get: (id) => api.get(`/invoices/${id}`),
  markPaid: (id, method) => api.patch(`/invoices/${id}/mark-paid`, { paymentMethod: method }),
  resendEmail: (id) => api.post(`/invoices/${id}/resend-email`),
  revenue: () => api.get('/invoices/stats/revenue'),
}

/* ── Attendance ───────────────────────────────────────────────────────────── */
export const attendanceApi = {
  checkin: (memberId, type = 'gym') => api.post('/attendance/checkin', { memberId, type }),
  checkout: (id) => api.patch(`/attendance/${id}/checkout`),
  list: (params = {}) => api.get('/attendance', { params }),
  summary: (memberId) => api.get('/attendance/summary', { params: { memberId } }),
}

/* ── Dashboard ────────────────────────────────────────────────────────────── */
export const dashboardApi = {
  stats: () => api.get('/dashboard'),
}

/* ── Workout & Diet Plans ─────────────────────────────────────────────────── */
export const workoutApi = {
  // Workout plans
  listWorkout: (params = {}) => api.get('/workout-plans/workout', { params }),
  getWorkout: (id) => api.get(`/workout-plans/workout/${id}`),
  createWorkout: (data) => api.post('/workout-plans/workout', data),
  updateWorkout: (id, data) => api.patch(`/workout-plans/workout/${id}`, data),
  assignWorkout: (id, memberIds) => api.post(`/workout-plans/workout/${id}/assign`, { memberIds }),
  removeWorkout: (id) => api.delete(`/workout-plans/workout/${id}`),

  // Diet plans
  listDiet: (params = {}) => api.get('/workout-plans/diet', { params }),
  // `file` is an optional File (PDF/Word/Excel/image) attached alongside
  // the structured meal builder; `removeFile` (update only) clears an
  // existing attachment.
  createDiet: (data, file) => {
    const fd = toDietFormData(data, file)
    return api.post('/workout-plans/diet', fd, { headers: { 'Content-Type': undefined } })
  },
  updateDiet: (id, data, file, removeFile) => {
    const fd = toDietFormData(data, file, removeFile)
    return api.patch(`/workout-plans/diet/${id}`, fd, { headers: { 'Content-Type': undefined } })
  },
  assignDiet: (id, memberIds) => api.post(`/workout-plans/diet/${id}/assign`, { memberIds }),
  removeDiet: (id) => api.delete(`/workout-plans/diet/${id}`),

  // Prebuilt starter library
  seedTemplates: () => api.post('/workout-plans/seed-templates'),
}

function toDietFormData(data, file, removeFile) {
  const fd = new FormData()
  Object.entries(data).forEach(([k, v]) => {
    if (v === undefined || v === null) return
    fd.append(k, k === 'meals' ? JSON.stringify(v) : v)
  })
  if (file) fd.append('file', file)
  if (removeFile) fd.append('removeFile', 'true')
  return fd
}

/* ── Staff ────────────────────────────────────────────────────────────────── */
export const staffApi = {
  // Pass excludeOwner=true wherever the list is used for attendance/payroll/
  // leave/reimbursements — the owner isn't "staff" for those purposes.
  list: (params = {}) => api.get('/staff', { params }),
  create: (data) => api.post('/staff', data),
  update: (id, data) => api.patch(`/staff/${id}`, data),
  remove: (id) => api.delete(`/staff/${id}`),
}

/* ── Payroll & staff attendance ───────────────────────────────────────────── */
export const staffPayrollApi = {
  // Self-service — the signed-in staff member's own record
  myCalendar: (month) => api.get('/staff-payroll/my/calendar', { params: { month } }),
  mySummary:  (month) => api.get('/staff-payroll/my/summary', { params: { month } }),
  submitMyAttendance: (data) => api.post('/staff-payroll/my/attendance', data),
  // Batch submit — array of { date, status, notes } entries, e.g. every
  // marked day from last month, submitted for approval in one request.
  submitMyAttendanceBulk: (entries) => api.post('/staff-payroll/my/attendance/bulk', { entries }),

  // Admin — viewing/managing another staff member (permission-gated server-side)
  getSalary:    (staffId) => api.get(`/staff-payroll/staff/${staffId}/salary`),
  setSalary:    (staffId, data) => api.put(`/staff-payroll/staff/${staffId}/salary`, data),
  getSchedule:  (staffId) => api.get(`/staff-payroll/staff/${staffId}/schedule`),
  setSchedule:  (staffId, data) => api.put(`/staff-payroll/staff/${staffId}/schedule`, data),
  staffCalendar: (staffId, month) => api.get(`/staff-payroll/staff/${staffId}/calendar`, { params: { month } }),
  staffSummary:  (staffId, month) => api.get(`/staff-payroll/staff/${staffId}/summary`, { params: { month } }),
  setStaffAttendance: (staffId, data) => api.post(`/staff-payroll/staff/${staffId}/attendance`, data),
  deleteAttendance: (id) => api.delete(`/staff-payroll/attendance/${id}`),

  // Approvals
  pending: () => api.get('/staff-payroll/pending'),
  approve: (id, markPaid) => api.patch(`/staff-payroll/attendance/${id}/approve`, markPaid === undefined ? {} : { markPaid }),
  reject:  (id, reason) => api.patch(`/staff-payroll/attendance/${id}/reject`, { reason }),
  approveBulk: (ids) => api.patch('/staff-payroll/attendance/approve-bulk', { ids, decision: 'approve' }),
  rejectBulk:  (ids, reason) => api.patch('/staff-payroll/attendance/approve-bulk', { ids, decision: 'reject', reason }),
  approveMonth: (staffId, month) => api.patch(`/staff-payroll/staff/${staffId}/attendance/approve-month`, {}, { params: { month } }),

  // Owner-only
  analytics: (month, staffId) => api.get('/staff-payroll/analytics', { params: { month, staffId } }),
  setPermissions: (managerId, perms) => api.put(`/staff-payroll/permissions/${managerId}`, perms),
}

/* ── Leave requests ───────────────────────────────────────────────────────── */
export const leaveApi = {
  myList: () => api.get('/leave/my'),
  submit: (data) => api.post('/leave/my', data),
  cancel: (id) => api.patch(`/leave/my/${id}/cancel`),

  list: (params = {}) => api.get('/leave', { params }),
  pending: () => api.get('/leave/pending'),
  approve: (id, leaveType, reviewNote) => api.patch(`/leave/${id}/approve`, { leaveType, reviewNote }),
  reject: (id, reason) => api.patch(`/leave/${id}/reject`, { reason }),
}

/* ── Reimbursement requests ───────────────────────────────────────────────── */
export const reimbursementApi = {
  myList: () => api.get('/reimbursements/my'),
  submit: (data) => api.post('/reimbursements/my', data),
  cancel: (id) => api.patch(`/reimbursements/my/${id}/cancel`),

  list: (params = {}) => api.get('/reimbursements', { params }),
  pending: () => api.get('/reimbursements/pending'),
  approve: (id, reviewNote) => api.patch(`/reimbursements/${id}/approve`, { reviewNote }),
  reject: (id, reason) => api.patch(`/reimbursements/${id}/reject`, { reason }),
  markPaid: (id) => api.patch(`/reimbursements/${id}/mark-paid`),
}

/* ── Trainer availability (working hours + time-off) ────────────────────── */
export const trainerAvailabilityApi = {
  get: (trainerId) => api.get(`/trainer-availability/${trainerId}`),
  update: (trainerId, data) => api.patch(`/trainer-availability/${trainerId}`, data),
  timeOff: (trainerId) => api.get(`/trainer-availability/${trainerId}/time-off`),
  addTimeOff: (trainerId, data) => api.post(`/trainer-availability/${trainerId}/time-off`, data),
  removeTimeOff: (trainerId, id) => api.delete(`/trainer-availability/${trainerId}/time-off/${id}`),
}

/* ── SaaS Admin ───────────────────────────────────────────────────────────── */
export const saasAdminApi = {
  overview: () => api.get('/saas-admin/overview'),
  gyms: (params = {}) => api.get('/saas-admin/gyms', { params }),
  updateGym: (id, data) => api.patch(`/saas-admin/gyms/${id}`, data),
  leads: (params = {}) => api.get('/saas-admin/leads', { params }),
}

/* ── Subscriptions (SaaS billing — gym owner pays FitOS) ─────────────────── */
export const subscriptionApi = {
  create: (plan, interval) => api.post('/subscriptions/create', { plan, interval }),
  cancel: (atCycleEnd = true) => api.post('/subscriptions/cancel', { atCycleEnd }),
  status: () => api.get('/subscriptions/status'),
}

/* ── Gym settings ─────────────────────────────────────────────────────────── */
export const gymApi = {
  getSettings: () => api.get('/gym/settings'),
  updateSettings: (data) => api.patch('/gym/settings', data),
  testEmail: () => api.post('/gym/settings/test-email'),
}

/* ── PT Sessions (admin) ──────────────────────────────────────────────────── */
export const ptApi = {
  list: (params) => api.get('/pt-sessions', { params }),
  get: (id) => api.get(`/pt-sessions/${id}`),
  create: (data) => api.post('/pt-sessions', data),
  update: (id, data) => api.patch(`/pt-sessions/${id}`, data),
  delete: (id) => api.delete(`/pt-sessions/${id}`),
  logWeight: (id, data) => api.post(`/pt-sessions/${id}/body-weight`, data),
  progress: (memberId) => api.get(`/pt-sessions/member/${memberId}/progress`),
  confirm: (id, data) => api.post(`/pt-sessions/${id}/confirm`, data),
  decline: (id, data) => api.post(`/pt-sessions/${id}/decline`, data),
}

/* ── Member workout logs (admin — read-only, for PR lookups) ─────────────── */
export const workoutLogApi = {
  list: (params) => api.get('/workout-logs', { params }),
}

/* ── Equipment (admin) ────────────────────────────────────────────────────── */
export const equipmentApi = {
  list: (params) => api.get('/equipment', { params }),
  get: (id) => api.get(`/equipment/${id}`),
  // `data` is a plain object; `imageFile` is an optional File — built into
  // FormData here so callers never have to think about multipart encoding.
  create: (data, imageFile) => {
    const fd = toEquipmentFormData(data, imageFile)
    return api.post('/equipment', fd, { headers: { 'Content-Type': undefined } })
  },
  update: (id, data, imageFile) => {
    const fd = toEquipmentFormData(data, imageFile)
    return api.patch(`/equipment/${id}`, fd, { headers: { 'Content-Type': undefined } })
  },
  remove: (id) => api.delete(`/equipment/${id}`),
}

function toEquipmentFormData(data, imageFile) {
  const fd = new FormData()
  Object.entries(data).forEach(([k, v]) => { if (v !== undefined && v !== null) fd.append(k, v) })
  if (imageFile) fd.append('image', imageFile)
  return fd
}

/* ── Workout Library (admin) ─────────────────────────────────────────────── */
export const workoutLibraryApi = {
  list: (params) => api.get('/workout-library', { params }),
  get: (id) => api.get(`/workout-library/${id}`),
  // `files` is an optional { image?: File, video?: File }
  create: (data, files = {}) => {
    const fd = toWorkoutFormData(data, files)
    return api.post('/workout-library', fd, { headers: { 'Content-Type': undefined } })
  },
  update: (id, data, files = {}) => {
    const fd = toWorkoutFormData(data, files)
    return api.patch(`/workout-library/${id}`, fd, { headers: { 'Content-Type': undefined } })
  },
  remove: (id) => api.delete(`/workout-library/${id}`),
  reorder: (category, orderedIds) => api.patch('/workout-library/reorder', { category, orderedIds }),
}

function toWorkoutFormData(data, files) {
  const fd = new FormData()
  Object.entries(data).forEach(([k, v]) => { if (v !== undefined && v !== null) fd.append(k, v) })
  if (files.image) fd.append('image', files.image)
  if (files.video) fd.append('video', files.video)
  return fd
}

/* ── Complaints & requests (admin — owner/manager) ────────────────────────── */
export const complaintApi = {
  list: (params = {}) => api.get('/complaints', { params }),
  get: (id) => api.get(`/complaints/${id}`),
  updateStatus: (id, data) => api.patch(`/complaints/${id}`, data),
  respond: (id, text) => api.post(`/complaints/${id}/respond`, { text }),
}

/* ── Staff ratings & remarks (admin — owner only) ─────────────────────────── */
export const staffRatingApi = {
  list: (params = {}) => api.get('/staff-ratings', { params }),
}

/* ── Weekly PT timetable (admin — trainer builds/manages, owner/manager oversee) ── */
export const timetableApi = {
  list: (params = {}) => api.get('/timetable', { params }),
  generate: (trainerId) => api.post(`/timetable/${trainerId}/generate`),
  addSlots: (trainerId, data) => api.post(`/timetable/${trainerId}/slots`, data),
  assign: (id, data) => api.patch(`/timetable/${id}/assign`, data),
  empty: (id) => api.patch(`/timetable/${id}/empty`),
  approveRequest: (id) => api.post(`/timetable/${id}/approve-request`),
  declineRequest: (id, reason) => api.post(`/timetable/${id}/decline-request`, { reason }),
  remove: (id) => api.delete(`/timetable/${id}`),
}

/* ── Exercise catalog (admin — categories + exercises) ────────────────────── */
export const exerciseCatalogApi = {
  categories: {
    list:   ()          => api.get('/exercise-catalog/categories'),
    create: (data)       => api.post('/exercise-catalog/categories', data),
    update: (id, data)   => api.patch(`/exercise-catalog/categories/${id}`, data),
    remove: (id)         => api.delete(`/exercise-catalog/categories/${id}`),
  },
  exercises: {
    list:   (params = {}) => api.get('/exercise-catalog/exercises', { params }),
    create: (data)        => api.post('/exercise-catalog/exercises', data),
    update: (id, data)    => api.patch(`/exercise-catalog/exercises/${id}`, data),
    remove: (id)          => api.delete(`/exercise-catalog/exercises/${id}`),
  },
}