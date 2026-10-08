import { useEffect, useState } from "react";
import {
  NavLink,
  Outlet,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { getCurrentUser } from "../api/auth.api";
import UserMenu from "../components/layout/UserMenu";

function SidebarLink({ to, label, icon, end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
          isActive
            ? "bg-[#1D1F26] text-[#F2F3F5]"
            : "text-[#868C99] hover:text-[#F2F3F5] hover:bg-[#1D1F26]"
        }`
      }
    >
      <span aria-hidden="true">{icon}</span>
      {label}
    </NavLink>
  );
}

export default function DashboardLayout() {
  const [user, setUser] = useState(null);
  const [searchParams] = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const navigate = useNavigate();

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => {});
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    const term = q.trim();
    navigate(term ? `/?q=${encodeURIComponent(term)}` : "/");
  }

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
          <SidebarLink to="/" label="Home" icon="⌂" end />

          <div className="my-3 border-t border-[#2C2F38]" />

          {user && (
            <SidebarLink
              to={`/channel/${user.username}`}
              label="Your channel"
              icon="◉"
            />
          )}
          <SidebarLink to="/studio" label="Studio" icon="◐" />
        </nav>

        <div className="px-6 py-4 border-t border-[#2C2F38] text-xs text-[#868C99] truncate">
          Signed in as{" "}
          <span className="text-[#F2F3F5]">
            {user?.fullName ?? user?.username ?? "…"}
          </span>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-[#2C2F38] flex items-center justify-between gap-6 px-8">
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search"
              className="w-full bg-[#1D1F26] border border-[#2C2F38] rounded-full px-4 py-2 text-sm
                         text-[#F2F3F5] placeholder:text-[#868C99] focus:outline-none
                         focus:ring-2 focus:ring-[#2DD4BF] focus:border-transparent"
            />
          </form>
          <UserMenu user={user} />
        </header>

        <main className="flex-1 px-8 py-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
