import clsx from "clsx";

export default function Badge({ variant = "default", className = "", children }) {
  const variants = {
    default: "bg-surface-tertiary text-text-secondary",
    credit: "bg-success-light text-success",
    debit: "bg-danger-light text-danger",
    transfer: "bg-info-light text-info",
    warning: "bg-warning-light text-warning",
    active: "bg-success-light text-success",
    completed: "bg-surface-tertiary text-text-muted",
    on_hold: "bg-warning-light text-warning",
  };

  return (
    <span className={clsx("inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium", variants[variant] || variants.default, className)}>
      {children}
    </span>
  );
}
