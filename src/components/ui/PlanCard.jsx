export default function PlanCard({ plan, yearly, onSubscribe, subscribing = false, isCurrentPlan = false }) {
  const price = yearly ? plan.yearlyPrice : plan.monthlyPrice

  return (
    <div className={`relative flex flex-col rounded-2xl border p-8 transition-all duration-200 hover:-translate-y-1 ${
      plan.featured
        ? 'border-lime bg-gradient-to-br from-lime/5 to-card'
        : 'border-white/[0.08] bg-card hover:border-lime/30'
    }`}>
      {plan.badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-lime text-black text-[11px] font-extrabold tracking-widest uppercase px-4 py-1 rounded-full">
          {plan.badge}
        </span>
      )}

      <p className={`text-xs font-semibold uppercase tracking-widest mb-3 ${plan.featured ? 'text-lime' : 'text-muted'}`}>
        {plan.name}
      </p>

      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-xl font-bold text-muted">₹</span>
        <span className="text-5xl font-black tracking-tight leading-none">{price.toLocaleString('en-IN')}</span>
        <span className="text-sm text-muted">/mo</span>
      </div>
      <p className="text-sm text-muted mb-7">{plan.tagline}</p>

      <div className="border-t border-white/[0.08] mb-6" />

      <ul className="flex flex-col gap-3 flex-1">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-muted">
            <span className="text-lime font-bold mt-0.5 shrink-0">✓</span>
            {f}
          </li>
        ))}
      </ul>

      <button
        onClick={onSubscribe}
        disabled={subscribing || isCurrentPlan}
        className={`mt-8 w-full py-3 rounded-lg text-sm font-bold transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-70 ${
          isCurrentPlan
            ? 'bg-lime/10 text-lime border border-lime/30 cursor-default'
            : plan.featured
              ? 'bg-lime text-black hover:bg-lime-dark'
              : 'border border-white/10 text-cream hover:border-white/25 hover:bg-white/5'
        }`}
      >
        {isCurrentPlan
          ? '✓ Current plan'
          : subscribing
            ? 'Opening checkout…'
            : 'Start free trial'}
      </button>
    </div>
  )
}
