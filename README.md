# FitOS — Gym Management SaaS (MVP)

Full MERN stack: **Vite + React 18 + Tailwind CSS 3** (frontend) · **Express + MongoDB + Mongoose** (backend).

---

## Quick start

```bash
# Install all dependencies (frontend + backend)
npm run install:all

# Copy and fill in env files
cp .env.example .env
cp server/.env.example server/.env

# Run both servers concurrently
npm run dev
# Frontend → http://localhost:5173
# Backend  → http://localhost:5000
```

---

## Project structure

```
fitos-landing/
├── src/                              # React frontend
│   ├── api/
│   │   ├── axios.js                  # Axios + JWT attach + silent token refresh
│   │   ├── auth.api.js
│   │   ├── lead.api.js
│   │   └── index.js                  # memberApi, planApi, invoiceApi,
│   │                                 # attendanceApi, dashboardApi, workoutApi,
│   │                                 # staffApi, saasAdminApi, subscriptionApi
│   ├── context/AuthContext.jsx       # Global auth state, login/logout/register
│   ├── components/
│   │   ├── layout/Navbar.jsx         # Auth-aware nav (Dashboard vs Log in)
│   │   ├── layout/Footer.jsx
│   │   ├── sections/                 # Hero, Features, HowItWorks, Testimonials
│   │   ├── admin/
│   │   │   ├── AdminLayout.jsx       # Sidebar + topbar, role-filtered nav
│   │   │   └── StatCard.jsx
│   │   └── ui/
│   │       ├── Button.jsx
│   │       ├── PlanCard.jsx          # Pricing card with Razorpay subscribe button
│   │       └── PrivateRoute.jsx      # Auth + role guard
│   ├── hooks/
│   │   ├── useScrollReveal.js
│   │   └── useCounter.js
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Pricing.jsx               # Razorpay checkout integration
│   │   ├── Contact.jsx               # Posts to /api/leads/enquiry
│   │   ├── Login.jsx
│   │   ├── Register.jsx              # 2-step wizard
│   │   ├── NotFound.jsx
│   │   └── admin/
│   │       ├── Dashboard.jsx         # KPIs + revenue trend + recent members
│   │       ├── Members.jsx           # List, search, add, renew
│   │       ├── Leads.jsx             # Pipeline with stage drag + notes
│   │       ├── Billing.jsx           # Invoice list, mark-paid, revenue stats
│   │       ├── Attendance.jsx        # Check-in search + daily log
│   │       ├── Plans.jsx             # Membership plan CRUD
│   │       ├── WorkoutPlans.jsx      # Workout + diet plan builder + assign
│   │       └── Staff.jsx             # Staff invite, role change, deactivate
│   └── utils/data.js                 # All static content (features, plans, etc.)
│
└── server/                           # Express backend
    ├── app.js                        # Entry point — all routes mounted here
    ├── config/db.js
    ├── models/
    │   ├── Gym.js                    # Tenant root + SaaS billing state
    │   ├── User.js                   # Staff (owner/manager/trainer/receptionist)
    │   ├── Member.js
    │   ├── MembershipPlan.js
    │   ├── Invoice.js                # Auto invoice number, Razorpay fields
    │   ├── Lead.js                   # Pre-signup (gymId:null) + gym pipeline
    │   ├── Attendance.js
    │   ├── WorkoutPlan.js
    │   └── DietPlan.js
    ├── routes/
    │   ├── auth.routes.js            # /register /login /refresh /logout /me
    │   ├── lead.routes.js            # /enquiry (public) + pipeline CRUD
    │   ├── member.routes.js          # CRUD + /renew
    │   ├── plan.routes.js            # Membership plan CRUD
    │   ├── invoice.routes.js         # List, /mark-paid, /stats/revenue
    │   ├── attendance.routes.js      # /checkin /checkout /summary
    │   ├── dashboard.routes.js       # Single request — all KPIs
    │   ├── workout.routes.js         # Workout + diet plan CRUD + /assign
    │   ├── staff.routes.js           # Staff invite + role + deactivate
    │   ├── subscription.routes.js    # /create /cancel /status (Razorpay SaaS)
    │   ├── saasAdmin.routes.js       # Platform owner panel
    │   └── webhook.routes.js         # POST /api/webhooks/razorpay
    ├── middleware/
    │   ├── auth.js                   # protect(), authorize(...roles)
    │   ├── planGate.js               # planGate('feature') — SaaS tier enforcement
    │   └── errorHandler.js
    ├── services/
    │   ├── email.service.js          # Nodemailer — welcome, renewal, invoice, lead ack
    │   ├── whatsapp.service.js       # WATI templates
    │   └── razorpay.service.js       # createSubscription, webhook handler
    └── jobs/
        ├── renewalReminders.js       # Daily — 7d/3d/1d reminders + expiry updates
        └── birthdayGreetings.js      # Daily — WhatsApp + email birthday greetings
```

---

## API endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | — | Register gym + owner |
| POST | `/api/auth/login` | — | Login |
| GET  | `/api/auth/me` | ✓ | Current user + gym |
| POST | `/api/leads/enquiry` | — | Landing page contact form |
| GET  | `/api/leads` | ✓ | Lead pipeline (gym-scoped) |
| GET  | `/api/members` | ✓ | List with search/filter/paginate |
| POST | `/api/members` | ✓ | Enrol + auto-create invoice |
| POST | `/api/members/:id/renew` | ✓ | Renew + new invoice |
| GET  | `/api/dashboard` | ✓ | All KPIs in one request |
| GET  | `/api/invoices/stats/revenue` | ✓ | Monthly revenue trend |
| PATCH | `/api/invoices/:id/mark-paid` | ✓ | Record cash/UPI payment |
| POST | `/api/attendance/checkin` | ✓ | Mark member present |
| POST | `/api/workout-plans/workout/:id/assign` | ✓ | Assign workout to members |
| POST | `/api/subscriptions/create` | ✓ | Create Razorpay subscription |
| POST | `/api/webhooks/razorpay` | sig | Razorpay subscription events |
| GET  | `/api/saas-admin/overview` | ✓ admin | Platform KPIs |

---

## SaaS billing flow

```
Gym owner registers → 7-day trial (all features unlocked)
    ↓
Trial ends → prompt to subscribe on /pricing
    ↓
Click "Start free trial" on plan card
    ↓
POST /api/subscriptions/create → Razorpay subscription created
    ↓
Razorpay checkout modal opens (in-browser)
    ↓
Payment success → redirect to /dashboard?subscribed=true
    ↓
Razorpay fires webhook → POST /api/webhooks/razorpay
    ↓
handleWebhookEvent() updates Gym.planStatus = 'active'
    ↓
planGate() middleware enforces tier on protected routes
```

---

## Deployment checklist

- [ ] MongoDB Atlas — free M0 cluster for dev, M10+ for prod
- [ ] Set all env vars in server/.env (JWT secrets, Razorpay keys, SMTP, WATI)
- [ ] Create Razorpay plans in dashboard, paste IDs into RZPY_PLAN_* env vars
- [ ] Set SAAS_ADMIN_GYM_ID to your platform gym's MongoDB _id
- [ ] Deploy backend to Railway or Render (set PORT, NODE_ENV=production)
- [ ] Deploy frontend to Vercel (set VITE_API_URL to your backend URL)
- [ ] Add Razorpay webhook URL: https://yourdomain.com/api/webhooks/razorpay
- [ ] Verify WATI templates are approved before going live
