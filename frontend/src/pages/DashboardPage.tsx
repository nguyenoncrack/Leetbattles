import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../api/client";
import {
  ActivityAPI,
  ChallengesAPI,
  LeaderboardAPI,
  LeetcodeAPI,
} from "../api/endpoints";
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
    <div className="space-y-6">
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
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard
            label="Total solved"
            value={fmt(user.leetcode.totalSolved)}
            tone="text-white"
          />
          <StatCard
            label="Easy"
            value={fmt(user.leetcode.easySolved)}
            tone="text-accent-green"
          />
          <StatCard
            label="Medium"
            value={fmt(user.leetcode.mediumSolved)}
            tone="text-accent-amber"
          />
          <StatCard
            label="Hard"
            value={fmt(user.leetcode.hardSolved)}
            tone="text-accent-rose"
          />
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm text-slate-400">
          {user.leetcode ? (
            <>
              LeetCode:{" "}
              <span className="font-mono text-slate-200">
                @{user.leetcode.username}
              </span>
              {user.leetcode.lastSyncedAt && (
                <> · synced {timeAgo(user.leetcode.lastSyncedAt)}</>
              )}
            </>
          ) : (
            "No LeetCode profile connected yet"
          )}
        </div>
        {user.leetcode && (
          <button onClick={sync} className="btn-primary" disabled={syncing}>
            {syncing ? <Spinner /> : "↻ Sync now"}
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
    <div className="card overflow-hidden animate-fade-up">
      <div className="relative h-32 overflow-hidden bg-gradient-to-br from-brand-700/70 via-brand/30 to-accent-cyan/30">
        <div className="pointer-events-none absolute -top-16 -left-16 h-56 w-56 rounded-full bg-brand/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 right-0 h-48 w-48 rounded-full bg-accent-cyan/20 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-grid-lines bg-grid-40 opacity-25 [mask-image:radial-gradient(ellipse_at_center,_black,_transparent_75%)]" />
      </div>
      <div className="flex flex-wrap items-start justify-between gap-4 px-6 pb-5 pt-0">
        <div className="flex items-end gap-4">
          <div className="-mt-12">
            <Avatar
              url={user.avatarUrl}
              name={user.displayName}
              size={92}
              className="ring-4 ring-ink-900"
            />
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
}: {
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="card p-4">
      <div className="text-xs font-medium uppercase tracking-wider text-slate-400">
        {label}
      </div>
      <div className={`mt-1 text-2xl font-bold ${tone}`}>{value}</div>
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
    <section className="card p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-white">Weekly challenges</h2>
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
        <ul className="mt-4 space-y-3">
          {challenges.map((c) => (
            <li
              key={c.id}
              className="rounded-xl border border-ink-700 bg-ink-800/60 p-3"
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
    <section className="card p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-white">Friends</h2>
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
        <ul className="mt-4 space-y-2">
          {rows.slice(0, 6).map((r) => (
            <li
              key={r.id}
              className="flex items-center gap-3 rounded-xl border border-ink-700 bg-ink-800/60 p-2"
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
    <section className="card p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-white">Recent activity</h2>
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
        <ul className="mt-4 space-y-2">
          {events.map((ev) => (
            <li
              key={ev.id}
              className="flex items-center gap-3 rounded-xl border border-ink-700 bg-ink-800/50 p-2"
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
    <section className="card p-5">
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
