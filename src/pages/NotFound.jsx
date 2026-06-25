import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4 text-center">
      <div className="absolute inset-0 bg-grid-lime bg-grid opacity-40 pointer-events-none" />

      <div className="relative">
        <div className="text-[120px] font-black leading-none tracking-tighter text-lime/10 select-none">
          404
        </div>
        <div className="-mt-8">
          <h1 className="text-3xl font-black tracking-tight mb-3">Page not found</h1>
          <p className="text-muted text-base mb-8 max-w-sm mx-auto">
            This page doesn't exist — or it moved. Let's get you back on track.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              to="/"
              className="bg-lime text-black font-bold px-6 py-3 rounded-lg text-sm hover:bg-lime-dark transition-all"
            >
              ← Back to home
            </Link>
            <Link
              to="/dashboard"
              className="border border-white/10 text-muted px-6 py-3 rounded-lg text-sm hover:text-cream hover:border-white/20 transition-all"
            >
              Go to dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
