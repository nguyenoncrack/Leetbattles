import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AnimatedBackground } from "./AnimatedBackground";
import { Avatar } from "./Avatar";
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
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 flex-col border-r border-ink-800 bg-ink-900/80 backdrop-blur">
        <NavLink to="/app" className="flex items-center gap-2 px-5 py-5">
          <Logo className="h-9 w-9" />
          <WordMark className="text-xl" />
        </NavLink>
        <nav className="flex-1 space-y-1 px-3">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/app"}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-brand/15 text-white ring-1 ring-brand/30"
                    : "text-slate-400 hover:bg-ink-800 hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.Icon
                    size={18}
                    className={
                      isActive
                        ? "text-brand"
                        : "text-slate-500 group-hover:text-brand/90"
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
              className="flex items-center gap-3 rounded-xl p-2 hover:bg-ink-800"
            >
              <Avatar url={user.avatarUrl} name={user.displayName} size={36} />
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

      <main className="md:pl-64">
        <div className="mx-auto w-full max-w-6xl p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
