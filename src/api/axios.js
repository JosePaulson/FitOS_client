import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

const refreshClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let isRefreshing = false
let failedQueue = []

function processQueue(error, token = null) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)))
  failedQueue = []
}

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config
    const url = original?.url || ''

    // Rate-limited — never a reason to log anyone out. Surface a warning
    // instead (skip auth routes: login/register/refresh show their own
    // inline error from the response message).
    if (err.response?.status === 429 && !url.includes('/auth/')) {
      const body = err.response?.data
      const detailMessage = typeof body === 'string' ? body : body?.message
      window.dispatchEvent(new CustomEvent('fitos:rate-limited', {
        detail: { message: detailMessage || "You're doing that a bit too fast — please wait a moment and try again." },
      }))
      return Promise.reject(err)
    }

    if (
      err.response?.status !== 401 ||
      original._retry ||
      url.includes('/auth/login') ||
      url.includes('/auth/refresh')
    ) {
      return Promise.reject(err)
    }

    original._retry = true

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`
        return api(original)
      })
    }

    isRefreshing = true
    const refreshToken = localStorage.getItem('refreshToken')

    try {
      const { data } = await refreshClient.post('/auth/refresh', { refreshToken })
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      api.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`
      processQueue(null, data.accessToken)
      original.headers.Authorization = `Bearer ${data.accessToken}`
      return api(original)
    } catch (refreshErr) {
      processQueue(refreshErr, null)
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      return Promise.reject(refreshErr)
    } finally {
      isRefreshing = false
    }
  }
)

export default api