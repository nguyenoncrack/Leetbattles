import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError } from "../api/client";
import { AuthAPI } from "../api/endpoints";
import { AnimatedBackground } from "../components/AnimatedBackground";
import { Avatar } from "../components/Avatar";
import { CursorSpotlight } from "../components/CursorSpotlight";
import { IconCheck, IconSparkle } from "../components/icons";
import { Logo, WordMark } from "../components/Logo";
import { Spinner } from "../components/Spinner";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

// Shown to first-time Google sign-up users so they can pick their own
// username and display name instead of keeping the slug auto-derived from
// their Google email. Non-Google users hit this page only if they
// explicitly navigate to it; `/app` itself is gated behind an onboarding
// check via `ProtectedRoute`.
export function OnboardingPage() {
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const nav = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Pre-fill with whatever we got from Google / the existing profile.
  useEffect(() => {
    if (!user) return;
    setDisplayName((prev) => prev || user.displayName || "");
    setUsername((prev) => prev || user.username || "");
  }, [user]);

  if (!user) return null;

  const trimmedDisplay = displayName.trim();
  const trimmedUser = username.trim().toLowerCase();
  const usernameValid = /^[a-z0-9_]{3,24}$/.test(trimmedUser);
  const displayValid = trimmedDisplay.length >= 1 && trimmedDisplay.length <= 48;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!displayValid) {
      setErr("Display name must be 1-48 characters.");
      return;
    }
    if (!usernameValid) {
      setErr(
        "Username must be 3-24 characters (letters, numbers and underscores only)."
      );
      return;
    }
    setSubmitting(true);
    try {
      const res = await AuthAPI.updateProfile({
        username: trimmedUser,
        displayName: trimmedDisplay,
      });
      setUser(res.user);
      toast({
        tone: "success",
        title: "Profile saved",
        body: `Welcome, @${res.user.username}!`,
      });
      nav("/app/connect", { replace: true });
    } catch (e) {
      setErr(
        e instanceof ApiError ? e.message : "Could not save profile, try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const skip = () => nav("/app/connect", { replace: true });

  return (
    <div className="relative min-h-screen overflow-hidden">
      <AnimatedBackground variant="hero" glyphs={false} />
      <CursorSpotlight size={320} />
      <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-10">
        <div className="mb-6 flex items-center justify-center gap-2 animate-fade-up">
          <Logo className="h-8 w-8 glow-breathe" />
          <WordMark className="text-2xl" />
        </div>

        <div
          className="card p-7 shadow-glow animate-fade-up"
          style={{ animationDelay: "80ms" }}
        >
          <div className="flex items-center gap-4">
            <Avatar url={user.avatarUrl} name={trimmedDisplay || user.displayName} size={68} />
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs text-brand-300">
                <IconSparkle size={14} />
                <span className="uppercase tracking-wider">One last thing</span>
              </div>
              <h1 className="mt-0.5 text-2xl font-bold text-white">
                Claim your handle
              </h1>
              <p className="text-sm text-slate-400">
                This is what friends and rivals will see on leaderboards.
              </p>
            </div>
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">
                Display name
              </label>
              <input
                className="input"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Nguyen"
                maxLength={48}
                autoFocus
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">
                Username
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-slate-500">
                  @
                </span>
                <input
                  className="input pl-8 font-mono"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value.replace(/\s+/g, ""))
                  }
                  placeholder="nguyenoncrack"
                  maxLength={24}
                  autoComplete="off"
                />
                {usernameValid && trimmedUser !== user.username && (
                  <IconCheck
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-accent-green"
                  />
                )}
              </div>
              <p className="mt-1 text-xs text-slate-500">
                3-24 chars. Letters, numbers, underscores.
              </p>
            </div>

            {err && (
              <div className="rounded-lg border border-accent-rose/40 bg-accent-rose/10 px-3 py-2 text-sm text-accent-rose">
                {err}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !displayValid || !usernameValid}
              className="btn-primary btn-pulse w-full py-3"
            >
              {submitting ? <Spinner /> : "Continue"}
            </button>

            <button
              type="button"
              onClick={skip}
              className="w-full text-center text-xs text-slate-500 hover:text-slate-300"
            >
              Keep the auto-generated handle ({user.username}) →
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
