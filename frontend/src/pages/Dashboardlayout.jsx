import { useEffect, useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { getCurrentUser } from "../apis/Auth.api.js";
import UserMenu from "../components/layout/UserMenu";

function SidebarLink({ to, label, icon, end = false, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `flex w-auto shrink-0 items-center gap-3 whitespace-nowrap px-3 py-2 rounded-md text-sm transition-colors md:w-full md:shrink md:whitespace-normal ${
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!mobileNavOpen) return;
    function closeOnEscape(e) {
      if (e.key === "Escape") setMobileNavOpen(false);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [mobileNavOpen]);

  function handleSearch(e) {
    e.preventDefault();
    const term = q.trim();
    navigate(term ? `/?q=${encodeURIComponent(term)}` : "/");
  }

  return (
    <div className="flex h-dvh min-h-0 overflow-hidden bg-[#14151A] text-[#F2F3F5]">
      {/* Sidebar */}
      <aside className="hidden h-full w-60 shrink-0 border-r border-[#2C2F38] md:flex md:flex-col">
        <div className="h-16 flex items-center px-6 border-b border-[#2C2F38]">
          <Link to="/">
            <span className="font-display text-lg tracking-tight">TubeV</span>
          </Link>
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
      <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
        <header className="shrink-0 flex flex-wrap items-center justify-between gap-3 border-b border-[#2C2F38] px-4 py-3 md:h-16 md:flex-nowrap md:gap-6 md:px-8 md:py-0">
          <Link
            to="/"
            className="font-display text-base tracking-tight md:hidden"
          >
            TubeV
          </Link>
          <div className="order-3 flex w-full items-center gap-2 md:order-1 md:max-w-md md:flex-1">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={mobileNavOpen}
              aria-controls="mobile-navigation"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#2C2F38] text-lg text-[#F2F3F5] transition-colors hover:bg-[#1D1F26] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2DD4BF] md:hidden"
            >
              <span aria-hidden="true">☰</span>
            </button>
            <form
              onSubmit={handleSearch}
              className="w-full md:max-w-md md:flex-1"
            >
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search"
                aria-label="Search videos"
                className="w-full bg-[#1D1F26] border border-[#2C2F38] rounded-full px-4 py-2 text-sm
                           text-[#F2F3F5] placeholder:text-[#868C99] focus:outline-none
                           focus:ring-2 focus:ring-[#2DD4BF] focus:border-transparent"
              />
            </form>
          </div>
          <div className="order-2 ml-auto flex items-center gap-3 md:ml-0 md:gap-4">
            <Link
              to="/upload"
              className="flex items-center gap-1.5 bg-[#1D1F26] border border-[#2C2F38] hover:border-[#2DD4BF]/50
                         rounded-full px-4 py-2 text-sm transition-colors"
            >
              <span aria-hidden="true">+</span> Create
            </Link>
            <UserMenu user={user} />
          </div>
        </header>

        <main className="scrollbar-hidden mx-auto w-full max-w-7xl min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6 md:px-8 md:py-6">
          <Outlet />
        </main>
      </div>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setMobileNavOpen(false)}
            className="absolute inset-0 h-full w-full bg-black/60"
          />
          <aside
            id="mobile-navigation"
            aria-label="Mobile navigation"
            className="relative flex h-full w-[min(18rem,85vw)] flex-col border-r border-[#2C2F38] bg-[#14151A] shadow-2xl"
          >
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#2C2F38] px-5">
              <Link
                to="/"
                onClick={() => setMobileNavOpen(false)}
                className="font-display text-lg tracking-tight"
              >
                TubeV
              </Link>
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                aria-label="Close navigation menu"
                className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-[#868C99] hover:bg-[#1D1F26] hover:text-[#F2F3F5]"
              >
                ×
              </button>
            </div>
            <nav className="flex-1 space-y-1 px-3 py-4">
              <SidebarLink
                to="/"
                label="Home"
                icon="⌂"
                end
                onClick={() => setMobileNavOpen(false)}
              />
              {user && (
                <SidebarLink
                  to={`/channel/${user.username}`}
                  label="Your channel"
                  icon="◉"
                  onClick={() => setMobileNavOpen(false)}
                />
              )}
              <SidebarLink
                to="/studio"
                label="Studio"
                icon="◐"
                onClick={() => setMobileNavOpen(false)}
              />
            </nav>
            <div className="shrink-0 border-t border-[#2C2F38] px-5 py-4 text-xs text-[#868C99]">
              Signed in as{" "}
              <span className="text-[#F2F3F5]">
                {user?.fullName ?? user?.username ?? "…"}
              </span>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
