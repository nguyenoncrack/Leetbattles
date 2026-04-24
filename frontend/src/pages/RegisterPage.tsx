import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiError } from "../api/client";
import { GoogleSignInButton } from "../components/GoogleSignInButton";
import { Spinner } from "../components/Spinner";
import { useAuth } from "../context/AuthContext";
import { isFirebaseConfigured } from "../lib/firebase";
import { AuthShell } from "./LoginPage";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    username: "",
    displayName: "",
    password: "",
  });
  const [err, setErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setSubmitting(true);
    try {
      await register(form);
      navigate("/app/connect");
    } catch (e) {
      setErr(
        e instanceof ApiError ? e.message : "Could not register, try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Join CodeClash"
      sub="Create your account. Connect your LeetCode next."
    >
      {isFirebaseConfigured() && (
        <>
          <GoogleSignInButton />
          <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wider text-slate-500">
            <div className="h-px flex-1 bg-ink-700" />
            or with email
            <div className="h-px flex-1 bg-ink-700" />
          </div>
        </>
      )}
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">
              Display name
            </label>
            <input
              className="input"
              required
              value={form.displayName}
              onChange={set("displayName")}
              placeholder="Ada Lovelace"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">
              Username
            </label>
            <input
              className="input"
              required
              minLength={3}
              maxLength={24}
              pattern="[A-Za-z0-9_]+"
              value={form.username}
              onChange={set("username")}
              placeholder="ada"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-400">
            Email
          </label>
          <input
            className="input"
            required
            type="email"
            value={form.email}
            onChange={set("email")}
            placeholder="you@domain.com"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-400">
            Password
          </label>
          <input
            className="input"
            required
            type="password"
            minLength={8}
            value={form.password}
            onChange={set("password")}
            placeholder="8+ characters"
          />
        </div>
        {err && (
          <div className="rounded-lg border border-accent-rose/40 bg-accent-rose/10 px-3 py-2 text-sm text-accent-rose">
            {err}
          </div>
        )}
        <button
          className="btn-primary btn-pulse w-full py-3"
          disabled={submitting}
        >
          {submitting ? <Spinner /> : "Create account"}
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-slate-400">
        Already have an account?{" "}
        <Link to="/login" className="text-brand-400 hover:text-brand-300">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
