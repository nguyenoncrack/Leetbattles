import type { ComponentType, SVGProps } from "react";
import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { LeaderboardAPI } from "../api/endpoints";
import { Avatar } from "../components/Avatar";
import { EmptyState } from "../components/EmptyState";
import {
  IconCalendar,
  IconFlame,
  IconGlobe,
  IconTrophy,
  IconUsers,
} from "../components/icons";
import { RankIcon } from "../components/RankIcon";
import { Spinner } from "../components/Spinner";
import { useAuth } from "../context/AuthContext";
import { fmt } from "../lib/format";
import type { LeaderboardRow } from "../types/api";

type Board = "global" | "weekly" | "friends";
type SvgIcon = ComponentType<
  SVGProps<SVGSVGElement> & { size?: number | string }
>;

const TABS: Array<{ id: Board; label: string; Icon: SvgIcon }> = [
  { id: "global", label: "Global", Icon: IconGlobe },
  { id: "weekly", label: "Weekly", Icon: IconCalendar },
  { id: "friends", label: "Friends", Icon: IconUsers },
];

export function LeaderboardPage({ standalone }: { standalone?: boolean }) {
  const [params, setParams] = useSearchParams();
  const active = (params.get("board") as Board) || "global";
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const load = useCallback(async (b: Board) => {
    setLoading(true);
    try {
      const api =
        b === "weekly"
          ? LeaderboardAPI.weekly
          : b === "friends"
          ? LeaderboardAPI.friends
          : LeaderboardAPI.global;
      const { board } = await api();
      setRows(board);
    } catch (e) {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(active);
  }, [active, load]);

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Leaderboards</h1>
          <p className="text-sm text-slate-400">
            Climb the ladder. Keep your streak. Crush your rival.
          </p>
        </div>
        {standalone && (
          <div className="flex gap-2">
            <Link to="/login" className="btn-ghost">
              Sign in
            </Link>
            <Link to="/register" className="btn-primary">
              Join the clash
            </Link>
          </div>
        )}
      </header>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => {
          const disabled = t.id === "friends" && !user;
          return (
            <button
              key={t.id}
              onClick={() =>
                !disabled &&
                setParams((p) => {
                  p.set("board", t.id);
                  return p;
                })
              }
              disabled={disabled}
              className={`btn inline-flex items-center gap-2 ${
                active === t.id
                  ? "bg-brand/20 border border-brand/40 text-white"
                  : "btn-secondary"
              } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
              title={disabled ? "Sign in to view the friends leaderboard" : undefined}
            >
              <t.Icon size={16} />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="card overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-3 border-b border-ink-700/60 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <div className="col-span-1">Rank</div>
          <div className="col-span-4">Player</div>
          <div className="col-span-2">LeetCode</div>
          <div className="col-span-1 text-right">Level</div>
          <div className="col-span-2 text-right">
            {active === "weekly" ? "Wkly XP" : "XP"}
          </div>
          <div className="col-span-1 text-right">Solved</div>
          <div className="col-span-1 text-right">Streak</div>
        </div>

        {loading ? (
          <div className="flex justify-center p-10">
            <Spinner size={20} />
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            title={
              active === "friends"
                ? "No friends yet"
                : "Leaderboard is empty"
            }
            description={
              active === "friends"
                ? "Add a few friends to compete."
                : "Come back after a few signups."
            }
            icon={<IconTrophy size={30} className="text-yellow-400" />}
            action={
              active === "friends" ? (
                <Link to="/app/friends" className="btn-primary">
                  Find friends
                </Link>
              ) : undefined
            }
          />
        ) : (
          <ul className="divide-y divide-ink-700/60">
            {rows.map((r) => {
              const isMe = user && r.id === user.id;
              const weeklyColumn = active === "weekly" ? r.weeklyXp : r.xp;
              return (
                <li
                  key={r.id}
                  className={`grid grid-cols-12 items-center gap-3 px-4 py-3 transition-colors ${
                    isMe ? "bg-brand/10" : "hover:bg-ink-800/60"
                  }`}
                >
                  <div className="col-span-2 md:col-span-1 flex items-center">
                    <RankIcon rank={r.rank} />
                  </div>
                  <Link
                    to={`/app/profile/${r.username}`}
                    className="col-span-10 md:col-span-4 flex min-w-0 items-center gap-3"
                  >
                    <Avatar url={r.avatarUrl} name={r.displayName} size={36} />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">
                        {r.displayName}
                        {isMe && (
                          <span className="ml-2 rounded-md bg-brand/30 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                            you
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">
                        @{r.username}
                      </div>
                    </div>
                  </Link>
                  <div className="col-span-4 md:col-span-2 truncate text-xs text-slate-400 font-mono">
                    {r.leetcodeUsername ? `@${r.leetcodeUsername}` : "—"}
                  </div>
                  <div className="col-span-2 md:col-span-1 text-right text-sm">
                    Lv {r.level}
                  </div>
                  <div className="col-span-3 md:col-span-2 text-right text-sm font-bold text-brand-400">
                    {fmt(weeklyColumn)}
                  </div>
                  <div className="col-span-2 md:col-span-1 text-right text-xs text-slate-400">
                    {fmt(
                      active === "weekly" ? r.weeklySolved : r.totalSolved
                    )}
                  </div>
                  <div className="col-span-1 flex items-center justify-end gap-1 text-right text-xs">
                    <IconFlame size={12} />
                    {r.currentStreak}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

export function PublicLeaderboardPage() {
  return (
    <div className="min-h-screen bg-ink-950 bg-grid-fade p-4 md:p-8">
      <div className="mx-auto w-full max-w-6xl">
        <Link to="/" className="text-sm text-slate-400 hover:text-slate-200">
          ← Back
        </Link>
        <div className="mt-4">
          <LeaderboardPage standalone />
        </div>
      </div>
    </div>
  );
}
