import { useEffect, useMemo, useRef, useState } from "react";

interface Props {
  // "hero": heavy animation for landing / auth pages
  // "app": subtler for logged-in shells so content stays legible
  variant?: "hero" | "app";
  // Show floating code glyphs (legacy prop — kept for compatibility)
  glyphs?: boolean;
  className?: string;
}

// Fixed, full-viewport animated backdrop. Idle space scene: deep-space gradient,
// parallax starfield, twinkling stars, occasional shooting stars, a slow
// distant orbit, plus the original aurora blobs + grid so content stays
// readable. Everything is CSS transforms so it stays cheap, and the whole
// layer hides under `prefers-reduced-motion`.
export function AnimatedBackground({
  variant = "hero",
  glyphs = true,
  className = "",
}: Props) {
  const isHero = variant === "hero";
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Deterministic starfield — generated once per mount. Three layers so we
  // get cheap parallax (far stars drift slow, near stars drift fast).
  const stars = useMemo(() => makeStars(isHero ? 160 : 90), [isHero]);

  // Shooting stars — spawned on a timer, keyed uniquely so they animate once
  // and unmount. Looks naturally random.
  const [shots, setShots] = useState<Array<Shot>>([]);
  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;

    const spawn = () => {
      if (cancelled) return;
      setShots((prev) => {
        const next = [...prev, makeShot()];
        // Keep the array bounded; rely on onAnimationEnd to cull.
        return next.slice(-4);
      });
      const wait = 2600 + Math.random() * 4200;
      timer = window.setTimeout(spawn, wait);
    };

    timer = window.setTimeout(spawn, 1500);
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden
      className={`pointer-events-none fixed inset-0 -z-10 overflow-hidden motion-reduce:hidden ${className}`}
    >
      {/* Deep space gradient base */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#0e0b1a_0%,_#07070b_55%,_#050509_100%)]" />

      {/* Far nebula wash */}
      <div className="absolute inset-0 bg-grid-fade opacity-80" />

      {/* Parallax starfield — 3 layers */}
      <StarLayer
        stars={stars.far}
        className="animate-star-drift-slow opacity-80"
      />
      <StarLayer
        stars={stars.mid}
        className="animate-star-drift opacity-90"
      />
      <StarLayer stars={stars.near} className="animate-star-drift" />

      {/* Shooting stars */}
      <div className="absolute inset-0">
        {shots.map((s) => (
          <span
            key={s.id}
            className="absolute block h-[2px] w-24 animate-shoot"
            style={{
              top: s.top,
              left: s.left,
              background:
                "linear-gradient(90deg, rgba(255,255,255,0), rgba(220,230,255,0.95) 70%, rgba(140,200,255,0.9))",
              boxShadow: "0 0 8px rgba(180,210,255,0.8)",
              filter: "blur(0.3px)",
            }}
            onAnimationEnd={() =>
              setShots((prev) => prev.filter((p) => p.id !== s.id))
            }
          />
        ))}
      </div>

      {/* Distant orbiting planet (hero only) */}
      {isHero && (
        <div className="absolute -right-24 top-[18%] h-[28rem] w-[28rem] opacity-60">
          <div className="relative h-full w-full animate-spin-slower">
            <div className="absolute inset-0 rounded-full border border-brand/15" />
            <div className="absolute left-1/2 top-0 -translate-x-1/2 h-3 w-3 rounded-full bg-brand-300 shadow-[0_0_18px_rgba(167,139,250,0.9)]" />
          </div>
        </div>
      )}

      {/* Animated aurora blobs (toned down over space) */}
      <div
        className={`absolute ${
          isHero
            ? "-top-40 -left-32 h-[36rem] w-[36rem]"
            : "-top-28 -left-24 h-[26rem] w-[26rem]"
        } rounded-full bg-brand-600/20 blur-3xl animate-aurora-a`}
      />
      <div
        className={`absolute ${
          isHero
            ? "top-1/3 -right-40 h-[32rem] w-[32rem]"
            : "top-1/4 -right-32 h-[24rem] w-[24rem]"
        } rounded-full bg-accent-cyan/15 blur-3xl animate-aurora-b`}
      />
      <div
        className={`absolute ${
          isHero
            ? "-bottom-40 left-1/4 h-[34rem] w-[34rem]"
            : "-bottom-32 left-1/3 h-[22rem] w-[22rem]"
        } rounded-full bg-accent-rose/12 blur-3xl animate-aurora-c`}
      />

      {/* Grid overlay — only in hero so app content stays clean */}
      {isHero && (
        <div className="absolute inset-0 bg-grid-lines bg-grid-40 opacity-[0.35] animate-grid-pulse [mask-image:radial-gradient(ellipse_at_center,_black_20%,_transparent_72%)]" />
      )}

      {/* Hairline scanning beam */}
      {isHero && (
        <div className="absolute left-0 right-0 top-1/2 h-px bg-gradient-to-r from-transparent via-brand-400/40 to-transparent blur-[1px] animate-pulse" />
      )}

      {/* Floating code glyphs (kept for texture on the hero) */}
      {glyphs && isHero && (
        <div className="absolute inset-0">
          <Glyph ch="{ }" top="12%" left="8%" delay="0s" size="text-3xl" />
          <Glyph ch="</>" top="72%" left="14%" delay="1.2s" size="text-2xl" slow />
          <Glyph ch="λ" top="22%" left="82%" delay="0.4s" size="text-4xl" slow />
          <Glyph ch="#" top="65%" left="78%" delay="2s" size="text-3xl" />
          <Glyph ch="⇢" top="42%" left="4%" delay="0.8s" size="text-2xl" slow />
          <Glyph ch="=>" top="86%" left="52%" delay="1.6s" size="text-xl" />
          <Glyph ch="( )" top="6%" left="44%" delay="0.2s" size="text-2xl" slow />
        </div>
      )}

      {/* Vignette to keep content readable over stars */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_45%,_rgba(5,5,9,0.9)_100%)]" />
    </div>
  );
}

// ------------------------------------------------------------------
// helpers
// ------------------------------------------------------------------

interface Star {
  top: string;
  left: string;
  size: number;
  delay: string;
  duration: string;
  color: string;
}

interface Shot {
  id: number;
  top: string;
  left: string;
}

function Glyph({
  ch,
  top,
  left,
  delay,
  size,
  slow,
}: {
  ch: string;
  top: string;
  left: string;
  delay: string;
  size: string;
  slow?: boolean;
}) {
  return (
    <span
      className={`absolute font-mono ${size} text-brand-400/25 ${
        slow ? "animate-float-slower" : "animate-float-slow"
      }`}
      style={{ top, left, animationDelay: delay }}
    >
      {ch}
    </span>
  );
}

function StarLayer({ stars, className }: { stars: Star[]; className: string }) {
  return (
    <div className={`absolute inset-0 ${className}`}>
      {stars.map((s, i) => (
        <span
          key={i}
          className="absolute block rounded-full"
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            background: s.color,
            boxShadow:
              s.size >= 2
                ? "0 0 6px rgba(255,255,255,0.7), 0 0 12px rgba(139,92,246,0.35)"
                : undefined,
            animation: `twinkle ${s.duration} ease-in-out infinite`,
            animationDelay: s.delay,
          }}
        />
      ))}
    </div>
  );
}

// Deterministic PRNG so the initial paint is stable and doesn't flash.
function mulberry32(seed: number) {
  let t = seed >>> 0;
  return function () {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function makeStars(total: number): { far: Star[]; mid: Star[]; near: Star[] } {
  const rand = mulberry32(1337);
  const palette = [
    "rgba(255,255,255,0.95)",
    "rgba(220,230,255,0.9)",
    "rgba(167,139,250,0.9)", // brand-400
    "rgba(34,211,238,0.9)", // accent-cyan
    "rgba(253,186,116,0.8)", // warm
  ];

  const mk = (sizeMin: number, sizeMax: number, dMin: number, dMax: number) => {
    return {
      top: `${(rand() * 120 - 10).toFixed(2)}%`,
      left: `${(rand() * 120 - 10).toFixed(2)}%`,
      size: Math.max(0.5, rand() * (sizeMax - sizeMin) + sizeMin),
      delay: `${(rand() * 6).toFixed(2)}s`,
      duration: `${(rand() * (dMax - dMin) + dMin).toFixed(2)}s`,
      color: palette[Math.floor(rand() * palette.length)],
    } as Star;
  };

  const far: Star[] = [];
  const mid: Star[] = [];
  const near: Star[] = [];

  const farCount = Math.round(total * 0.55);
  const midCount = Math.round(total * 0.3);
  const nearCount = total - farCount - midCount;

  for (let i = 0; i < farCount; i++) far.push(mk(0.6, 1.3, 4, 9));
  for (let i = 0; i < midCount; i++) mid.push(mk(1, 1.8, 3, 7));
  for (let i = 0; i < nearCount; i++) near.push(mk(1.5, 2.6, 2.5, 5));

  return { far, mid, near };
}

function makeShot(): Shot {
  return {
    id: Math.floor(Math.random() * 1e9),
    top: `${Math.round(Math.random() * 60)}%`,
    left: `${Math.round(Math.random() * 30 - 10)}%`,
  };
}
