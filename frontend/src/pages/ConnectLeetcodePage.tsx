import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError } from "../api/client";
import { LeetcodeAPI } from "../api/endpoints";
import { AnimatedBackground } from "../components/AnimatedBackground";
import { Logo, WordMark } from "../components/Logo";
import { Spinner } from "../components/Spinner";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export function ConnectLeetcodePage() {
  const { user, setUser, refresh } = useAuth();
  const nav = useNavigate();
  const { toast } = useToast();
  const [username, setUsername] = useState(user?.leetcode?.username ?? "");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const res = await LeetcodeAPI.connect(username.trim());

      // The backend returns the fully-hydrated user (with leetcode profile and
      // badges) — drop it directly into auth state so the dashboard renders
      // the connected profile on the very next paint, with no flash of
      // "not connected" UI. We still call refresh() as a belt-and-braces
      // guarantee in case anything else changed.
      setUser(res.user);
      refresh().catch(() => {});

      toast({
        tone: "success",
        title: "LeetCode connected",
        body: `Found ${res.totalSolved} solves for @${res.leetcodeUsername}.`,
      });
      nav("/app", { replace: true });
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Could not connect.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground variant="hero" />
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
        <div className="mb-8 flex items-center justify-center gap-2 animate-fade-up">
          <Logo className="h-8 w-8" />
          <WordMark className="text-2xl" />
        </div>
        <div
          className="card p-6 shadow-glow animate-fade-up"
          style={{ animationDelay: "80ms" }}
        >
          <h1 className="text-2xl font-bold">Connect your LeetCode</h1>
          <p className="mt-1 text-sm text-slate-400">
            Enter your public LeetCode username. We only use data that is
            already public — we never ask for your password.
          </p>
          <form onSubmit={submit} className="mt-5 space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">
                LeetCode username
              </label>
              <input
                className="input"
                required
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. alex or neetcode"
              />
            </div>
            {err && (
              <div className="rounded-lg border border-accent-rose/40 bg-accent-rose/10 px-3 py-2 text-sm text-accent-rose">
                {err}
              </div>
            )}
            <div className="flex gap-2">
              <button
                className="btn-primary btn-pulse flex-1 py-3"
                disabled={busy}
              >
                {busy ? <Spinner /> : "Connect"}
              </button>
              <button
                type="button"
                onClick={() => nav("/app")}
                className="btn-secondary"
              >
                Skip
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
