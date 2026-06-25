import { FEATURES } from '../../utils/data'

export default function Features() {
  return (
    <section id="features" className="py-24 px-5 md:px-8">
      <div className="max-w-7xl mx-auto">
        <p className="eyebrow">Everything you need</p>
        <h2 className="text-[clamp(30px,4vw,48px)] font-extrabold tracking-tight leading-[1.1] mb-4 reveal">
          One platform.<br />Every gym operation.
        </h2>
        <p className="text-muted text-lg max-w-lg leading-relaxed mb-14 reveal">
          From the first lead enquiry to membership renewal — FitOS connects
          every part of your gym business.
        </p>

        {/* 3-col grid with hairline borders between cells */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.08] border border-white/[0.08] rounded-xl overflow-hidden">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="bg-black hover:bg-card transition-colors duration-200 p-8 reveal"
            >
              <div className="w-11 h-11 rounded-xl bg-lime/10 border border-lime/20 flex items-center justify-center text-xl mb-5">
                {f.icon}
              </div>
              <h3 className="font-bold text-base mb-2">{f.title}</h3>
              <p className="text-muted text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
