import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '../api/auth.api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [gym,  setGym]        = useState(null)
  const [loading, setLoading] = useState(true)  // true while checking stored token

  /* Restore session from localStorage on app load */
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) { setLoading(false); return }

    authApi.me()
      .then(({ data }) => {
        setUser(data.user)
        setGym(data.gym)
      })
      .catch(() => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    const { data } = await authApi.login(email, password)
    localStorage.setItem('accessToken',  data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    setUser(data.user)
    setGym(data.gym)
    return data
  }, [])

  const register = useCallback(async (formData) => {
    const { data } = await authApi.register(formData)
    localStorage.setItem('accessToken',  data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    setUser(data.user)
    setGym(data.gym)
    return data
  }, [])

  const logout = useCallback(async () => {
    try { await authApi.logout() } catch (_) { /* ignore */ }
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setUser(null)
    setGym(null)
  }, [])

  const isOwner   = user?.role === 'owner'
  const isManager = ['owner', 'manager'].includes(user?.role)

  return (
    <AuthContext.Provider value={{ user, gym, loading, login, register, logout, isOwner, isManager }}>
      {children}
    </AuthContext.Provider>
  )
}

/** Use anywhere inside the app */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
