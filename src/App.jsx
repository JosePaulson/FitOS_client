import { Routes, Route } from 'react-router-dom'

// Layouts
import { Outlet }        from 'react-router-dom'
import Navbar            from './components/layout/Navbar'
import Footer            from './components/layout/Footer'
import AdminLayout       from './components/admin/AdminLayout'
import SuperAdminLayout  from './components/admin/SuperAdminLayout'

// Guards
import PrivateRoute      from './components/ui/PrivateRoute'
import SuperAdminRoute   from './components/ui/SuperAdminRoute'

// Public pages
import Home     from './pages/Home'
import Pricing  from './pages/Pricing'
import Contact  from './pages/Contact'
import NotFound from './pages/NotFound'

// Auth pages
import Login    from './pages/Login'
import Register from './pages/Register'

// Gym admin pages
import Dashboard    from './pages/admin/Dashboard'
import Members      from './pages/admin/Members'
import Leads        from './pages/admin/Leads'
import Billing      from './pages/admin/Billing'
import Attendance   from './pages/admin/Attendance'
import Plans        from './pages/admin/Plans'
import WorkoutPlans from './pages/admin/WorkoutPlans'
import Staff        from './pages/admin/Staff'

// Super admin pages
import SAOverview from './pages/superadmin/Overview'
import SAGyms     from './pages/superadmin/Gyms'
import SALeads    from './pages/superadmin/Leads'

export default function App() {
  return (
    <Routes>
      {/* ── Public routes ── */}
      <Route element={<PublicLayout />}>
        <Route path="/"        element={<Home />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/contact" element={<Contact />} />
      </Route>

      {/* ── Auth routes ── */}
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

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
        <Route path="workout-plans" element={<WorkoutPlans />} />
        <Route path="staff"         element={
          <PrivateRoute roles={['owner', 'manager']}><Staff /></PrivateRoute>
        } />
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
