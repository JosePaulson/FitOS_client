import { TESTIMONIALS } from '../../utils/data'

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 px-5 md:px-8 bg-ink">
      <div className="max-w-7xl mx-auto">
        <p className="eyebrow">What gym owners say</p>
        <h2 className="text-[clamp(30px,4vw,48px)] font-extrabold tracking-tight leading-[1.1] mb-16 reveal">
          Built for people who run gyms,<br className="hidden md:block" /> not for investors
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={t.name}
              className="bg-card border border-white/[0.08] rounded-xl p-7 reveal"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className="text-lime text-sm tracking-widest mb-4">★★★★★</div>
              <p className="text-[#ccc] text-sm leading-[1.75] mb-6">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-lime/15 border border-lime/30 flex items-center justify-center text-lime text-xs font-bold shrink-0">
                  {t.initials}
                </div>
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-muted">{t.gym}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
