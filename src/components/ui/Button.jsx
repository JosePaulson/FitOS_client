import { Link } from 'react-router-dom'

/**
 * Unified button / link component.
 * variant: 'primary' | 'ghost' | 'outline'
 * size:    'sm' | 'md' | 'lg'
 * to:      internal React Router path
 * href:    external / hash link
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  to,
  href,
  onClick,
  className = '',
  disabled = false,
  type = 'button',
}) {
  const base =
    'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-150 cursor-pointer select-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime/60 disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary: 'bg-lime text-black hover:bg-lime-dark hover:-translate-y-px active:translate-y-0',
    ghost:   'bg-transparent text-muted border border-white/10 hover:text-cream hover:border-white/20',
    outline: 'bg-transparent text-cream border border-white/20 hover:border-white/40',
  }

  const sizes = {
    sm: 'text-xs px-3.5 py-2',
    md: 'text-sm px-5 py-2.5',
    lg: 'text-base px-8 py-3.5',
  }

  const cls = `${base} ${variants[variant]} ${sizes[size]} ${className}`

  if (to) return <Link to={to} className={cls}>{children}</Link>
  if (href) return <a href={href} className={cls}>{children}</a>
  return (
    <button type={type} className={cls} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}
