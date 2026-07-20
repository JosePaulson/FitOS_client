import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

/**
 * Wrap the marketing/login/register routes. If the user is already
 * authenticated, the app should open straight to the dashboard instead of
 * showing the marketing homepage or login form again.
 *
 * Usage in App.jsx:
 *   <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
 */
export default function PublicRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="w-8 h-8 border-2 rounded-full border-lime border-t-transparent animate-spin" />
      </div>
    )
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
