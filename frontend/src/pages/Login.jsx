import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../apis/Auth.api.js";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login({ email, password });
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Check your email and password.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#14151A] text-[#F2F3F5] flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm border border-[#2C2F38] rounded-lg p-8 space-y-5"
      >
        <div>
          <h1 className="font-display text-xl">Channel Studio</h1>
          <p className="text-sm text-[#868C99] mt-1">
            Sign in to view your dashboard
          </p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-xs text-[#868C99]">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#1D1F26] border border-[#2C2F38] rounded-md px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-[#2DD4BF] focus:border-transparent"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-xs text-[#868C99]">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#1D1F26] border border-[#2C2F38] rounded-md px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-[#2DD4BF] focus:border-transparent"
          />
        </div>

        {error && <p className="text-xs text-[#FF4757]">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#2DD4BF] text-[#0B0C0F] text-sm font-medium rounded-md py-2
                     hover:bg-[#2DD4BF]/90 transition-colors disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>

        <p className="text-xs text-[#868C99] text-center">
          New here?{" "}
          <Link to="/register" className="text-[#2DD4BF]">
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
}
