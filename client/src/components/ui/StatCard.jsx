export default function StatCard({ label, value, sub, icon: Icon, iconColor = "text-text-muted", accent }) {
  return (
    <div className="card p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-text-muted uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-semibold text-text-primary mt-1 leading-none">{value}</p>
          {sub && <p className="text-xs text-text-muted mt-1.5">{sub}</p>}
        </div>
        {Icon && (
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent || "bg-surface-tertiary"}`}>
            <Icon size={18} className={iconColor} />
          </div>
        )}
      </div>
    </div>
  );
}
