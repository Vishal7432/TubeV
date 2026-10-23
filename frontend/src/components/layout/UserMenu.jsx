import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../../apis/Auth.api.js";
import Avatar from "../common/Avatar";

const menuLinks = [
  {
    label: "Your channel",
    icon: "◉",
    path: (user) => `/channel/${user.username}`,
  },
  { label: "Studio", icon: "◐", path: () => "/studio" },
  { label: "Upload video", icon: "+", path: () => "/upload" },
];

export default function UserMenu({ user }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);

    function handleEscape(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  async function handleLogout() {
    setOpen(false);
    try {
      await logout();
    } finally {
      navigate("/login");
    }
  }

  function closeMenu() {
    setOpen(false);
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Open account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="account-menu"
        className="h-9 w-9 rounded-full bg-[#1D1F26] border border-[#2C2F38] flex items-center justify-center overflow-hidden text-sm text-[#F2F3F5]"
      >
        <Avatar user={user} className="h-full w-full text-sm" />
      </button>

      {open && (
        <div
          id="account-menu"
          role="menu"
          className="absolute right-0 mt-3 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[#2C2F38] bg-[#1D1F26] shadow-2xl z-50"
        >
          <div className="flex items-center gap-4 px-6 py-5">
            <Avatar
              user={user}
              className="h-16 w-16 text-2xl bg-[#2DD4BF] text-[#14151A]"
            />
            <div className="min-w-0">
              <p className="truncate text-lg font-medium text-[#F2F3F5]">
                {user?.fullName ?? user?.username ?? "Your account"}
              </p>
              {user?.username && (
                <p className="truncate text-sm text-[#868C99]">
                  @{user.username}
                </p>
              )}
              {user?.username && (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    closeMenu();
                    navigate(`/channel/${user.username}`);
                  }}
                  className="mt-1 text-sm font-medium text-[#2DD4BF] hover:underline"
                >
                  View your channel
                </button>
              )}
            </div>
          </div>

          <nav
            aria-label="Account navigation"
            className="border-y border-[#2C2F38] px-3 py-3"
          >
            {menuLinks
              .filter((item) => item.label !== "Your channel" || user?.username)
              .map((item) => (
                <button
                  key={item.label}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    closeMenu();
                    navigate(item.path(user ?? {}));
                  }}
                  className="flex w-full items-center gap-4 rounded-lg px-4 py-3 text-left text-base text-[#F2F3F5] transition-colors hover:bg-[#24262F]"
                >
                  <span
                    className="w-5 text-center text-[#868C99]"
                    aria-hidden="true"
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              ))}
            <button
              type="button"
              role="menuitem"
              disabled
              title="Settings are not available yet"
              className="flex w-full cursor-not-allowed items-center gap-4 rounded-lg px-4 py-3 text-left text-base text-[#F2F3F5] opacity-50"
            >
              <span
                className="w-5 text-center text-[#868C99]"
                aria-hidden="true"
              >
                ⚙
              </span>
              Settings
            </button>
          </nav>

          <div className="p-3">
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="flex w-full items-center gap-4 rounded-lg px-4 py-3 text-left text-base text-[#FF4757] transition-colors hover:bg-[#24262F]"
            >
              <span className="w-5 text-center" aria-hidden="true">
                →
              </span>
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
