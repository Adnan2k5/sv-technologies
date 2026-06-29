import clsx from "clsx";

export default function Input({ label, error, className = "", ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="label">{label}</label>}
      <input
        className={clsx(
          "input",
          error && "border-danger focus:ring-danger/10 focus:border-danger",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

export function Select({ label, error, className = "", children, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="label">{label}</label>}
      <select
        className={clsx(
          "input appearance-none",
          error && "border-danger",
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, className = "", ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="label">{label}</label>}
      <textarea
        rows={3}
        className={clsx("input resize-none", error && "border-danger", className)}
        {...props}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
