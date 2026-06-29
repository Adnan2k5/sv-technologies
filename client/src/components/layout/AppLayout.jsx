import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";

export default function AppLayout() {
  return (
    <div className="flex min-h-dvh bg-surface-secondary">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 min-w-0 pb-20 sm:pb-0 sm:ml-60 lg:ml-64">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  );
}
