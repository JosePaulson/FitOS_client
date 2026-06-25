import { Link } from 'react-router-dom'

const FOOTER_COLS = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '/#features' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'How it works', href: '/#how' },
      { label: 'Request demo', href: '/contact' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About us', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy policy', href: '#' },
      { label: 'Terms of service', href: '#' },
      { label: 'Refund policy', href: '#' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.08] mt-auto">
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-14">
        {/* Top row */}
        <div className="flex flex-col md:flex-row justify-between gap-12 pb-10 border-b border-white/[0.08]">
          {/* Brand */}
          <div className="max-w-xs">
            <div className="text-xl font-black tracking-tight text-cream">
              Fit<span className="text-lime">OS</span>
            </div>
            <p className="text-muted text-sm mt-2 leading-relaxed">
              Gym management software built for Indian fitness businesses.
            </p>
          </div>

          {/* Link columns */}
          <div className="flex flex-wrap gap-12">
            {FOOTER_COLS.map((col) => (
              <div key={col.title}>
                <div className="text-xs font-bold uppercase tracking-widest text-muted mb-4">
                  {col.title}
                </div>
                <ul className="flex flex-col gap-3">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      {l.href.startsWith('#') || l.href.startsWith('/#') ? (
                        <a
                          href={l.href}
                          className="text-sm text-muted hover:text-cream transition-colors"
                        >
                          {l.label}
                        </a>
                      ) : (
                        <Link
                          to={l.href}
                          className="text-sm text-muted hover:text-cream transition-colors"
                        >
                          {l.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 pt-8 text-xs text-muted">
          <span>© {new Date().getFullYear()} FitOS. Made with ❤️ in India.</span>
          <span>All prices are GST-inclusive (18%).</span>
        </div>
      </div>
    </footer>
  )
}
