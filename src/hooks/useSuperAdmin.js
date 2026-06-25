import { useAuth } from '../context/AuthContext'

/**
 * Returns whether the current user is the FitOS platform super admin.
 * Super admin = gym owner whose gymId matches VITE_SAAS_ADMIN_GYM_ID env var.
 *
 * The env var must be set in the frontend .env:
 *   VITE_SAAS_ADMIN_GYM_ID=<your platform gym MongoDB _id>
 *
 * The backend independently enforces this on every /api/saas-admin/* request,
 * so this hook is only for UI gating (showing/hiding the super admin link).
 */
export function useSuperAdmin() {
  const { user, gym } = useAuth()

  const adminGymId = import.meta.env.VITE_SAAS_ADMIN_GYM_ID

  const isSuperAdmin =
    !!adminGymId &&
    user?.role === 'owner' &&
    user?.gymId?.toString() === adminGymId

  return { isSuperAdmin }
}
