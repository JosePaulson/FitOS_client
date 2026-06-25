import { Link } from 'react-router-dom'
import { useCounter } from '../../hooks/useCounter'
import { STATS } from '../../utils/data'

function StatCounter({ stat }) {
  const { count, ref } = useCounter(stat.target, 1600)
  return (
    <div ref={ref}>
      <div className="text-3xl font-black tracking-tight">
        <span className="text-lime">{stat.prefix}</span>
        {count}
        <span className="text-lime">{stat.suffix}</span>
      </div>
      <div className="text-xs text-muted mt-1">{stat.label}</div>
    </div>
  )
}

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex flex-col justify-center px-5 md:px-8 pt-32 pb-20 overflow-hidden"
    >
      {/* Grid background */}
      <div
        className="absolute inset-0 -z-10 bg-grid-lime bg-grid"
        aria-hidden="true"
      />
      {/* Glow blob */}
      <div
        className="absolute -top-52 -right-52 w-[700px] h-[700px] rounded-full -z-10"
        style={{
          background: 'radial-gradient(circle, rgba(200,241,53,0.07) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto w-full">
        {/* Eyebrow */}
        <div className="pill w-fit mb-7">
          <span
            className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse-dot"
            aria-hidden="true"
          />
          Gym management software
        </div>

        {/* Headline */}
        <h1 className="text-[clamp(44px,7vw,86px)] font-black leading-[1.0] tracking-[-0.04em] mb-6 max-w-3xl">
          Run your gym.
          <br />
          <span className="text-lime">Not spreadsheets.</span>
        </h1>

        {/* Subheading */}
        <p className="text-lg text-muted max-w-lg leading-relaxed mb-10">
          FitOS handles memberships, billing, lead follow-ups, and member
          engagement — so you can focus on building a gym people love.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap gap-4">
          <Link
            to="/pricing"
            className="inline-flex items-center gap-2 bg-lime text-black font-bold text-base px-8 py-4 rounded-xl hover:bg-lime-dark hover:-translate-y-px transition-all"
          >
            Start 7-day free trial
          </Link>
          <a
            href="#features"
            className="inline-flex items-center gap-2 text-base text-muted border border-white/10 px-8 py-4 rounded-xl hover:text-cream hover:border-white/20 transition-all"
          >
            See how it works
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 pt-10 border-t border-white/[0.08]">
          {STATS.map((s) => (
            <StatCounter key={s.id} stat={s} />
          ))}
        </div>
      </div>
    </section>
  )
}
