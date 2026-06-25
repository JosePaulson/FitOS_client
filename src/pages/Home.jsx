import { useEffect } from 'react'
import { useScrollReveal } from '../hooks/useScrollReveal'
import Hero from '../components/sections/Hero'
import Features from '../components/sections/Features'
import HowItWorks from '../components/sections/HowItWorks'
import Testimonials from '../components/sections/Testimonials'
import { Link } from 'react-router-dom'

export default function Home() {
  useScrollReveal()

  // Scroll to hash on load (e.g. /#features from nav)
  useEffect(() => {
    if (window.location.hash) {
      const el = document.querySelector(window.location.hash)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonials />

      {/* CTA band */}
      <section className="py-24 px-5 md:px-8 bg-black">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-[clamp(30px,4vw,48px)] font-extrabold tracking-tight leading-[1.1] mb-5 reveal">
            Ready to simplify your gym?
          </h2>
          <p className="text-muted text-lg mb-10 reveal">
            7-day free trial. No credit card. We handle your data migration.
          </p>
          <div className="flex flex-wrap gap-4 justify-center reveal">
            <Link
              to="/pricing"
              className="bg-lime text-black font-bold text-base px-8 py-4 rounded-xl hover:bg-lime-dark hover:-translate-y-px transition-all"
            >
              View pricing →
            </Link>
            <Link
              to="/contact"
              className="text-base text-muted border border-white/10 px-8 py-4 rounded-xl hover:text-cream hover:border-white/20 transition-all"
            >
              Talk to us first
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
