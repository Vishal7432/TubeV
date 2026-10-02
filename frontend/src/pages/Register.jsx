import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../apis/Auth.api.js";

const initialForm = { fullName: "", email: "", username: "", password: "" };

export default function Register() {
  const [form, setForm] = useState(initialForm);
  const [avatar, setAvatar] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!avatar) {
      setError("Avatar image is required.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) =>
        formData.append(key, value),
      );
      formData.append("avatar", avatar);
      if (coverImage) formData.append("coverImage", coverImage);

      await register(formData);
      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#14151A] text-[#F2F3F5] flex items-center justify-center px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm border border-[#2C2F38] rounded-lg p-8 space-y-4"
      >
        <div>
          <h1 className="font-display text-xl">Create your account</h1>
          <p className="text-sm text-[#868C99] mt-1">Join Channel Studio</p>
        </div>

        <Field
          label="Full name"
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
        />
        <Field
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
        />
        <Field
          label="Username"
          name="username"
          value={form.username}
          onChange={handleChange}
        />
        <Field
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
        />

        <FileField label="Avatar (required)" onChange={(f) => setAvatar(f)} />
        <FileField
          label="Cover image (optional)"
          onChange={(f) => setCoverImage(f)}
        />

        {error && <p className="text-xs text-[#FF4757]">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#2DD4BF] text-[#0B0C0F] text-sm font-medium rounded-md py-2
                     hover:bg-[#2DD4BF]/90 transition-colors disabled:opacity-50"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>

        <p className="text-xs text-[#868C99] text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-[#2DD4BF]">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}

function Field({ label, name, type = "text", value, onChange }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="text-xs text-[#868C99]">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required
        value={value}
        onChange={onChange}
        className="w-full bg-[#1D1F26] border border-[#2C2F38] rounded-md px-3 py-2 text-sm
                   focus:outline-none focus:ring-2 focus:ring-[#2DD4BF] focus:border-transparent"
      />
    </div>
  );
}

function FileField({ label, onChange }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs text-[#868C99]">{label}</label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        className="w-full text-xs text-[#868C99] file:mr-3 file:py-1.5 file:px-3 file:rounded-md
                   file:border file:border-[#2C2F38] file:bg-[#1D1F26] file:text-[#F2F3F5] file:text-xs"
      />
    </div>
  );
}
