import { Routes, Route } from 'react-router-dom'
import UpdateChecker from './components/UpdateChecker'
import CookieConsentBanner from './components/CookieConsentBanner'

// Layouts
import { Outlet }        from 'react-router-dom'
import Navbar            from './components/layout/Navbar'
import Footer            from './components/layout/Footer'
import AdminLayout       from './components/admin/AdminLayout'
import SuperAdminLayout  from './components/admin/SuperAdminLayout'

// Guards
import PrivateRoute      from './components/ui/PrivateRoute'
import PublicRoute       from './components/ui/PublicRoute'
import SuperAdminRoute   from './components/ui/SuperAdminRoute'

// Public pages
import Home     from './pages/Home'
import Pricing  from './pages/Pricing'
import Contact  from './pages/Contact'
import NotFound from './pages/NotFound'
import TermsOfService from './pages/legal/TermsOfService'
import PrivacyPolicy  from './pages/legal/PrivacyPolicy'
import RefundPolicy   from './pages/legal/RefundPolicy'
import CookiePolicy   from './pages/legal/CookiePolicy'

// Auth pages
import Login    from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword  from './pages/ResetPassword'

// Gym admin pages
import Dashboard    from './pages/admin/Dashboard'
import Members      from './pages/admin/Members'
import Leads        from './pages/admin/Leads'
import Billing      from './pages/admin/Billing'
import Attendance   from './pages/admin/Attendance'
import Plans        from './pages/admin/Plans'
import PTPlans      from './pages/admin/PTPlans'
import Payroll      from './pages/admin/Payroll'
import WorkoutPlans from './pages/admin/WorkoutPlans'
import Staff        from './pages/admin/Staff'
import Settings     from './pages/admin/Settings'
import PTSessions   from './pages/admin/PTSessions'
import Equipment       from './pages/admin/Equipment'
import WorkoutLibrary  from './pages/admin/WorkoutLibrary'
import ExerciseCatalog from './pages/admin/ExerciseCatalog'
import Complaints      from './pages/admin/Complaints'
import StaffRatings    from './pages/admin/StaffRatings'
import Leave           from './pages/admin/Leave'
import Reimbursements  from './pages/admin/Reimbursements'

// Super admin pages
import SAOverview from './pages/superadmin/Overview'
import SAGyms     from './pages/superadmin/Gyms'
import SALeads    from './pages/superadmin/Leads'

export default function App() {
  return (
    <>
      <UpdateChecker />
      <CookieConsentBanner />
      <Routes>
      {/* ── Public routes ── */}
      <Route element={<PublicLayout />}>
        <Route path="/"        element={<PublicRoute><Home /></PublicRoute>} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/terms"         element={<TermsOfService />} />
        <Route path="/privacy"       element={<PrivacyPolicy />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/cookie-policy" element={<CookiePolicy />} />
      </Route>

      {/* ── Auth routes ── */}
      <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/forgot-password"       element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      <Route path="/reset-password/:token" element={<PublicRoute><ResetPassword /></PublicRoute>} />

      {/* ── Gym admin dashboard ── */}
      <Route
        path="/dashboard"
        element={<PrivateRoute><AdminLayout /></PrivateRoute>}
      >
        <Route index                element={<Dashboard />} />
        <Route path="members"       element={<Members />} />
        <Route path="leads"         element={<Leads />} />
        <Route path="billing"       element={<Billing />} />
        <Route path="attendance"    element={<Attendance />} />
        <Route path="plans"         element={<Plans />} />
        <Route path="pt-plans"      element={<PTPlans />} />
        <Route path="payroll"      element={<Payroll />} />
        <Route path="workout-plans" element={<WorkoutPlans />} />
        <Route path="staff"         element={
          <PrivateRoute roles={['owner', 'manager']}><Staff /></PrivateRoute>
        } />
        <Route path="settings"      element={
          <PrivateRoute roles={['owner']}><Settings /></PrivateRoute>
        } />
        <Route path="pt-sessions"    element={
          <PrivateRoute roles={['owner','manager','trainer']}><PTSessions /></PrivateRoute>
        } />
        <Route path="equipment"        element={<Equipment />} />
        <Route path="workout-library"  element={<WorkoutLibrary />} />
        <Route path="exercise-catalog" element={
          <PrivateRoute roles={['owner', 'manager']}><ExerciseCatalog /></PrivateRoute>
        } />
        <Route path="complaints"       element={
          <PrivateRoute roles={['owner', 'manager']}><Complaints /></PrivateRoute>
        } />
        <Route path="staff-ratings"    element={
          <PrivateRoute roles={['owner']}><StaffRatings /></PrivateRoute>
        } />
        <Route path="leave"            element={<Leave />} />
        <Route path="reimbursements"   element={<Reimbursements />} />
      </Route>

      {/* ── Super admin console ── */}
      <Route
        path="/superadmin"
        element={<SuperAdminRoute><SuperAdminLayout /></SuperAdminRoute>}
      >
        <Route index         element={<SAOverview />} />
        <Route path="gyms"   element={<SAGyms />} />
        <Route path="leads"  element={<SALeads />} />
      </Route>

      {/* ── 404 ── */}
      <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1"><Outlet /></main>
      <Footer />
    </div>
  )
}
