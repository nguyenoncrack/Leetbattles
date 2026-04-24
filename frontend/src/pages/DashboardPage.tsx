import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../api/client";
import {
  ActivityAPI,
  ChallengesAPI,
  LeaderboardAPI,
  LeetcodeAPI,
} from "../api/endpoints";
import { AmbientXpWisps } from "../components/AmbientXpWisps";
import { AnimatedNumber } from "../components/AnimatedNumber";
import { Avatar } from "../components/Avatar";
import { BadgePill } from "../components/Badge";
import { EmptyState } from "../components/EmptyState";
import {
  IconBolt,
  IconCheckCircle,
  IconFlame,
  IconMedal,
  IconPlug,
  IconPulse,
  IconStar,
  IconTarget,
} from "../components/icons";
import { RankIcon } from "../components/RankIcon";
import { Spinner } from "../components/Spinner";
import { XpBar } from "../components/XpBar";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { fmt, timeAgo } from "../lib/format";
import type {
  ActivityEventDTO,
  LeaderboardRow,
  WeeklyChallengeDTO,
} from "../types/api";

export function DashboardPage() {
  const { user, refresh } = useAuth();
  const { toast } = useToast();
  const [friendsBoard, setFriendsBoard] = useState<LeaderboardRow[]>([]);
  const [challenges, setChallenges] = useState<WeeklyChallengeDTO[]>([]);
  const [activity, setActivity] = useState<ActivityEventDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [fb, ch, ac] = await Promise.all([
        LeaderboardAPI.friends().catch(() => ({ board: [] })),
        ChallengesAPI.weekly(),
        ActivityAPI.feed(undefined, 8),
      ]);
      setFriendsBoard(fb.board);
      setChallenges(ch.challenges);
      setActivity(ac.events);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (!user) return null;

  const sync = async () => {
    if (!user.leetcode) return;
    setSyncing(true);
    try {
      const result = await LeetcodeAPI.sync(true);
      await Promise.all([refresh(), load()]);
      const bits: string[] = [];
      if (result.solvedDelta.total > 0)
        bits.push(`+${result.solvedDelta.total} solved`);
      if (result.xpGained > 0) bits.push(`+${result.xpGained} XP`);
      if (result.leveledUp) bits.push(`Level ${result.newLevel}`);
      if (result.passedRival)
        bits.push(`Passed @${result.passedRival.username}`);
      toast({
        tone: "success",
        title: bits.length ? "Synced!" : "Already up to date",
        body: bits.join(" · ") || "No new solves since last sync.",
      });
    } catch (e) {
      toast({
        tone: "error",
        title: "Sync failed",
        body: e instanceof ApiError ? e.message : "Try again in a moment.",
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="relative space-y-6">
      {/* Ambient drifting XP wisps — runs idle in the background. */}
      <AmbientXpWisps max={3} />

      <ProfileCard />

      {!user.leetcode ? (
        <EmptyState
          icon={<IconPlug size={30} className="text-brand-300" />}
          title="Connect your LeetCode to start earning XP"
          description="We only read your public profile — no passwords needed."
          action={
            <Link to="/app/connect" className="btn-primary">
              Connect LeetCode
            </Link>
          }
        />
      ) : (
        <div className="stagger grid gap-4 md:grid-cols-4">
          <StatCard
            label="Total solved"
            value={user.leetcode.totalSolved}
            tone="text-white"
            accent="from-brand-500/30 to-accent-cyan/20"
          />
          <StatCard
            label="Easy"
            value={user.leetcode.easySolved}
            tone="text-accent-green"
            accent="from-emerald-500/25 to-teal-500/10"
          />
          <StatCard
            label="Medium"
            value={user.leetcode.mediumSolved}
            tone="text-accent-amber"
            accent="from-amber-500/25 to-orange-500/10"
          />
          <StatCard
            label="Hard"
            value={user.leetcode.hardSolved}
            tone="text-accent-rose"
            accent="from-rose-500/25 to-fuchsia-500/10"
          />
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          {user.leetcode ? (
            <>
              <span className="pulse-live" aria-hidden />
              <span>
                LeetCode:{" "}
                <span className="font-mono text-slate-200">
                  @{user.leetcode.username}
                </span>
                {user.leetcode.lastSyncedAt && (
                  <> · synced {timeAgo(user.leetcode.lastSyncedAt)}</>
                )}
              </span>
            </>
          ) : (
            <>
              <span className="pulse-dot" aria-hidden />
              <span>No LeetCode profile connected yet</span>
            </>
          )}
        </div>
        {user.leetcode && (
          <button
            onClick={sync}
            className="btn-primary btn-pulse group"
            disabled={syncing}
          >
            {syncing ? (
              <Spinner />
            ) : (
              <>
                <span className="inline-block transition-transform duration-500 group-hover:rotate-180">
                  ↻
                </span>
                Sync now
              </>
            )}
          </button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2 space-y-6">
          <ChallengeList challenges={challenges} loading={loading} />
          <ActivityList events={activity} loading={loading} />
        </section>
        <aside className="space-y-6">
          <FriendsMini rows={friendsBoard} loading={loading} />
          <BadgesCard />
        </aside>
      </div>
    </div>
  );
}

function ProfileCard() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="card card-lift overflow-hidden animate-fade-up">
      <div className="aurora-banner scan-beam relative h-36 bg-gradient-to-br from-brand-700/60 via-brand/25 to-accent-cyan/25">
        <div className="pointer-events-none absolute inset-0 bg-grid-lines bg-grid-40 opacity-20 [mask-image:radial-gradient(ellipse_at_center,_black,_transparent_75%)]" />
        {/* tiny sprinkled stars over the banner */}
        <div className="pointer-events-none absolute inset-0">
          <span className="absolute left-[8%] top-[22%] h-1 w-1 rounded-full bg-white/80 shadow-[0_0_8px_rgba(255,255,255,0.9)] animate-twinkle" />
          <span
            className="absolute left-[38%] top-[68%] h-[3px] w-[3px] rounded-full bg-brand-300 shadow-[0_0_10px_rgba(167,139,250,0.9)] animate-twinkle-slow"
            style={{ animationDelay: "1.2s" }}
          />
          <span
            className="absolute left-[72%] top-[20%] h-[2px] w-[2px] rounded-full bg-accent-cyan shadow-[0_0_8px_rgba(34,211,238,0.9)] animate-twinkle"
            style={{ animationDelay: "0.6s" }}
          />
          <span
            className="absolute left-[88%] top-[75%] h-1 w-1 rounded-full bg-white/90 animate-twinkle-slow"
            style={{ animationDelay: "2.2s" }}
          />
          <span
            className="absolute left-[55%] top-[35%] h-[2px] w-[2px] rounded-full bg-accent-rose/80 animate-twinkle"
            style={{ animationDelay: "1.8s" }}
          />
        </div>
      </div>
      <div className="flex flex-wrap items-start justify-between gap-4 px-6 pb-5 pt-0">
        <div className="flex items-end gap-4">
          <div className="-mt-12 relative">
            {/* Avatar sits in normal flow so the layout computes its size
                correctly; decorative halo + orbit dots are absolutely
                positioned on top of it. Keeping Avatar as the flow anchor
                avoids the inline-flex baseline gap we hit earlier. */}
            <div className="relative inline-block">
              <Avatar
                url={user.avatarUrl}
                name={user.displayName}
                size={92}
                className="relative z-10 ring-4 ring-ink-900"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute -inset-3 -z-[1] rounded-full bg-gradient-to-br from-brand/40 via-brand-400/25 to-accent-cyan/25 blur-xl opacity-60 animate-breathe-slow"
              />
              <span
                aria-hidden
                className="orbit-dot z-20 block h-2 w-2 rounded-full bg-brand-300 shadow-[0_0_10px_rgba(167,139,250,0.95)]"
                style={
                  { "--orbit-radius": "58px" } as React.CSSProperties
                }
              />
              <span
                aria-hidden
                className="orbit-dot-slow z-20 block h-1.5 w-1.5 rounded-full bg-accent-cyan shadow-[0_0_8px_rgba(34,211,238,0.9)]"
                style={
                  {
                    "--orbit-radius": "52px",
                    animationDelay: "-4s",
                  } as React.CSSProperties
                }
              />
            </div>
          </div>
          <div className="pb-1">
            <div className="text-xs text-slate-400">@{user.username}</div>
            <h1 className="text-2xl font-bold text-white">
              {user.displayName}
            </h1>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="chip">
                <IconStar size={14} className="text-brand-300" />
                Level {user.level}
              </span>
              <span className="chip">
                <IconFlame size={14} />
                {user.currentStreak}d streak
              </span>
              <span className="chip">
                <IconBolt size={14} className="text-brand-300" />
                {fmt(user.xp)} XP
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 pt-4">
          <Link
            to={`/app/profile/${user.username}`}
            className="btn-secondary"
          >
            View profile
          </Link>
          {user.leetcode ? (
            <Link to="/app/connect" className="btn-ghost">
              Reconnect LeetCode
            </Link>
          ) : (
            <Link to="/app/connect" className="btn-primary btn-pulse">
              Connect LeetCode
            </Link>
          )}
        </div>
      </div>
      <div className="border-t border-ink-800/80 px-6 py-4">
        <XpBar
          ratio={user.levelProgress.ratio}
          label={`Level ${user.level} → ${user.level + 1}`}
          showPct
        />
        <div className="mt-1 text-xs text-slate-400">
          {fmt(user.levelProgress.intoLevel)} /{" "}
          {fmt(user.levelProgress.levelSize)} XP ·{" "}
          {fmt(user.levelProgress.toNextLevel)} to next level
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
  accent,
}: {
  label: string;
  value: number;
  tone: string;
  accent: string;
}) {
  return (
    <div className="card card-lift group relative overflow-hidden p-4">
      {/* Colored accent wash, swells on hover */}
      <div
        className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br ${accent} blur-2xl opacity-60 transition-opacity duration-500 group-hover:opacity-100 animate-breathe-slow`}
      />
      {/* Traveling shine */}
      <div className="pointer-events-none absolute inset-0 scan-beam" />
      <div className="relative text-xs font-medium uppercase tracking-wider text-slate-400">
        {label}
      </div>
      <AnimatedNumber
        value={value}
        className={`relative mt-1 block text-2xl font-bold tabular-nums ${tone}`}
      />
    </div>
  );
}

function ChallengeList({
  challenges,
  loading,
}: {
  challenges: WeeklyChallengeDTO[];
  loading: boolean;
}) {
  return (
    <section className="card card-lift p-5 animate-fade-up">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-bold text-white">
          <span className="pulse-dot" aria-hidden />
          Weekly challenges
        </h2>
        <Link
          to="/app/challenges"
          className="text-xs text-brand-400 hover:text-brand-300"
        >
          See all →
        </Link>
      </div>
      {loading ? (
        <div className="mt-4 flex justify-center">
          <Spinner size={20} />
        </div>
      ) : challenges.length === 0 ? (
        <EmptyState
          title="No challenges this week"
          icon={<IconTarget size={30} className="text-brand-300" />}
        />
      ) : (
        <ul className="stagger mt-4 space-y-3">
          {challenges.map((c) => (
            <li
              key={c.id}
              className="rounded-xl border border-ink-700/70 bg-ink-800/50 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/40 hover:bg-ink-800/80 hover:shadow-[0_8px_24px_-12px_rgba(139,92,246,0.5)]"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-white">
                    {c.completed && (
                      <IconCheckCircle
                        size={16}
                        className="text-accent-green"
                      />
                    )}
                    {c.title}
                  </div>
                  <div className="text-xs text-slate-400">{c.description}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">
                    {c.progress} / {c.target}
                  </div>
                  <div className="text-xs font-bold text-brand-400">
                    +{c.xpReward} XP
                  </div>
                </div>
              </div>
              <div className="mt-2">
                <XpBar ratio={c.ratio} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function FriendsMini({
  rows,
  loading,
}: {
  rows: LeaderboardRow[];
  loading: boolean;
}) {
  return (
    <section className="card card-lift p-5 animate-fade-up" style={{ animationDelay: "0.1s" }}>
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-bold text-white">
          <span className="pulse-live" aria-hidden />
          Friends
        </h2>
        <Link
          to="/app/leaderboard?board=friends"
          className="text-xs text-brand-400 hover:text-brand-300"
        >
          Full board →
        </Link>
      </div>
      {loading ? (
        <div className="mt-4 flex justify-center">
          <Spinner size={20} />
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          title="No friends yet"
          description="Find rivals to crush."
          action={
            <Link to="/app/friends" className="btn-primary">
              Add friends
            </Link>
          }
        />
      ) : (
        <ul className="stagger mt-4 space-y-2">
          {rows.slice(0, 6).map((r) => (
            <li
              key={r.id}
              className="flex items-center gap-3 rounded-xl border border-ink-700/70 bg-ink-800/50 p-2 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/40 hover:bg-ink-800/80"
            >
              <RankIcon rank={r.rank} />
              <Avatar url={r.avatarUrl} name={r.displayName} size={32} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">
                  {r.displayName}
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  Lv {r.level} ·
                  <IconFlame size={12} />
                  {r.currentStreak}
                </div>
              </div>
              <div className="text-sm font-bold text-brand-400">
                {fmt(r.xp)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ActivityList({
  events,
  loading,
}: {
  events: ActivityEventDTO[];
  loading: boolean;
}) {
  return (
    <section className="card card-lift p-5 animate-fade-up" style={{ animationDelay: "0.15s" }}>
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-bold text-white">
          <span className="pulse-live" aria-hidden />
          Recent activity
        </h2>
        <Link
          to="/app/activity"
          className="text-xs text-brand-400 hover:text-brand-300"
        >
          See all →
        </Link>
      </div>
      {loading ? (
        <div className="mt-4 flex justify-center">
          <Spinner size={20} />
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          title="No activity yet"
          icon={<IconPulse size={30} className="text-brand-300" />}
        />
      ) : (
        <ul className="stagger mt-4 space-y-2">
          {events.map((ev) => (
            <li
              key={ev.id}
              className="flex items-center gap-3 rounded-xl border border-ink-700/70 bg-ink-800/40 p-2 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/40 hover:bg-ink-800/80"
            >
              <Avatar url={ev.user.avatarUrl} name={ev.user.displayName} size={32} />
              <div className="min-w-0 flex-1">
                <div className="text-sm">
                  <span className="font-semibold">{ev.user.displayName}</span>{" "}
                  <span className="text-slate-300">
                    {decapitalizedFirstWord(ev.message)}
                  </span>
                </div>
                <div className="text-xs text-slate-500">
                  {timeAgo(ev.createdAt)}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function decapitalizedFirstWord(s: string): string {
  if (!s) return s;
  return s.charAt(0).toLowerCase() + s.slice(1);
}

function BadgesCard() {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <section className="card card-lift p-5 animate-fade-up" style={{ animationDelay: "0.2s" }}>
      <h2 className="font-bold text-white">Your badges</h2>
      {user.badges.length === 0 ? (
        <EmptyState
          title="No badges yet"
          description="Solve problems to start earning."
          icon={<IconMedal size={30} tier="silver" />}
        />
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {user.badges.map((b) => (
            <BadgePill key={b.key} badge={b} />
          ))}
        </div>
      )}
    </section>
  );
}
