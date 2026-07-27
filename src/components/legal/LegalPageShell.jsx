import { Link } from 'react-router-dom'

/**
 * Shared shell for the legal/policy pages, rendered inside PublicLayout
 * (Navbar + Footer already provide the site chrome) — this just supplies
 * the prose container, title, and cross-links between the four policies.
 */
export default function LegalPageShell({ title, updated, children }) {
  return (
    <div className="px-5 pt-24 pb-20 mx-auto max-w-3xl md:px-8">
      <h1 className="text-3xl font-black tracking-tight md:text-4xl text-cream">{title}</h1>
      {updated && <p className="mt-3 text-sm text-muted">Last updated: {updated}</p>}

      <div className="flex flex-col gap-6 mt-10 legal-prose">
        {children}
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-2 pt-10 mt-14 text-sm border-t border-white/10">
        <Link to="/terms" className="underline text-muted hover:text-cream">Terms & Conditions</Link>
        <Link to="/privacy" className="underline text-muted hover:text-cream">Privacy Policy</Link>
        <Link to="/refund-policy" className="underline text-muted hover:text-cream">Refund Policy</Link>
        <Link to="/cookie-policy" className="underline text-muted hover:text-cream">Cookie Policy</Link>
      </div>
    </div>
  )
}

export function H2({ children }) {
  return <h2 className="mt-2 text-xl font-bold text-cream">{children}</h2>
}

export function P({ children }) {
  return <p className="text-sm leading-relaxed text-muted">{children}</p>
}

export function Ul({ children }) {
  return <ul className="flex flex-col gap-2 pl-5 text-sm leading-relaxed list-disc text-muted">{children}</ul>
}
