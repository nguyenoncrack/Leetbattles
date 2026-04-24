import { IconCrown, IconMedal } from "./icons";

export function RankIcon({ rank }: { rank: number }) {
  if (rank === 1)
    return (
      <span
        title="1st"
        className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-400/20 to-amber-800/10 ring-1 ring-yellow-400/30 glitch"
      >
        <IconCrown size={18} tier="gold" />
      </span>
    );
  if (rank === 2)
    return (
      <span
        title="2nd"
        className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-slate-300/20 to-slate-700/10 ring-1 ring-slate-300/30 glitch"
      >
        <IconMedal size={18} tier="silver" />
      </span>
    );
  if (rank === 3)
    return (
      <span
        title="3rd"
        className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-orange-400/20 to-amber-900/10 ring-1 ring-orange-400/30 glitch"
      >
        <IconMedal size={18} tier="bronze" />
      </span>
    );
  return (
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-ink-700 text-xs font-bold text-slate-300">
      {rank}
    </span>
  );
}
