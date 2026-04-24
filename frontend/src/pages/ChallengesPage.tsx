import { useCallback, useEffect, useState } from "react";
import { ChallengesAPI } from "../api/endpoints";
import { EmptyState } from "../components/EmptyState";
import { IconCheckCircle, IconTarget } from "../components/icons";
import { Spinner } from "../components/Spinner";
import { XpBar } from "../components/XpBar";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import type { WeeklyChallengeDTO } from "../types/api";

const DIFFICULTY_DOT: Record<string, string> = {
  SOLVE_EASY: "bg-accent-green shadow-[0_0_12px_rgba(34,197,94,0.6)]",
  SOLVE_MEDIUM: "bg-accent-amber shadow-[0_0_12px_rgba(251,191,36,0.55)]",
  SOLVE_HARD: "bg-accent-rose shadow-[0_0_12px_rgba(244,63,94,0.6)]",
};

export function ChallengesPage() {
  const { user, refresh } = useAuth();
  const { toast } = useToast();
  const [challenges, setChallenges] = useState<WeeklyChallengeDTO[]>([]);
  const [weekStart, setWeekStart] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ChallengesAPI.weekly();
      setChallenges(res.challenges);
      setWeekStart(res.weekStart);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const check = async () => {
    setChecking(true);
    try {
      const res = await ChallengesAPI.checkProgress();
      await Promise.all([refresh(), load()]);
      toast({
        tone: "success",
        title: res.challengesCompleted.length
          ? `Completed ${res.challengesCompleted.length} challenge${res.challengesCompleted.length > 1 ? "s" : ""}!`
          : res.solvedDelta.total > 0
          ? `+${res.solvedDelta.total} solves, +${res.xpGained} XP`
          : "No new progress yet",
        body: res.challengesCompleted.join(", ") || undefined,
      });
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Weekly challenges</h1>
          <p className="text-sm text-slate-400">
            {weekStart && (
              <>
                Week of{" "}
                <span className="font-mono">
                  {new Date(weekStart).toLocaleDateString()}
                </span>
                . Resets every Monday.
              </>
            )}
          </p>
        </div>
        <button
          onClick={check}
          className="btn-primary"
          disabled={checking || !user?.leetcode}
          title={!user?.leetcode ? "Connect LeetCode first" : ""}
        >
          {checking ? <Spinner /> : "↻ Check progress"}
        </button>
      </header>

      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner size={22} />
        </div>
      ) : challenges.length === 0 ? (
        <EmptyState
          icon={<IconTarget size={30} className="text-brand-300" />}
          title="No challenges this week"
          description="Check back on Monday for fresh missions."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {challenges.map((c) => (
            <article
              key={c.id}
              className={`card p-5 ${
                c.completed ? "border-accent-green/40 bg-accent-green/5" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-ink-700 bg-ink-900/60">
                    {c.completed ? (
                      <IconCheckCircle
                        size={22}
                        className="text-accent-green"
                      />
                    ) : DIFFICULTY_DOT[c.kind] ? (
                      <span
                        className={`h-3 w-3 rounded-full ${DIFFICULTY_DOT[c.kind]}`}
                      />
                    ) : (
                      <IconTarget size={20} className="text-brand-300" />
                    )}
                  </div>
                  <h2 className="mt-2 font-bold">{c.title}</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    {c.description}
                  </p>
                </div>
                <div className="text-right">
                  <div className="chip text-brand-400">+{c.xpReward} XP</div>
                </div>
              </div>
              <div className="mt-4">
                <XpBar ratio={c.ratio} />
                <div className="mt-1 flex justify-between text-xs text-slate-400">
                  <span>
                    {c.progress} / {c.target}
                  </span>
                  <span>{Math.round(c.ratio * 100)}%</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
