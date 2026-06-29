import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, ArrowLeftRight, FolderOpen, LogOut, HardHat } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { formatCurrency, getInitials } from "../../utils/format";
import clsx from "clsx";

const NAV = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/transactions", icon: ArrowLeftRight, label: "Transactions" },
  { to: "/projects", icon: FolderOpen, label: "Projects" },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <aside className="hidden sm:flex flex-col fixed left-0 top-0 h-full w-60 lg:w-64 bg-surface border-r border-border z-40">
      {/* Brand */}
      <div className="px-6 py-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-text-primary flex items-center justify-center">
            <HardHat size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary leading-none">SiteVault</p>
            <p className="text-[10px] text-text-muted mt-0.5">Construction Manager</p>
          </div>
        </div>
      </div>

      {/* Balance summary */}
      {user && (
        <div className="px-6 py-4 border-b border-border">
          <p className="text-[11px] text-text-muted font-medium uppercase tracking-wider mb-1">Total Balance</p>
          <p className="text-xl font-semibold text-text-primary">{formatCurrency(user.balance)}</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-surface-tertiary text-text-primary"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-secondary"
              )
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="px-3 pb-4 border-t border-border pt-4 space-y-1">
        {user && (
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-surface-tertiary flex items-center justify-center text-xs font-semibold text-text-primary">
              {getInitials(user.name || user.email)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{user.name || "Owner"}</p>
              <p className="text-[11px] text-text-muted truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:text-danger hover:bg-danger-light transition-all duration-150"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
