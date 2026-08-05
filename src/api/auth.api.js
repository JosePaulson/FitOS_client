import api from './axios'

export const authApi = {
  /** Register a new gym + owner account */
  register: (data) => api.post('/auth/register', data),

  /** Login — returns { accessToken, refreshToken, user, gym } */
  login: (email, password) => api.post('/auth/login', { email, password }),

  /** Exchange refresh token for a new access token */
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),

  /** Logout (clears server-side refresh token) */
  logout: () => api.post('/auth/logout'),

  /** Get current user + gym info */
  me: () => api.get('/auth/me'),

  /** Change password while signed in (requires current password) */
  changePassword: (currentPassword, newPassword) =>
    api.patch('/auth/change-password', { currentPassword, newPassword }),

  /** Request a password-reset email */
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),

  /** Complete a password reset using the token from the emailed link */
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
}
