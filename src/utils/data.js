export const NAV_LINKS = [
  { label: 'Features', href: '/#features' },
  { label: 'How it works', href: '/#how' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Contact', href: '/contact' },
]

export const FEATURES = [
  {
    icon: '👥',
    title: 'Member management',
    desc: 'Full profiles, health notes, photo IDs, and emergency contacts. Know your members the way a great gym owner should.',
  },
  {
    icon: '💳',
    title: 'Billing & invoicing',
    desc: 'Accept UPI, cards, and cash. Auto-generate invoices. Track who has paid — without chasing anyone manually.',
  },
  {
    icon: '🎯',
    title: 'Lead management',
    desc: 'Capture walk-ins, Instagram DMs, and referrals in one pipeline. Follow up on the right lead at the right time.',
  },
  {
    icon: '📅',
    title: 'Attendance tracking',
    desc: 'Mark daily check-ins, track PT sessions, and spot members who have gone quiet — before they cancel.',
  },
  {
    icon: '🏋️',
    title: 'Workout & diet plans',
    desc: 'Build plan templates and assign them in seconds. Trainers save hours; members feel taken care of.',
  },
  {
    icon: '🔔',
    title: 'Smart notifications',
    desc: 'Automated WhatsApp and email reminders for renewals, birthdays, and follow-ups.',
  },
  {
    icon: '📊',
    title: 'Analytics & reports',
    desc: 'Revenue trends, churn risk, lead conversion, and daily summaries — every morning before you open.',
  },
  {
    icon: '🏫',
    title: 'Class scheduling',
    desc: 'Set up batch timings, limit slots, and let members self-book — no WhatsApp chaos.',
  },
  {
    icon: '📱',
    title: 'Member portal',
    desc: 'Members view their plan, invoices, and workout schedule from any device. Reduces support calls to your staff.',
  },
]

export const STEPS = [
  {
    num: '01',
    title: 'Sign up in 60 seconds',
    desc: 'Create your gym account with a name and email. No credit card, no contracts. Your 7-day trial starts immediately.',
  },
  {
    num: '02',
    title: 'We import your data',
    desc: 'Share your existing member list — Excel, WhatsApp exports, paper records — and our team uploads it within 24 hours.',
  },
  {
    num: '03',
    title: 'Set up your plans',
    desc: 'Add your membership plans, fee structure, and trainer roster. Connect Razorpay for online payments in minutes.',
  },
  {
    num: '04',
    title: 'Run your gym',
    desc: 'Track attendance, manage leads, send reminders, and collect payments — all from one screen.',
  },
]

export const PLANS = [
  {
    key: 'lite',
    name: 'Lite',
    monthlyPrice: 500,
    yearlyPrice: 400,
    tagline: 'For solo trainers & small studios',
    featured: false,
    features: [
      'Up to 100 active members',
      'Membership & billing management',
      'Lead enquiry tracking',
      'Workout & diet plan builder',
      'Attendance recording',
      'Auto-generated invoices',
      'Online payments (Razorpay)',
      'Unlimited email notifications',
    ],
  },
  {
    key: 'basic',
    name: 'Basic',
    monthlyPrice: 1000,
    yearlyPrice: 800,
    tagline: 'For growing gyms with a team',
    featured: true,
    badge: 'Most popular',
    features: [
      'Everything in Lite',
      'Up to 300 active members',
      'WhatsApp notifications',
      'Calendar planner',
      'Member self-booking (enrollment link)',
      'Broadcast messages',
      'Auto courtesy messages',
      'Workout logger for members',
      'Reviews & ratings',
      'FitOS mobile app (member-facing)',
    ],
  },
  {
    key: 'pro',
    name: 'Pro',
    monthlyPrice: 2000,
    yearlyPrice: 1600,
    tagline: 'For multi-branch gyms & studios',
    featured: false,
    features: [
      'Everything in Basic',
      'Unlimited members',
      'Class scheduling & slot booking',
      'Auto renewal reminders',
      'Birthday & anniversary greetings',
      'PT session recording',
      'Push notifications',
      'Daily summary report',
      'Staff manager mobile app',
      'Analytics & insights dashboard',
      'Rewards & coupons',
    ],
  },
]

export const TESTIMONIALS = [
  {
    initials: 'RK',
    name: 'Rajesh Kumar',
    gym: 'IronZone Fitness, Pune',
    text: 'Membership renewals used to slip every month. Now the system sends WhatsApp reminders automatically and I don\'t lose a single renewal.',
  },
  {
    initials: 'PS',
    name: 'Priya Suresh',
    gym: 'Studio Flex Yoga, Bengaluru',
    text: 'The lead pipeline alone paid for itself. We used to lose track of enquiries in WhatsApp. Now every lead has a stage and a follow-up note.',
  },
  {
    initials: 'AM',
    name: 'Arun Mehta',
    gym: 'PowerHouse Gym, Ahmedabad',
    text: 'My trainer spent 2 hours a day on manual tracking. FitOS cut that to 20 minutes — he now spends the time actually training members.',
  },
]

export const STATS = [
  { id: 'gyms',    target: 1800, suffix: '+',  label: 'Gyms on FitOS',       prefix: '' },
  { id: 'members', target: 48,   suffix: 'K+', label: 'Members managed',     prefix: '' },
  { id: 'crore',   target: 12,   suffix: 'Cr+',label: 'Payments processed',  prefix: '₹' },
  { id: 'uptime',  target: 99,   suffix: '%',  label: 'Uptime SLA',          prefix: '' },
]
