import { STEPS } from '../../utils/data'

export default function HowItWorks() {
  return (
    <section id="how" className="py-24 px-5 md:px-8 bg-ink">
      <div className="max-w-7xl mx-auto">
        <p className="eyebrow">How it works</p>
        <h2 className="text-[clamp(30px,4vw,48px)] font-extrabold tracking-tight leading-[1.1] mb-4 reveal">
          Up and running in a day
        </h2>
        <p className="text-muted text-lg max-w-lg leading-relaxed mb-16 reveal">
          We migrate your existing member data for you. You don't have to start from zero.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {STEPS.map((step, i) => (
            <div key={step.num} className="reveal" style={{ transitionDelay: `${i * 80}ms` }}>
              {/* Big faded number as visual anchor */}
              <div className="text-[64px] font-black leading-none tracking-tighter text-lime/10 mb-1 select-none">
                {step.num}
              </div>
              <h3 className="font-bold text-lg mb-2">{step.title}</h3>
              <p className="text-muted text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
