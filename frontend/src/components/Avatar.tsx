import { useState } from "react";

interface Props {
  url?: string | null;
  name: string;
  size?: number;
  className?: string;
}

// Palette of pairs used to color-hash the gradient background so each user
// gets a stable, distinct-but-on-brand avatar.
const PALETTE: Array<[string, string]> = [
  ["#8b5cf6", "#22d3ee"], // brand → cyan
  ["#7c3aed", "#fb7185"], // violet → rose
  ["#6d28d9", "#fbbf24"], // deep violet → amber
  ["#a78bfa", "#34d399"], // lilac → green
  ["#22d3ee", "#8b5cf6"], // cyan → brand
  ["#fb7185", "#8b5cf6"], // rose → brand
  ["#34d399", "#22d3ee"], // green → cyan
  ["#f472b6", "#a78bfa"], // pink → lilac
];

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({ url, name, size = 40, className = "" }: Props) {
  const [broken, setBroken] = useState(false);
  const shouldUseInitials =
    broken ||
    !url ||
    // DiceBear identicon renders as an ugly tile — always skip it.
    url.includes("dicebear.com/7.x/identicon");

  if (shouldUseInitials) {
    return (
      <InitialsAvatar name={name} size={size} className={className} />
    );
  }

  return (
    <img
      src={url}
      alt={name}
      width={size}
      height={size}
      onError={() => setBroken(true)}
      className={`rounded-xl bg-ink-700 object-cover ring-1 ring-ink-600 ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

function InitialsAvatar({
  name,
  size,
  className,
}: {
  name: string;
  size: number;
  className: string;
}) {
  const seed = name || "cc";
  const [from, to] = PALETTE[hash(seed) % PALETTE.length];
  const initials = initialsFor(name);
  // Font size scales with avatar size — ~40% of size looks right.
  const fontSize = Math.max(12, Math.round(size * 0.4));

  return (
    <div
      aria-label={name}
      className={`relative inline-flex items-center justify-center overflow-hidden rounded-xl font-bold text-white ring-1 ring-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.35)] ${className}`}
      style={{
        width: size,
        height: size,
        backgroundImage: `linear-gradient(135deg, ${from}, ${to})`,
        fontSize,
        letterSpacing: "-0.02em",
      }}
    >
      {/* subtle shine highlight */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.55), transparent 55%)",
        }}
      />
      <span className="relative drop-shadow-sm">{initials}</span>
    </div>
  );
}
