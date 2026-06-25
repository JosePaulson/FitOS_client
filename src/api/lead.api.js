import api from './axios'

export const leadApi = {
  /**
   * Public enquiry — called by the landing page contact form.
   * No auth required.
   */
  submitEnquiry: (formData) => api.post('/leads/enquiry', formData),

  /** List leads for the gym (auth required) */
  list: (params = {}) => api.get('/leads', { params }),

  /** Get single lead */
  get: (id) => api.get(`/leads/${id}`),

  /** Update stage / assignedTo */
  update: (id, data) => api.patch(`/leads/${id}`, data),

  /** Add a follow-up note */
  addNote: (id, text) => api.post(`/leads/${id}/notes`, { text }),

  /** Delete a lead */
  remove: (id) => api.delete(`/leads/${id}`),
}
