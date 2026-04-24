import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { isFirebaseConfigured } from "../lib/firebase";
import { Spinner } from "./Spinner";

export function GoogleSignInButton({ redirectTo = "/app" }: { redirectTo?: string }) {
  const { loginWithGoogle } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  if (!isFirebaseConfigured()) return null;

  const onClick = async () => {
    setBusy(true);
    try {
      const { created } = await loginWithGoogle();
      navigate(created ? "/app/connect" : redirectTo);
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : "Google sign-in failed.";
      if (!/popup-closed-by-user|cancelled-popup-request/i.test(msg)) {
        toast({ tone: "error", title: "Google sign-in failed", body: msg });
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl border border-ink-600 bg-white py-3 text-sm font-semibold text-ink-950 shadow-sm transition-all hover:border-brand-400 hover:shadow-glow disabled:opacity-60"
    >
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-brand-400/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      {busy ? (
        <Spinner />
      ) : (
        <>
          <GoogleIcon />
          <span>Continue with Google</span>
        </>
      )}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-4 w-4" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.5-5.9 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 3l5.7-5.7C33.6 6.1 29 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.1l6.6 4.8C14.7 15.3 19 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C33.6 6.1 29 4 24 4 16.3 4 9.7 8.3 6.3 14.1z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5 0 9.5-1.9 13-5l-6-5.1c-2 1.4-4.4 2.1-7 2.1-5.4 0-9.6-3.5-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4-4.1 5.3l6 5.1C40.9 36.2 44 30.9 44 24c0-1.2-.1-2.3-.4-3.5z"
      />
    </svg>
  );
}
