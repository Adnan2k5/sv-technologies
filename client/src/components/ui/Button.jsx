import clsx from "clsx";

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  className = "",
  children,
  ...props
}) {
  const base = "inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-150 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed select-none";

  const variants = {
    primary: "bg-text-primary text-white hover:bg-accent-hover",
    ghost: "bg-transparent text-text-primary border border-border hover:bg-surface-secondary",
    danger: "bg-danger text-white hover:bg-red-700",
    success: "bg-success text-white hover:bg-green-700",
    soft: "bg-surface-tertiary text-text-primary hover:bg-border",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-5 py-3 text-sm",
  };

  return (
    <button
      className={clsx(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
      )}
      {children}
    </button>
  );
}
