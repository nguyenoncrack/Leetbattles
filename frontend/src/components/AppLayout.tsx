import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AnimatedBackground } from "./AnimatedBackground";
import { Avatar } from "./Avatar";
import { BackgroundMusic } from "./BackgroundMusic";
import {
  IconHome,
  IconMenu,
  IconPulse,
  IconTarget,
  IconTrophy,
  IconUsers,
} from "./icons";
import { Logo, WordMark } from "./Logo";
import type { ComponentType, SVGProps } from "react";
import { useState } from "react";

type NavIcon = ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>;

const NAV: Array<{ to: string; label: string; Icon: NavIcon }> = [
  { to: "/app", label: "Dashboard", Icon: IconHome },
  { to: "/app/leaderboard", label: "Leaderboard", Icon: IconTrophy },
  { to: "/app/friends", label: "Friends", Icon: IconUsers },
  { to: "/app/challenges", label: "Challenges", Icon: IconTarget },
  { to: "/app/activity", label: "Activity", Icon: IconPulse },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground variant="app" glyphs={false} />
      <BackgroundMusic />
      {/* z-40: keeps the sidebar above <main>. Without this, <main> (which
          paints after aside and spans full viewport width via its padding)
          wins hit-testing on the left strip and sidebar clicks don't land. */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-40 w-64 flex-col border-r border-ink-800/70 bg-ink-900/55 backdrop-blur-md">
        {/* soft brand glow wash behind the sidebar header */}
        <div className="pointer-events-none absolute -top-16 left-0 right-0 h-40 bg-gradient-to-b from-brand/15 via-brand/5 to-transparent blur-2xl" />
        <NavLink
          to="/app"
          className="relative flex items-center gap-2 px-5 py-5"
        >
          <span className="glow-breathe">
            <Logo className="h-9 w-9" />
          </span>
          <WordMark className="text-xl" />
        </NavLink>
        <nav className="relative flex-1 space-y-1 px-3">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/app"}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-brand/25 via-brand/10 to-transparent text-white ring-1 ring-brand/40 shadow-[0_0_24px_-8px_rgba(139,92,246,0.7)]"
                    : "text-slate-400 hover:translate-x-0.5 hover:bg-ink-800/60 hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Animated pulse dot + accent bar on active link */}
                  {isActive && (
                    <>
                      <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r bg-gradient-to-b from-brand-300 via-brand-400 to-accent-cyan shadow-[0_0_12px_rgba(139,92,246,0.8)]" />
                      <span className="pulse-dot absolute right-3 top-1/2 -translate-y-1/2" />
                    </>
                  )}
                  <item.Icon
                    size={18}
                    className={
                      isActive
                        ? "text-brand-300 drop-shadow-[0_0_6px_rgba(167,139,250,0.8)]"
                        : "text-slate-500 group-hover:text-brand/90 transition-colors"
                    }
                  />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        {user && (
          <div className="border-t border-ink-800 p-3">
            <NavLink
              to={`/app/profile/${user.username}`}
              className="group flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-ink-800"
            >
              <div className="relative">
                <Avatar
                  url={user.avatarUrl}
                  name={user.displayName}
                  size={36}
                />
                <span
                  aria-hidden
                  className="pulse-live absolute -right-0.5 -bottom-0.5 ring-2 ring-ink-900"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-white">
                  {user.displayName}
                </div>
                <div className="truncate text-xs text-slate-400">
                  Lv {user.level} · {user.xp.toLocaleString()} XP
                </div>
              </div>
            </NavLink>
            <button
              onClick={() => {
                logout();
                nav("/");
              }}
              className="mt-2 w-full rounded-xl px-3 py-2 text-left text-xs text-slate-400 hover:bg-ink-800 hover:text-white"
            >
              Sign out
            </button>
          </div>
        )}
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-ink-800 bg-ink-900/80 px-4 py-3 backdrop-blur md:hidden">
        <NavLink to="/app" className="flex items-center gap-2">
          <Logo className="h-7 w-7" />
          <WordMark className="text-lg" />
        </NavLink>
        <button
          className="btn-ghost"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <IconMenu size={20} />
        </button>
      </header>
      {menuOpen && (
        <div className="md:hidden sticky top-[53px] z-20 border-b border-ink-800 bg-ink-900/95 p-2">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/app"}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium ${
                  isActive
                    ? "bg-brand/15 text-white"
                    : "text-slate-300 hover:bg-ink-800"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.Icon
                    size={18}
                    className={isActive ? "text-brand" : "text-slate-400"}
                  />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
          {user && (
            <button
              onClick={() => {
                logout();
                nav("/");
              }}
              className="mt-1 w-full rounded-xl px-3 py-2 text-left text-sm text-slate-400 hover:bg-ink-800 hover:text-white"
            >
              Sign out
            </button>
          )}
        </div>
      )}

      {/* md:ml-64 (margin, not padding) so <main>'s box starts AFTER the
          sidebar — otherwise main extends under the sidebar and eats its
          click events. The aurora blobs live inside main so they're still
          constrained to the content area. */}
      <main className="relative md:ml-64">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-[1] overflow-hidden"
        >
          <div className="absolute -top-40 left-10 h-96 w-96 rounded-full bg-brand/10 blur-3xl animate-aurora-a" />
          <div className="absolute top-1/2 right-0 h-96 w-96 rounded-full bg-accent-cyan/10 blur-3xl animate-aurora-b" />
        </div>
        <div className="mx-auto w-full max-w-6xl p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
