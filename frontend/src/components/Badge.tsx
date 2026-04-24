import type { ComponentType, SVGProps } from "react";
import type { BadgeDTO } from "../types/api";
import {
  IconBolt,
  IconDrop,
  IconFlame,
  IconGear,
  IconMedal,
  IconSkull,
} from "./icons";

type SvgIcon = ComponentType<
  SVGProps<SVGSVGElement> & { size?: number | string; gradient?: boolean }
>;

// Map semantic badge keys from the seed/DB to hand-drawn SVG icons.
const KEY_ICONS: Record<string, SvgIcon> = {
  first_blood: IconDrop,
  grinder: IconGear,
  medium_menace: IconFlame,
  hardcore: IconSkull,
  consistency_demon: IconBolt,
};

const TIER_STYLES: Record<string, string> = {
  bronze: "from-amber-700/30 to-amber-900/30 border-amber-700/40 text-amber-200",
  silver: "from-slate-500/30 to-slate-700/30 border-slate-400/40 text-slate-200",
  gold: "from-yellow-500/30 to-amber-700/30 border-yellow-400/40 text-yellow-200",
  legendary:
    "from-brand/40 to-accent-cyan/30 border-brand/50 text-white shadow-glow",
};

export function BadgePill({ badge }: { badge: BadgeDTO }) {
  const style = TIER_STYLES[badge.tier] ?? TIER_STYLES.bronze;
  const Icon = KEY_ICONS[badge.key] ?? IconMedal;
  return (
    <div
      title={badge.description}
      className={`flex items-center gap-2 rounded-xl border bg-gradient-to-br px-2.5 py-1.5 text-xs font-semibold ${style}`}
    >
      <span className="glitch">
        <Icon size={14} />
      </span>
      <span>{badge.name}</span>
    </div>
  );
}
