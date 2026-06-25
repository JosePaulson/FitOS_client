import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useSuperAdmin } from '../../hooks/useSuperAdmin'

/**
 * Guards all /superadmin/* routes.
 * Redirects to /dashboard if not logged in or not super admin.
 */
export default function SuperAdminRoute({ children }) {
  const { user, loading } = useAuth()
  const { isSuperAdmin } = useSuperAdmin()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="w-8 h-8 border-2 border-red-400 rounded-full border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (!isSuperAdmin) return <Navigate to="/dashboard" replace />

  return children
}
