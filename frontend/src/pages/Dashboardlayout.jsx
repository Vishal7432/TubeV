import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { to: "/", label: "Overview", icon: "◐" },
  { to: "/videos", label: "Videos", icon: "▭" },
];

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-[#14151A] text-[#F2F3F5] flex">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 border-r border-[#2C2F38] flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-[#2C2F38]">
          <span className="font-display text-lg tracking-tight">
            Channel Studio
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? "bg-[#1D1F26] text-[#F2F3F5]"
                    : "text-[#868C99] hover:text-[#F2F3F5] hover:bg-[#1D1F26]"
                }`
              }
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-6 py-4 border-t border-[#2C2F38] text-xs text-[#868C99]">
          Signed in as <span className="text-[#F2F3F5]">Creator</span>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-[#2C2F38] flex items-center justify-between px-8">
          <div className="flex items-center gap-2 text-sm text-[#868C99]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF4757] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF4757]" />
            </span>
            Live data
          </div>
          <div className="h-9 w-9 rounded-full bg-[#1D1F26] border border-[#2C2F38]" />
        </header>

        <main className="flex-1 px-8 py-8 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
