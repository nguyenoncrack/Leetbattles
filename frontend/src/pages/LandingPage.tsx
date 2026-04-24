import type { ComponentType, SVGProps } from "react";
import { Link } from "react-router-dom";
import { AnimatedBackground } from "../components/AnimatedBackground";
import { CursorSpotlight } from "../components/CursorSpotlight";
import {
  IconArrowUp,
  IconBolt,
  IconBrain,
  IconChartUp,
  IconCheckCircle,
  IconDrop,
  IconFlame,
  IconGear,
  IconSkull,
  IconSwords,
  IconTarget,
  IconTrophy,
} from "../components/icons";
import { Logo, WordMark } from "../components/Logo";
import { ParticleField } from "../components/ParticleField";
import { Reveal } from "../components/Reveal";

type SvgIcon = ComponentType<
  SVGProps<SVGSVGElement> & { size?: number | string; gradient?: boolean }
>;

const FEATURES: Array<{ Icon: SvgIcon; title: string; body: string }> = [
  {
    Icon: IconSwords,
    title: "Compete with friends",
    body: "Connect your public LeetCode profile and put your grind on the line.",
  },
  {
    Icon: IconBolt,
    title: "Earn XP for every solve",
    body: "10 XP Easy · 25 XP Medium · 50 XP Hard. Streaks and weekly wins stack bonuses.",
  },
  {
    Icon: IconTarget,
    title: "Weekly challenges",
    body: "Fresh missions every Monday. Complete them all to climb the weekly ladder.",
  },
  {
    Icon: IconTrophy,
    title: "Leaderboards",
    body: "Global, weekly, and friends-only boards. Bragging rights included.",
  },
];

const XP_ROWS = [
  { label: "Easy problem", xp: 10, tone: "text-accent-green" },
  { label: "Medium problem", xp: 25, tone: "text-accent-amber" },
  { label: "Hard problem", xp: 50, tone: "text-accent-rose" },
  { label: "Daily streak", xp: 20, tone: "text-accent-cyan" },
  { label: "Weekly challenge", xp: 100, tone: "text-brand-400" },
];

const TICKER_ITEMS: Array<{ Icon: SvgIcon; text: string; tone?: string }> = [
  { Icon: IconBolt, text: "+250 XP", tone: "text-brand-300" },
  { Icon: IconFlame, text: "7-day streak" },
  { Icon: IconTrophy, text: "Medium Menace unlocked", tone: "text-accent-amber" },
  { Icon: IconSwords, text: "Passed @rival", tone: "text-accent-cyan" },
  { Icon: IconCheckCircle, text: "Weekly challenge complete", tone: "text-accent-green" },
  { Icon: IconSkull, text: "Hard solved · +50 XP", tone: "text-slate-200" },
  { Icon: IconDrop, text: "First Blood", tone: "text-accent-rose" },
  { Icon: IconArrowUp, text: "Level 5", tone: "text-brand-300" },
  { Icon: IconChartUp, text: "Rank ↑ 12", tone: "text-accent-green" },
  { Icon: IconBrain, text: "3 Medium today", tone: "text-accent-amber" },
];

export function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden text-slate-100">
      <AnimatedBackground variant="hero" />
      <CursorSpotlight />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <Logo className="h-8 w-8" />
          <WordMark className="text-xl" />
        </div>
        <nav className="flex items-center gap-2 text-sm">
          <Link to="/leaderboard" className="btn-ghost hidden sm:inline-flex">
            Leaderboard
          </Link>
          <Link to="/login" className="btn-ghost">
            Sign in
          </Link>
          <Link to="/register" className="btn-primary btn-pulse">
            Get started
          </Link>
        </nav>
      </header>

      {/* HERO */}
      <section className="relative">
        <div className="pointer-events-none absolute inset-0">
          <ParticleField density={0.9} linkDistance={130} />
        </div>
        <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-6 pb-16 pt-10 md:grid-cols-2 md:pt-24">
          <Reveal>
            <div className="chip mb-4">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-green opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent-green" />
              </span>
              LeetCode × Duolingo × Ranked ladder
            </div>
            <h1 className="text-4xl font-extrabold leading-tight md:text-6xl">
              Turn <span className="text-brand-400">LeetCode</span> into a{" "}
              <span className="bg-gradient-to-r from-brand-400 via-accent-cyan to-brand-400 bg-[length:200%_100%] bg-clip-text text-transparent animate-shine glitch-text">
                game
              </span>
              .
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-300">
              Compete with friends on LeetCode. Track problems solved, earn XP,
              complete weekly challenges, keep your streak alive, and climb a
              ranked leaderboard together.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                to="/register"
                className="btn-primary btn-pulse px-6 py-3 text-base"
              >
                Get Started
              </Link>
              <Link
                to="/leaderboard"
                className="btn-secondary px-6 py-3 text-base"
              >
                View Leaderboard
              </Link>
            </div>
            <div className="mt-6 text-xs text-slate-500">
              Uses public LeetCode profiles only — no passwords, ever.
            </div>
          </Reveal>

          <Reveal delay={120}>
            <HeroVisual />
          </Reveal>
        </div>

        {/* TICKER */}
        <div className="relative mx-auto mt-4 w-full border-y border-ink-800/80 bg-ink-900/40 py-3 backdrop-blur-sm">
          <div className="marquee">
            <Ticker />
            <Ticker />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="relative mx-auto w-full max-w-6xl px-6 pb-20 pt-20">
        <Reveal>
          <h2 className="text-2xl font-bold md:text-3xl">Why CodeClash?</h2>
          <p className="mt-1 text-slate-400">
            The grind is better with a little competition.
          </p>
        </Reveal>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 90}>
              <div className="card card-hover tilt relative overflow-hidden p-5">
                <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-brand-400/0 via-brand-400/0 to-accent-cyan/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-brand/30 bg-gradient-to-br from-brand/15 to-accent-cyan/10 shadow-[0_0_24px_rgba(124,92,255,0.25)]">
                  <span className="glitch">
                    <f.Icon size={22} gradient />
                  </span>
                </div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-slate-400">{f.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* XP + BADGES */}
      <section className="mx-auto grid w-full max-w-6xl gap-8 px-6 pb-24 md:grid-cols-2">
        <Reveal>
          <div className="card tilt p-6">
            <h3 className="text-lg font-bold">XP table</h3>
            <p className="mt-1 text-sm text-slate-400">
              Every solve counts toward your level.
            </p>
            <ul className="mt-4 divide-y divide-ink-700/70 text-sm">
              {XP_ROWS.map((r) => (
                <li
                  key={r.label}
                  className="flex items-center justify-between py-2.5"
                >
                  <span className="text-slate-200">{r.label}</span>
                  <span className={`font-bold ${r.tone}`}>+{r.xp} XP</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-slate-500">
              Level = floor(XP / 500) + 1. Every 500 XP = new rank.
            </p>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="card tilt p-6">
            <h3 className="text-lg font-bold">Unlockable badges</h3>
            <p className="mt-1 text-sm text-slate-400">Wear your wins.</p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              {(
                [
                  { n: "First Blood", Icon: IconDrop, d: "First tracked problem", tone: "from-rose-500/25 to-rose-900/10 text-rose-200" },
                  { n: "Grinder", Icon: IconGear, d: "10 solves in a week", tone: "from-slate-400/25 to-slate-700/10 text-slate-100" },
                  { n: "Medium Menace", Icon: IconFlame, d: "20 Medium problems", tone: "from-amber-400/25 to-rose-600/10 text-amber-100" },
                  { n: "Hardcore", Icon: IconSkull, d: "5 Hard problems", tone: "from-fuchsia-500/25 to-indigo-700/10 text-fuchsia-100" },
                  { n: "Consistency Demon", Icon: IconBolt, d: "7-day streak", tone: "from-brand/30 to-accent-cyan/15 text-brand-100" },
                ] as Array<{ n: string; Icon: SvgIcon; d: string; tone: string }>
              ).map((b) => (
                <div
                  key={b.n}
                  className="rounded-xl border border-ink-700 bg-ink-800/60 p-3 transition-transform hover:-translate-y-0.5 hover:border-brand/40"
                >
                  <div
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${b.tone} ring-1 ring-white/5`}
                  >
                    <b.Icon size={18} />
                  </div>
                  <div className="mt-2 font-semibold">{b.n}</div>
                  <div className="text-xs text-slate-400">{b.d}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <footer className="relative z-10 mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 border-t border-ink-800 px-6 py-6 text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <Logo className="h-5 w-5" />
          <span>© {new Date().getFullYear()} CodeClash</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/leaderboard" className="hover:text-slate-300">
            Leaderboard
          </Link>
          <Link to="/login" className="hover:text-slate-300">
            Sign in
          </Link>
          <Link to="/register" className="hover:text-slate-300">
            Register
          </Link>
        </div>
      </footer>
    </div>
  );
}

function Ticker() {
  return (
    <div className="marquee__track pr-9">
      {TICKER_ITEMS.map((t, i) => (
        <span
          key={i}
          className="inline-flex items-center whitespace-nowrap text-sm font-medium text-slate-300"
        >
          <span className="mr-4 inline-block h-1 w-1 rounded-full bg-brand-400/70" />
          <t.Icon size={16} className={`mr-1.5 ${t.tone ?? "text-brand-300"}`} />
          {t.text}
        </span>
      ))}
    </div>
  );
}

function HeroVisual() {
  return (
    <div className="relative">
      <div className="absolute -inset-10 -z-10 rounded-[36px] bg-gradient-to-br from-brand/25 via-transparent to-accent-cyan/15 blur-3xl" />

      <div className="card tilt relative overflow-hidden p-6 shadow-glow">
        {/* Orbiting ring */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="relative h-80 w-80">
            <div className="absolute inset-0 rounded-full border border-brand/20" />
            <div className="absolute inset-6 rounded-full border border-accent-cyan/15" />
            <div className="absolute inset-12 rounded-full border border-brand/10 animate-spin-slow" />
            <div className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full bg-brand-400 shadow-glow animate-spin-slow" />
          </div>
        </div>

        <div className="relative flex items-center justify-between">
          <div className="chip">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-cyan opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent-cyan" />
            </span>
            Live sync
          </div>
          <div className="text-xs text-slate-400">codeclash.sync()</div>
        </div>

        <pre className="relative mt-4 overflow-hidden rounded-xl border border-ink-700 bg-ink-900/80 p-4 font-mono text-[13px] leading-relaxed text-slate-300">
          <code>
            <span className="text-slate-500">// pulling your LeetCode stats…</span>
            {"\n"}
            <span className="text-brand-400">const</span> you ={" "}
            <span className="text-accent-cyan">await</span> leetcode.fetch();
            {"\n"}
            you.<span className="text-accent-amber">xp</span>       +={" "}
            <span className="text-accent-green">+250</span>
            {"\n"}
            you.<span className="text-accent-amber">streak</span>   ={" "}
            <span className="inline-flex items-center gap-1 text-accent-green">
              7
              <IconFlame size={14} />
            </span>
            {"\n"}
            you.<span className="text-accent-amber">rank</span>     ={" "}
            <span className="text-accent-rose">#1 this week</span>
            {"\n"}
            <span className="text-brand-400">return</span> clash(you, friends);
          </code>
          <span className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-ink-900/80 to-transparent" />
        </pre>

        <div className="relative mt-4 grid grid-cols-3 gap-2 text-center text-xs">
          {[
            { k: "XP", v: "+250", c: "text-brand-400" },
            { k: "Streak", v: "7d", c: "text-accent-cyan" },
            { k: "Rank", v: "↑ 12", c: "text-accent-green" },
          ].map((s) => (
            <div
              key={s.k}
              className="rounded-xl border border-ink-700 bg-ink-800/70 p-3"
            >
              <div className="text-[10px] uppercase tracking-wider text-slate-500">
                {s.k}
              </div>
              <div className={`mt-1 text-base font-bold ${s.c}`}>{s.v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
