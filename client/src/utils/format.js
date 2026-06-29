import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from "date-fns";

/**
 * Format a number as Indian Rupees
 * e.g. 1234567.89 → ₹12,34,567.89
 */
export const formatCurrency = (amount, compact = false) => {
  const num = Number(amount) || 0;
  if (compact && num >= 1_00_000) {
    return `₹${(num / 1_00_000).toFixed(1)}L`;
  }
  if (compact && num >= 1_000) {
    return `₹${(num / 1_000).toFixed(1)}K`;
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(num);
};

/**
 * Format a date for display
 * Today → "Today at 3:45 PM"
 * Yesterday → "Yesterday at …"
 * This year → "Jun 25"
 * Older → "Jun 25, 2024"
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = typeof dateStr === "string" ? parseISO(dateStr) : new Date(dateStr);
  if (isToday(date)) return `Today · ${format(date, "h:mm a")}`;
  if (isYesterday(date)) return `Yesterday · ${format(date, "h:mm a")}`;
  if (date.getFullYear() === new Date().getFullYear()) return format(date, "MMM d");
  return format(date, "MMM d, yyyy");
};

export const formatShortDate = (dateStr) => {
  if (!dateStr) return "";
  const date = typeof dateStr === "string" ? parseISO(dateStr) : new Date(dateStr);
  return format(date, "d MMM yy");
};

export const formatRelative = (dateStr) => {
  if (!dateStr) return "";
  const date = typeof dateStr === "string" ? parseISO(dateStr) : new Date(dateStr);
  return formatDistanceToNow(date, { addSuffix: true });
};

/**
 * Returns a string for month labels in charts
 */
export const formatChartMonth = ({ year, month }) => {
  return format(new Date(year, month - 1, 1), "MMM");
};

/**
 * Returns colour for a transaction type badge
 */
export const txTypeLabel = (type) => {
  switch (type) {
    case "credit": return { label: "Credit", cls: "badge-credit" };
    case "debit": return { label: "Debit", cls: "badge-debit" };
    case "project_transfer": return { label: "To Project", cls: "badge-transfer" };
    case "project_return": return { label: "From Project", cls: "badge-credit" };
    default: return { label: type, cls: "badge" };
  }
};

/**
 * Get initials from a name string
 */
export const getInitials = (name = "") =>
  name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
