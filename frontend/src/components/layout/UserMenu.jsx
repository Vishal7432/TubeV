import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../../apis/Auth.api.js";

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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    try {
      await logout();
    } finally {
      navigate("/login");
    }
  }

  const initial =
    user?.fullName?.[0]?.toUpperCase() ??
    user?.username?.[0]?.toUpperCase() ??
    "?";

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="h-9 w-9 rounded-full bg-[#1D1F26] border border-[#2C2F38] flex items-center justify-center overflow-hidden text-sm text-[#F2F3F5]"
      >
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          initial
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-[#1D1F26] border border-[#2C2F38] rounded-md shadow-lg py-1 z-10">
          <div className="px-3 py-2 border-b border-[#2C2F38]">
            <p className="text-sm text-[#F2F3F5] truncate">
              {user?.fullName ?? user?.username}
            </p>
            <p className="text-xs text-[#868C99] truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 text-sm text-[#FF4757] hover:bg-[#24262F] transition-colors"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
