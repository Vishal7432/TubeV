import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getCurrentUser } from "../../apis/Auth.api.js";

export default function ProtectedRoute() {
  const [status, setStatus] = useState("checking"); // "checking" | "authed" | "guest"

  useEffect(() => {
    let cancelled = false;
    getCurrentUser()
      .then(() => !cancelled && setStatus("authed"))
      .catch(() => !cancelled && setStatus("guest"));
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "checking") {
    return (
      <div className="min-h-screen bg-[#14151A] flex items-center justify-center text-sm text-[#868C99]">
        Checking session…
      </div>
    );
  }

  return status === "authed" ? <Outlet /> : <Navigate to="/login" replace />;
}
