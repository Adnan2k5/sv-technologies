export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-surface-tertiary flex items-center justify-center mb-4">
          <Icon size={24} className="text-text-muted" />
        </div>
      )}
      <p className="text-sm font-semibold text-text-primary">{title}</p>
      {description && <p className="text-sm text-text-muted mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
