import { useEffect, useState } from "react";

interface Wisp {
  id: number;
  left: number; // %
  color: string;
  text: string;
  duration: number; // seconds
  size: number; // px
}

const PALETTE = [
  { color: "#a78bfa", glow: "rgba(167,139,250,0.6)" }, // brand
  { color: "#22d3ee", glow: "rgba(34,211,238,0.6)" }, // cyan
  { color: "#fbbf24", glow: "rgba(251,191,36,0.55)" }, // amber
  { color: "#34d399", glow: "rgba(52,211,153,0.55)" }, // emerald
  { color: "#fb7185", glow: "rgba(251,113,133,0.55)" }, // rose
];

const TOKENS = ["+1 XP", "+2 XP", "+3 XP", "+5 XP", "+1", "◆", "▲"];

// Ambient background wisps — tiny glowing motes that drift up through the
// dashboard content and fade out. Purely decorative, pointer-events-none,
// and capped so there are never more than a few on screen at once.
// Gives the page "something happening" when the user is idle.
export function AmbientXpWisps({ max = 4 }: { max?: number }) {
  const [wisps, setWisps] = useState<Wisp[]>([]);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    let cancelled = false;
    let timer: number | undefined;

    const spawn = () => {
      if (cancelled) return;
      setWisps((prev) => {
        const swatch = PALETTE[Math.floor(Math.random() * PALETTE.length)];
        const token = TOKENS[Math.floor(Math.random() * TOKENS.length)];
        const next: Wisp = {
          id: Math.floor(Math.random() * 1e9),
          left: Math.round(Math.random() * 92 + 4),
          color: swatch.color,
          text: token,
          duration: 6 + Math.random() * 4,
          size: 11 + Math.random() * 3,
        };
        return [...prev, next].slice(-max);
      });
      timer = window.setTimeout(spawn, 4200 + Math.random() * 4800);
    };

    timer = window.setTimeout(spawn, 1800);
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [max]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {wisps.map((w) => (
        <span
          key={w.id}
          className="pointer-events-none absolute -bottom-8 font-mono font-semibold"
          style={{
            left: `${w.left}%`,
            color: w.color,
            fontSize: w.size,
            textShadow: `0 0 10px ${w.color}, 0 0 22px ${w.color}`,
            animation: `wisp-up ${w.duration}s linear forwards`,
            opacity: 0,
          }}
          onAnimationEnd={() =>
            setWisps((prev) => prev.filter((x) => x.id !== w.id))
          }
        >
          {w.text}
        </span>
      ))}
    </div>
  );
}
