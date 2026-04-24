import type { ComponentType, SVGProps } from "react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ActivityAPI } from "../api/endpoints";
import { Avatar } from "../components/Avatar";
import { EmptyState } from "../components/EmptyState";
import {
  IconArrowUp,
  IconCheck,
  IconFlame,
  IconMedal,
  IconPulse,
  IconSparkle,
  IconSwords,
  IconTarget,
  IconUsers,
} from "../components/icons";
import { Spinner } from "../components/Spinner";
import { timeAgo } from "../lib/format";
import type { ActivityEventDTO, ActivityType } from "../types/api";

type SvgIcon = ComponentType<
  SVGProps<SVGSVGElement> & { size?: number | string; gradient?: boolean }
>;

const ICON: Record<ActivityType, { Icon: SvgIcon; tone: string }> = {
  SOLVED_PROBLEMS: { Icon: IconCheck, tone: "text-accent-green" },
  LEVELED_UP: { Icon: IconArrowUp, tone: "text-brand-300" },
  BADGE_EARNED: { Icon: IconMedal, tone: "text-yellow-300" },
  CHALLENGE_COMPLETED: { Icon: IconTarget, tone: "text-accent-cyan" },
  STREAK_MILESTONE: { Icon: IconFlame, tone: "text-accent-amber" },
  PASSED_RIVAL: { Icon: IconSwords, tone: "text-accent-rose" },
  FRIEND_ADDED: { Icon: IconUsers, tone: "text-slate-200" },
  JOINED: { Icon: IconSparkle, tone: "text-brand-300" },
};

export function ActivityPage() {
  const [events, setEvents] = useState<ActivityEventDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const load = useCallback(async (before?: string) => {
    const isInitial = !before;
    if (isInitial) setLoading(true);
    else setLoadingMore(true);
    try {
      const { events: page } = await ActivityAPI.feed(before, 25);
      setEvents((prev) => (isInitial ? page : [...prev, ...page]));
      if (page.length < 25) setHasMore(false);
    } finally {
      if (isInitial) setLoading(false);
      else setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Activity feed</h1>
        <p className="text-sm text-slate-400">
          What you and your friends have been up to.
        </p>
      </header>

      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner size={22} />
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          icon={<IconPulse size={30} className="text-brand-300" />}
          title="Quiet on the feed"
          description="Solve a problem or add friends to get things moving."
        />
      ) : (
        <ul className="space-y-2">
          {events.map((ev) => {
            const entry = ICON[ev.type];
            const Icon = entry?.Icon ?? IconSparkle;
            const tone = entry?.tone ?? "text-slate-300";
            return (
              <li
                key={ev.id}
                className="flex items-center gap-3 rounded-xl border border-ink-700 bg-ink-800/60 p-3"
              >
                <Avatar
                  url={ev.user.avatarUrl}
                  name={ev.user.displayName}
                  size={40}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-sm">
                    <Link
                      to={`/app/profile/${ev.user.username}`}
                      className="font-semibold text-white hover:text-brand-400"
                    >
                      {ev.user.displayName}
                    </Link>{" "}
                    <span className="text-slate-300">{decap(ev.message)}</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    {timeAgo(ev.createdAt)}
                  </div>
                </div>
                <div
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border border-ink-700 bg-ink-900/70 ${tone}`}
                >
                  <Icon size={18} />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {hasMore && !loading && events.length > 0 && (
        <div className="flex justify-center">
          <button
            onClick={() => load(events[events.length - 1].createdAt)}
            className="btn-secondary"
            disabled={loadingMore}
          >
            {loadingMore ? <Spinner /> : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}

function decap(s: string) {
  return s ? s.charAt(0).toLowerCase() + s.slice(1) : s;
}
