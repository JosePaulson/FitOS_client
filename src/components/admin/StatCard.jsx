export default function StatCard({ icon, label, value, sub, accent = false, loading = false }) {
  return (
    <div className={`rounded-xl border p-5 flex flex-col gap-2 ${
      accent
        ? 'bg-lime/5 border-lime/20'
        : 'bg-card border-white/[0.08]'
    }`}>
      <div className="flex items-center justify-between">
        <span className="text-muted text-xs font-medium uppercase tracking-wider">{label}</span>
        <span className="text-xl">{icon}</span>
      </div>
      {loading ? (
        <div className="h-8 w-24 bg-white/[0.06] rounded animate-pulse" />
      ) : (
        <div className={`text-3xl font-black tracking-tight ${accent ? 'text-lime' : 'text-cream'}`}>
          {value}
        </div>
      )}
      {sub && <p className="text-xs text-muted">{sub}</p>}
    </div>
  )
}
