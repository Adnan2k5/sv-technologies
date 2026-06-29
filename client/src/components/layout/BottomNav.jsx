import { NavLink } from "react-router-dom";
import { LayoutDashboard, ArrowLeftRight, FolderOpen } from "lucide-react";
import clsx from "clsx";

const NAV = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/transactions", icon: ArrowLeftRight, label: "Ledger" },
  { to: "/projects", icon: FolderOpen, label: "Projects" },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-border sm:hidden">
      <div className="flex items-center justify-around h-16 px-2 pb-safe">
        {NAV.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              clsx(
                "flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all duration-150 flex-1",
                isActive ? "text-text-primary" : "text-text-muted"
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className={clsx("p-1.5 rounded-xl transition-all duration-150", isActive && "bg-surface-tertiary")}>
                  <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
                </div>
                <span className="text-[10px] font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
