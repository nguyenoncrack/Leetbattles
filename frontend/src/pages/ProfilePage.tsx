import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ApiError } from "../api/client";
import { FriendsAPI, UsersAPI } from "../api/endpoints";
import { Avatar } from "../components/Avatar";
import { BadgePill } from "../components/Badge";
import { EmptyState } from "../components/EmptyState";
import { IconBolt, IconFlame, IconMedal, IconStar } from "../components/icons";
import { Spinner } from "../components/Spinner";
import { XpBar } from "../components/XpBar";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { fmt, timeAgo } from "../lib/format";
import type { UserDTO } from "../types/api";

export function ProfilePage() {
  const { idOrUsername } = useParams<{ idOrUsername: string }>();
  const { user: me, refresh, setUser } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!idOrUsername) return;
    setLoading(true);
    setErr(null);
    try {
      const { user } = await UsersAPI.get(idOrUsername);
      setProfile(user);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Could not load profile.");
    } finally {
      setLoading(false);
    }
  }, [idOrUsername]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading)
    return (
      <div className="flex justify-center py-16">
        <Spinner size={22} />
      </div>
    );
  if (err || !profile)
    return (
      <EmptyState
        title="Profile not found"
        description={err ?? undefined}
        icon="🫥"
      />
    );

  const isMe = me?.id === profile.id;
  const isRival = me?.rivalId === profile.id;
  const canRival = !isMe && me;

  const addFriend = async () => {
    try {
      await FriendsAPI.request({ userId: profile.id });
      toast({ tone: "success", title: `Friend request sent to @${profile.username}` });
    } catch (e) {
      toast({
        tone: "error",
        title: "Could not send request",
        body: e instanceof ApiError ? e.message : undefined,
      });
    }
  };

  const toggleRival = async () => {
    try {
      const res = await UsersAPI.updateMe({
        rivalId: isRival ? null : profile.id,
      });
      setUser(res.user);
      await refresh();
      toast({
        tone: "success",
        title: isRival
          ? `No longer rivals with @${profile.username}`
          : `@${profile.username} is now your rival!`,
      });
    } catch (e) {
      toast({
        tone: "error",
        title: "Could not update rival",
        body: e instanceof ApiError ? e.message : undefined,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="card overflow-hidden">
        <div className="h-24 bg-gradient-to-br from-brand-700/60 via-brand/30 to-accent-cyan/30" />
        <div className="-mt-10 flex flex-wrap items-end justify-between gap-4 p-5">
          <div className="flex items-end gap-4">
            <Avatar
              url={profile.avatarUrl}
              name={profile.displayName}
              size={80}
              className="h-20 w-20 ring-4 ring-ink-900"
            />
            <div>
              <div className="text-xs text-slate-400">@{profile.username}</div>
              <h1 className="text-2xl font-bold text-white">
                {profile.displayName}
              </h1>
              {profile.bio && (
                <p className="mt-1 max-w-lg text-sm text-slate-300">
                  {profile.bio}
                </p>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="chip">
                  <IconStar size={14} className="text-brand-300" />
                  Level {profile.level}
                </span>
                <span className="chip">
                  <IconFlame size={14} />
                  {profile.currentStreak}d streak
                </span>
                <span className="chip">
                  <IconBolt size={14} className="text-brand-300" />
                  {fmt(profile.xp)} XP
                </span>
                {profile.leetcode && (
                  <span className="chip">
                    LC @{profile.leetcode.username}
                  </span>
                )}
              </div>
            </div>
          </div>

          {canRival && (
            <div className="flex gap-2">
              <button onClick={addFriend} className="btn-secondary">
                + Friend
              </button>
              <button
                onClick={toggleRival}
                className={isRival ? "btn-secondary" : "btn-primary"}
              >
                {isRival ? "Remove rival" : "Mark as rival"}
              </button>
            </div>
          )}
        </div>
        <div className="px-5 pb-5">
          <XpBar
            ratio={profile.levelProgress.ratio}
            label={`Level ${profile.level} → ${profile.level + 1}`}
            showPct
          />
        </div>
      </div>

      {isMe && me && <CompareRivalCard me={me} />}

      <div className="grid gap-4 md:grid-cols-4">
        <Stat
          label="Total solved"
          value={fmt(profile.leetcode?.totalSolved ?? 0)}
        />
        <Stat
          label="Easy"
          value={fmt(profile.leetcode?.easySolved ?? 0)}
          tone="text-accent-green"
        />
        <Stat
          label="Medium"
          value={fmt(profile.leetcode?.mediumSolved ?? 0)}
          tone="text-accent-amber"
        />
        <Stat
          label="Hard"
          value={fmt(profile.leetcode?.hardSolved ?? 0)}
          tone="text-accent-rose"
        />
      </div>

      <section className="card p-5">
        <h2 className="font-bold">Badges</h2>
        {profile.badges.length === 0 ? (
          <EmptyState
            title="No badges yet"
            icon={<IconMedal size={30} tier="silver" />}
            description={isMe ? "Keep solving to unlock your first badge." : ""}
          />
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {profile.badges.map((b) => (
              <BadgePill key={b.key} badge={b} />
            ))}
          </div>
        )}
      </section>

      {profile.leetcode?.recentSubmissions &&
        profile.leetcode.recentSubmissions.length > 0 && (
          <section className="card p-5">
            <h2 className="font-bold">Recent submissions</h2>
            <ul className="mt-3 divide-y divide-ink-700/60">
              {profile.leetcode.recentSubmissions.slice(0, 10).map((s, i) => (
                <li key={`${s.titleSlug}-${i}`} className="flex items-center justify-between py-2">
                  <div className="min-w-0">
                    <a
                      href={`https://leetcode.com/problems/${s.titleSlug}/`}
                      target="_blank"
                      rel="noreferrer"
                      className="truncate text-sm font-medium text-white hover:text-brand-400"
                    >
                      {s.title}
                    </a>
                    <div className="text-xs text-slate-500">
                      {timeAgo(new Date(s.timestamp * 1000))} ·{" "}
                      {s.statusDisplay}
                    </div>
                  </div>
                  <span
                    className={`chip ${
                      s.difficulty === "Easy"
                        ? "text-accent-green"
                        : s.difficulty === "Medium"
                        ? "text-accent-amber"
                        : "text-accent-rose"
                    }`}
                  >
                    {s.difficulty}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
    </div>
  );
}

function Stat({
  label,
  value,
  tone = "text-white",
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="card p-4">
      <div className="text-xs uppercase tracking-wider text-slate-400">
        {label}
      </div>
      <div className={`mt-1 text-2xl font-bold ${tone}`}>{value}</div>
    </div>
  );
}

function CompareRivalCard({ me }: { me: UserDTO }) {
  const [rival, setRival] = useState<UserDTO | null>(null);
  useEffect(() => {
    if (!me.rivalId) {
      setRival(null);
      return;
    }
    UsersAPI.get(me.rivalId)
      .then((r) => setRival(r.user))
      .catch(() => setRival(null));
  }, [me.rivalId]);

  if (!me.rivalId) {
    return (
      <section className="card p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-bold">No rival set</h2>
            <p className="text-sm text-slate-400">
              Mark a friend as your rival to unlock side-by-side comparisons.
            </p>
          </div>
          <Link to="/app/friends" className="btn-secondary">
            Pick a rival
          </Link>
        </div>
      </section>
    );
  }
  if (!rival) return null;

  const rows: Array<{ label: string; me: number; them: number }> = [
    { label: "XP", me: me.xp, them: rival.xp },
    { label: "Level", me: me.level, them: rival.level },
    { label: "Streak", me: me.currentStreak, them: rival.currentStreak },
    {
      label: "Total solved",
      me: me.leetcode?.totalSolved ?? 0,
      them: rival.leetcode?.totalSolved ?? 0,
    },
    {
      label: "Medium",
      me: me.leetcode?.mediumSolved ?? 0,
      them: rival.leetcode?.mediumSolved ?? 0,
    },
    {
      label: "Hard",
      me: me.leetcode?.hardSolved ?? 0,
      them: rival.leetcode?.hardSolved ?? 0,
    },
  ];

  return (
    <section className="card p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-bold">🆚 Rival: @{rival.username}</h2>
        <Link to={`/app/profile/${rival.username}`} className="text-xs text-brand-400 hover:text-brand-300">
          View profile →
        </Link>
      </div>
      <div className="mt-4 divide-y divide-ink-700/60">
        {rows.map((r) => {
          const lead =
            r.me === r.them ? "tie" : r.me > r.them ? "me" : "them";
          return (
            <div
              key={r.label}
              className="grid grid-cols-5 items-center gap-3 py-2 text-sm"
            >
              <div
                className={`col-span-2 text-right font-semibold ${
                  lead === "me" ? "text-accent-green" : "text-slate-300"
                }`}
              >
                {fmt(r.me)}
              </div>
              <div className="col-span-1 text-center text-xs text-slate-400">
                {r.label}
              </div>
              <div
                className={`col-span-2 text-left font-semibold ${
                  lead === "them" ? "text-accent-rose" : "text-slate-300"
                }`}
              >
                {fmt(r.them)}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
