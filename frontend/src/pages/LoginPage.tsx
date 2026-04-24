import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ApiError } from "../api/client";
import { AnimatedBackground } from "../components/AnimatedBackground";
import { CursorSpotlight } from "../components/CursorSpotlight";
import { GoogleSignInButton } from "../components/GoogleSignInButton";
import { Logo, WordMark } from "../components/Logo";
import { Spinner } from "../components/Spinner";
import { useAuth } from "../context/AuthContext";
import { isFirebaseConfigured } from "../lib/firebase";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [emailOrUsername, setE] = useState("");
  const [password, setP] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setSubmitting(true);
    try {
      await login(emailOrUsername, password);
      const from =
        (location.state as { from?: string } | null)?.from ?? "/app";
      navigate(from);
    } catch (e) {
      setErr(
        e instanceof ApiError ? e.message : "Could not sign in, try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell title="Welcome back" sub="Sign in to continue your grind.">
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
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-400">
            Email or username
          </label>
          <input
            className="input"
            required
            autoFocus
            value={emailOrUsername}
            onChange={(e) => setE(e.target.value)}
            placeholder="you@domain.com"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-400">
            Password
          </label>
          <input
            className="input"
            type="password"
            required
            value={password}
            onChange={(e) => setP(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        {err && (
          <div className="rounded-lg border border-accent-rose/40 bg-accent-rose/10 px-3 py-2 text-sm text-accent-rose">
            {err}
          </div>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary btn-pulse w-full py-3"
        >
          {submitting ? <Spinner /> : "Sign in"}
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-slate-400">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="text-brand-400 hover:text-brand-300">
          Create one
        </Link>
      </p>
    </AuthShell>
  );
}

export function AuthShell({
  children,
  title,
  sub,
}: {
  children: React.ReactNode;
  title: string;
  sub?: string;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <AnimatedBackground variant="hero" />
      <CursorSpotlight size={320} />
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
        <Link
          to="/"
          className="mb-8 flex items-center justify-center gap-2 animate-fade-up"
        >
          <Logo className="h-8 w-8" />
          <WordMark className="text-2xl" />
        </Link>
        <div
          className="card p-6 shadow-glow animate-fade-up"
          style={{ animationDelay: "80ms" }}
        >
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          {sub && <p className="mt-1 text-sm text-slate-400">{sub}</p>}
          <div className="mt-6">{children}</div>
        </div>
        <Link
          to="/"
          className="mt-4 text-center text-xs text-slate-500 hover:text-slate-300"
        >
          ← Back to landing
        </Link>
      </div>
    </div>
  );
}
