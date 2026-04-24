import { useEffect, useMemo, useRef, useState } from "react";

interface Props {
  // "hero": heavy animation for landing / auth pages
  // "app": subtler for logged-in shells so content stays legible
  variant?: "hero" | "app";
  // Show floating code glyphs (legacy prop — kept for compatibility)
  glyphs?: boolean;
  className?: string;
}

// Fixed, full-viewport animated space backdrop.
// Layers (back-to-front):
//   0. Deep-space radial gradient
//   1. Drifting colored nebula clouds (3)
//   2. Parallax starfield (3 layers — twinkling)
//   3. Constellation flash (faint lines that briefly appear)
//   4. "Pulsar" glow stars that breathe
//   5. Dust motes drifting gently
//   6. Distant slow-spinning galaxy / orbit
//   7. Shooting stars + occasional long comets with glowing trails
//   8. Aurora blobs (toned-down)
//   9. Grid + scan beam (hero only)
//  10. Vignette to keep text readable
// Everything is CSS transforms. `motion-reduce:hidden` kills it all.
// A cheap mouse-parallax layer gives the whole scene subtle depth.
export function AnimatedBackground({
  variant = "hero",
  glyphs = true,
  className = "",
}: Props) {
  const isHero = variant === "hero";

  // Stable starfield & pulsar set per mount.
  const stars = useMemo(() => makeStars(isHero ? 170 : 100), [isHero]);
  const pulsars = useMemo(() => makePulsars(isHero ? 12 : 7), [isHero]);
  const dust = useMemo(() => makeDust(isHero ? 22 : 14), [isHero]);
  const nebulae = useMemo(makeNebulae, []);

  // Mouse parallax — translates whole scene a few px based on cursor.
  const parallaxRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = parallaxRef.current;
    if (!el) return;
    let raf = 0;
    let tx = 0;
    let ty = 0;
    let targetX = 0;
    let targetY = 0;

    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2; // -1..1
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      targetX = x * 14; // max 14px
      targetY = y * 10; // max 10px
    };

    const tick = () => {
      tx += (targetX - tx) * 0.06;
      ty += (targetY - ty) * 0.06;
      el.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Shooting stars & long comets — spawned on independent timers so the
  // sky always has something happening but nothing repetitive.
  const [shots, setShots] = useState<Array<Shot>>([]);
  const [comets, setComets] = useState<Array<Comet>>([]);

  useEffect(() => {
    let cancelled = false;
    let tA: number | undefined;
    let tB: number | undefined;

    const spawnShot = () => {
      if (cancelled) return;
      setShots((prev) => [...prev.slice(-3), makeShot()]);
      tA = window.setTimeout(spawnShot, 1800 + Math.random() * 3800);
    };
    const spawnComet = () => {
      if (cancelled) return;
      setComets((prev) => [...prev.slice(-1), makeComet()]);
      tB = window.setTimeout(spawnComet, 9000 + Math.random() * 14000);
    };

    tA = window.setTimeout(spawnShot, 1200);
    tB = window.setTimeout(spawnComet, 4500);
    return () => {
      cancelled = true;
      if (tA) window.clearTimeout(tA);
      if (tB) window.clearTimeout(tB);
    };
  }, []);

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-0 -z-10 overflow-hidden motion-reduce:hidden ${className}`}
    >
      {/* Deep space gradient base — outside parallax so edges don't show */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#120b26_0%,_#08060f_55%,_#050509_100%)]" />

      {/* Parallax layer (everything inside drifts with the cursor) */}
      <div ref={parallaxRef} className="absolute inset-0 will-change-transform">
        {/* Colored nebula clouds — the main "feel-alive" layer. */}
        {nebulae.map((n, i) => (
          <div
            key={i}
            className={`absolute rounded-full blur-[120px] ${n.anim}`}
            style={{
              top: n.top,
              left: n.left,
              width: n.size,
              height: n.size,
              background: n.color,
              opacity: n.opacity,
              animationDelay: n.delay,
              mixBlendMode: "screen",
            }}
          />
        ))}

        {/* Far nebula wash for additional color depth */}
        <div className="absolute inset-0 bg-grid-fade opacity-70" />

        {/* Parallax starfield — 3 layers */}
        <StarLayer stars={stars.far} className="animate-star-drift-slow opacity-80" />
        <StarLayer stars={stars.mid} className="animate-star-drift opacity-90" />
        <StarLayer stars={stars.near} className="animate-star-drift" />

        {/* Pulsar / hero stars — big, breathing, soft color halo.
            Draws the eye naturally without being loud. */}
        <div className="absolute inset-0">
          {pulsars.map((p, i) => (
            <Pulsar key={i} {...p} />
          ))}
        </div>

        {/* Drifting dust motes — closer, more organic than the stars. */}
        <div className="absolute inset-0">
          {dust.map((d, i) => (
            <span
              key={i}
              className="absolute block rounded-full"
              style={{
                top: d.top,
                left: d.left,
                width: d.size,
                height: d.size,
                background: "rgba(220, 230, 255, 0.5)",
                filter: "blur(0.4px)",
                animation: `float-slower ${d.duration} ease-in-out infinite`,
                animationDelay: d.delay,
              }}
            />
          ))}
        </div>

        {/* Faint constellation SVG — briefly flashes in once every few seconds */}
        {isHero && (
          <svg
            className="pointer-events-none absolute left-[12%] top-[18%] h-48 w-64 animate-constellation-flash text-brand-300/70"
            viewBox="0 0 220 170"
            fill="none"
          >
            <g stroke="currentColor" strokeWidth="0.6">
              <line x1="12" y1="22" x2="60" y2="50" />
              <line x1="60" y1="50" x2="100" y2="34" />
              <line x1="100" y1="34" x2="150" y2="68" />
              <line x1="150" y1="68" x2="200" y2="40" />
              <line x1="60" y1="50" x2="80" y2="110" />
              <line x1="80" y1="110" x2="140" y2="130" />
              <line x1="140" y1="130" x2="150" y2="68" />
            </g>
            <g fill="currentColor">
              {[
                [12, 22],
                [60, 50],
                [100, 34],
                [150, 68],
                [200, 40],
                [80, 110],
                [140, 130],
              ].map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r="1.6" />
              ))}
            </g>
          </svg>
        )}

        {/* Distant galaxy / spinning orbit (hero only) */}
        {isHero && (
          <div className="absolute -right-32 top-[14%] h-[30rem] w-[30rem] opacity-60">
            <div className="relative h-full w-full animate-spin-slowest">
              <div className="absolute inset-0 rounded-full border border-brand/15" />
              <div
                className="absolute inset-[8%] rounded-full border border-accent-cyan/10"
                style={{ transform: "rotate(20deg)" }}
              />
              <div className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 rounded-full bg-brand-300 shadow-[0_0_24px_rgba(167,139,250,1)]" />
              <div
                className="absolute left-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-accent-cyan shadow-[0_0_18px_rgba(34,211,238,0.9)]"
                style={{ transform: "rotate(40deg) translate(0, -2px)" }}
              />
            </div>
            {/* Soft galaxy core */}
            <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-400/20 blur-3xl animate-breathe-slow" />
          </div>
        )}

        {/* Aurora blobs (toned down) */}
        <div
          className={`absolute ${
            isHero
              ? "-top-40 -left-32 h-[36rem] w-[36rem]"
              : "-top-28 -left-24 h-[26rem] w-[26rem]"
          } rounded-full bg-brand-600/18 blur-3xl animate-aurora-a`}
        />
        <div
          className={`absolute ${
            isHero
              ? "top-1/3 -right-40 h-[32rem] w-[32rem]"
              : "top-1/4 -right-32 h-[24rem] w-[24rem]"
          } rounded-full bg-accent-cyan/12 blur-3xl animate-aurora-b`}
        />
        <div
          className={`absolute ${
            isHero
              ? "-bottom-40 left-1/4 h-[34rem] w-[34rem]"
              : "-bottom-32 left-1/3 h-[22rem] w-[22rem]"
          } rounded-full bg-accent-rose/10 blur-3xl animate-aurora-c`}
        />

        {/* Grid overlay — only in hero so app content stays clean */}
        {isHero && (
          <div className="absolute inset-0 bg-grid-lines bg-grid-40 opacity-[0.28] animate-grid-pulse [mask-image:radial-gradient(ellipse_at_center,_black_20%,_transparent_72%)]" />
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
      </div>

      {/* Shooting stars — outside parallax so they feel truly fast */}
      <div className="absolute inset-0">
        {shots.map((s) => (
          <span
            key={s.id}
            className="absolute block h-[2px] w-28 animate-shoot"
            style={{
              top: s.top,
              left: s.left,
              background:
                "linear-gradient(90deg, rgba(255,255,255,0), rgba(220,230,255,0.95) 70%, rgba(140,200,255,0.95))",
              boxShadow: "0 0 10px rgba(180,210,255,0.9)",
              filter: "blur(0.3px)",
            }}
            onAnimationEnd={() =>
              setShots((prev) => prev.filter((p) => p.id !== s.id))
            }
          />
        ))}
      </div>

      {/* Long comets — rarer, bigger, brighter trail */}
      <div className="absolute inset-0">
        {comets.map((c) => (
          <span
            key={c.id}
            className="absolute block h-[3px] w-56 animate-comet"
            style={{
              top: c.top,
              left: c.left,
              background: `linear-gradient(90deg, rgba(255,255,255,0) 0%, ${c.color} 55%, #ffffff 100%)`,
              boxShadow: `0 0 18px ${c.color}, 0 0 40px ${c.color}`,
              borderRadius: "9999px",
              filter: "blur(0.4px)",
            }}
            onAnimationEnd={() =>
              setComets((prev) => prev.filter((p) => p.id !== c.id))
            }
          />
        ))}
      </div>

      {/* Vignette to keep content readable over stars */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_45%,_rgba(5,5,9,0.9)_100%)]" />
    </div>
  );
}

// ------------------------------------------------------------------
// sub-components
// ------------------------------------------------------------------

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
                ? "0 0 6px rgba(255,255,255,0.75), 0 0 14px rgba(139,92,246,0.4)"
                : undefined,
            animation: `twinkle ${s.duration} ease-in-out infinite`,
            animationDelay: s.delay,
          }}
        />
      ))}
    </div>
  );
}

function Pulsar({ top, left, size, color, halo, delay }: PulsarConfig) {
  return (
    <span
      className="absolute block"
      style={{
        top,
        left,
        width: size * 2.4,
        height: size * 2.4,
        transform: "translate(-50%,-50%)",
      }}
    >
      {/* soft halo */}
      <span
        className="absolute inset-0 rounded-full animate-breathe-slow"
        style={{
          background: `radial-gradient(circle, ${halo} 0%, transparent 70%)`,
          animationDelay: delay,
        }}
      />
      {/* bright core */}
      <span
        className="absolute left-1/2 top-1/2 block rounded-full animate-breathe"
        style={{
          width: size,
          height: size,
          marginLeft: -size / 2,
          marginTop: -size / 2,
          background: color,
          boxShadow: `0 0 8px ${color}, 0 0 20px ${halo}`,
          animationDelay: delay,
        }}
      />
    </span>
  );
}

// ------------------------------------------------------------------
// helpers + generators
// ------------------------------------------------------------------

interface Star {
  top: string;
  left: string;
  size: number;
  delay: string;
  duration: string;
  color: string;
}

interface PulsarConfig {
  top: string;
  left: string;
  size: number;
  color: string;
  halo: string;
  delay: string;
}

interface Dust {
  top: string;
  left: string;
  size: number;
  duration: string;
  delay: string;
}

interface NebulaConfig {
  top: string;
  left: string;
  size: string;
  color: string;
  opacity: number;
  anim: string;
  delay: string;
}

interface Shot {
  id: number;
  top: string;
  left: string;
}

interface Comet {
  id: number;
  top: string;
  left: string;
  color: string;
}

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
    "rgba(167,139,250,0.9)",
    "rgba(34,211,238,0.9)",
    "rgba(253,186,116,0.8)",
  ];

  const mk = (sizeMin: number, sizeMax: number, dMin: number, dMax: number) =>
    ({
      top: `${(rand() * 120 - 10).toFixed(2)}%`,
      left: `${(rand() * 120 - 10).toFixed(2)}%`,
      size: Math.max(0.5, rand() * (sizeMax - sizeMin) + sizeMin),
      delay: `${(rand() * 6).toFixed(2)}s`,
      duration: `${(rand() * (dMax - dMin) + dMin).toFixed(2)}s`,
      color: palette[Math.floor(rand() * palette.length)],
    }) as Star;

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

function makePulsars(count: number): PulsarConfig[] {
  const rand = mulberry32(98765);
  const swatches: Array<[string, string]> = [
    ["#a78bfa", "rgba(167,139,250,0.45)"], // brand
    ["#22d3ee", "rgba(34,211,238,0.40)"], // cyan
    ["#fb7185", "rgba(251,113,133,0.40)"], // rose
    ["#fbbf24", "rgba(251,191,36,0.35)"], // amber
    ["#f0abfc", "rgba(240,171,252,0.40)"], // pink
    ["#ffffff", "rgba(200,220,255,0.50)"], // white
  ];
  const out: PulsarConfig[] = [];
  for (let i = 0; i < count; i++) {
    const s = swatches[Math.floor(rand() * swatches.length)];
    out.push({
      top: `${(rand() * 90 + 5).toFixed(2)}%`,
      left: `${(rand() * 96 + 2).toFixed(2)}%`,
      size: 2.5 + rand() * 2.5,
      color: s[0],
      halo: s[1],
      delay: `${(rand() * 5).toFixed(2)}s`,
    });
  }
  return out;
}

function makeDust(count: number): Dust[] {
  const rand = mulberry32(42);
  const out: Dust[] = [];
  for (let i = 0; i < count; i++) {
    out.push({
      top: `${(rand() * 100).toFixed(2)}%`,
      left: `${(rand() * 100).toFixed(2)}%`,
      size: 1 + rand() * 1.4,
      duration: `${(rand() * 10 + 10).toFixed(2)}s`,
      delay: `${(rand() * 8).toFixed(2)}s`,
    });
  }
  return out;
}

function makeNebulae(): NebulaConfig[] {
  return [
    {
      top: "10%",
      left: "60%",
      size: "40rem",
      color:
        "radial-gradient(circle, rgba(167,139,250,0.55), rgba(167,139,250,0) 60%)",
      opacity: 0.75,
      anim: "animate-nebula-drift",
      delay: "0s",
    },
    {
      top: "55%",
      left: "-8%",
      size: "44rem",
      color:
        "radial-gradient(circle, rgba(34,211,238,0.45), rgba(34,211,238,0) 60%)",
      opacity: 0.7,
      anim: "animate-nebula-drift-rev",
      delay: "2s",
    },
    {
      top: "70%",
      left: "55%",
      size: "38rem",
      color:
        "radial-gradient(circle, rgba(251,113,133,0.35), rgba(251,113,133,0) 60%)",
      opacity: 0.6,
      anim: "animate-nebula-drift",
      delay: "4s",
    },
    {
      top: "-10%",
      left: "15%",
      size: "30rem",
      color:
        "radial-gradient(circle, rgba(240,171,252,0.35), rgba(240,171,252,0) 60%)",
      opacity: 0.6,
      anim: "animate-nebula-drift-rev",
      delay: "6s",
    },
  ];
}

function makeShot(): Shot {
  return {
    id: Math.floor(Math.random() * 1e9),
    top: `${Math.round(Math.random() * 60)}%`,
    left: `${Math.round(Math.random() * 30 - 10)}%`,
  };
}

function makeComet(): Comet {
  const palette = [
    "rgba(167,139,250,0.95)",
    "rgba(34,211,238,0.95)",
    "rgba(251,113,133,0.9)",
    "rgba(251,191,36,0.9)",
  ];
  return {
    id: Math.floor(Math.random() * 1e9),
    top: `${10 + Math.round(Math.random() * 40)}%`,
    left: `${-15 - Math.round(Math.random() * 10)}%`,
    color: palette[Math.floor(Math.random() * palette.length)],
  };
}
