import { useState } from 'react'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import PlanCard from '../components/ui/PlanCard'
import { PLANS } from '../utils/data'

const FAQ = [
  { q: 'Can I switch plans later?', a: "Yes — upgrade or downgrade any time. Billing is prorated so you only pay for what you use." },
  { q: 'What happens after the free trial?', a: "You pick a plan and add a payment method. If you don't, your account is paused — your data is safe for 30 days." },
  { q: 'Is there a setup fee?', a: 'None. We also migrate your existing member data at no extra cost.' },
  { q: 'Can I accept payments from members through FitOS?', a: 'Yes. Connect your Razorpay account and members can pay online via UPI, cards, or net banking. Payouts go directly to your bank.' },
  { q: 'Are the prices inclusive of GST?', a: 'Yes. All displayed prices are GST-inclusive (18% GST). No extra charges at checkout.' },
  { q: 'Do you offer discounts for multiple branches?', a: 'Yes. Contact us for multi-location pricing — we have custom plans starting from 3 branches.' },
]

export default function Pricing() {
  useScrollReveal()
  const { user, gym } = useAuth()
  const navigate      = useNavigate()
  const [yearly,    setYearly]    = useState(false)
  const [openFaq,   setOpenFaq]   = useState(null)
  const [paying,    setPaying]    = useState(null)   // plan key being subscribed to
  const [rzpLoading, setRzpLoading] = useState(false)

  async function handleSubscribe(plan) {
    // Not logged in — go register first
    if (!user) { navigate('/register'); return }

    // Already on a paid plan — go to dashboard
    if (gym?.planStatus === 'active') { navigate('/dashboard'); return }

    setPaying(plan.key)
    setRzpLoading(true)

    try {
      // 1. Ask our backend to create a Razorpay subscription
      const res = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ plan: plan.key, interval: yearly ? 'yearly' : 'monthly' }),
      })
      const { subscriptionId, keyId } = await res.json()

      // 2. Open Razorpay checkout
      const rzp = new window.Razorpay({
        key:             keyId,
        subscription_id: subscriptionId,
        name:            'FitOS',
        description:     `${plan.name} — ${yearly ? 'Yearly' : 'Monthly'}`,
        prefill: {
          name:  user.name,
          email: user.email,
        },
        theme: { color: '#C8F135' },
        handler(response) {
          // Payment captured — redirect to dashboard
          navigate('/dashboard?subscribed=true')
        },
      })
      rzp.on('payment.failed', () => {
        setPaying(null)
        alert('Payment failed. Please try again.')
      })
      rzp.open()
    } catch (err) {
      console.error('Subscription error:', err)
      alert('Could not initiate payment. Please try again.')
    } finally {
      setRzpLoading(false)
    }
  }

  return (
    <div className="pt-24">
      {/* Razorpay checkout.js */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />

      {/* Header */}
      <section className="py-20 px-5 md:px-8 text-center">
        <div className="max-w-2xl mx-auto">
          <p className="eyebrow justify-center flex">Pricing</p>
          <h1 className="text-[clamp(36px,5vw,60px)] font-black tracking-tight leading-[1.05] mb-4 reveal">
            Simple, honest pricing
          </h1>
          <p className="text-muted text-lg leading-relaxed reveal">
            No per-member fees. No hidden charges. Pick a plan that fits your gym.
          </p>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-4 mt-8 reveal">
            <span className={`text-sm ${!yearly ? 'text-cream font-semibold' : 'text-muted'}`}>Monthly</span>
            <button
              onClick={() => setYearly((v) => !v)}
              className={`relative w-12 h-6 rounded-full border transition-all duration-200 ${
                yearly ? 'bg-lime border-lime' : 'bg-card border-white/10'
              }`}
              aria-checked={yearly} role="switch" aria-label="Toggle yearly billing"
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform duration-200 ${
                yearly ? 'translate-x-6 bg-black' : 'translate-x-0 bg-cream'
              }`} />
            </button>
            <span className={`text-sm ${yearly ? 'text-cream font-semibold' : 'text-muted'}`}>Yearly</span>
            <span className="bg-lime/15 text-lime text-[11px] font-bold px-2.5 py-0.5 rounded-full tracking-wide">
              Save 20%
            </span>
          </div>
        </div>
      </section>

      {/* Plan cards */}
      <section className="pb-24 px-5 md:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">
          {PLANS.map((plan, i) => (
            <div key={plan.key} className="reveal" style={{ transitionDelay: `${i * 80}ms` }}>
              <PlanCard
                plan={plan}
                yearly={yearly}
                onSubscribe={() => handleSubscribe(plan)}
                subscribing={paying === plan.key && rzpLoading}
                isCurrentPlan={gym?.plan === plan.key && gym?.planStatus === 'active'}
              />
            </div>
          ))}
        </div>
        <p className="text-center text-muted text-sm mt-8 reveal">
          All plans include a 7-day free trial. No credit card required. All prices are GST-inclusive.
        </p>
      </section>

      {/* Included in every plan */}
      <section className="py-16 px-5 md:px-8 bg-ink">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold tracking-tight mb-8 text-center reveal">Every plan includes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 reveal">
            {[
              ['🔒', 'SSL & data security'],
              ['☁️', 'Cloud backup — daily'],
              ['📞', 'Phone & WhatsApp support'],
              ['🚀', 'Free onboarding call'],
              ['📦', 'Free data migration'],
              ['⚡', '99% uptime SLA'],
            ].map(([icon, label]) => (
              <div key={label} className="flex items-center gap-3 bg-card border border-white/[0.08] rounded-xl px-5 py-4">
                <span className="text-xl">{icon}</span>
                <span className="text-sm text-muted">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-5 md:px-8">
        <div className="max-w-2xl mx-auto">
          <p className="eyebrow text-center">FAQ</p>
          <h2 className="text-[clamp(28px,4vw,40px)] font-bold tracking-tight text-center mb-12 reveal">
            Questions we get a lot
          </h2>
          <div className="flex flex-col divide-y divide-white/[0.08]">
            {FAQ.map((item, i) => (
              <div key={i} className="py-5 reveal">
                <button
                  className="w-full flex items-center justify-between text-left gap-4 group"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="text-sm font-semibold group-hover:text-lime transition-colors">{item.q}</span>
                  <span className={`text-lime text-lg shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                </button>
                {openFaq === i && <p className="text-muted text-sm leading-relaxed mt-3">{item.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
