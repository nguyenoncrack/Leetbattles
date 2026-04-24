// Central game math so every corner of the app agrees on points and levels.

export const XP = {
  EASY: 10,
  MEDIUM: 25,
  HARD: 50,
  DAILY_STREAK: 20,
  WEEKLY_CHALLENGE: 100,
} as const;

export const LEVEL_SIZE = 500;

export function levelFromXp(totalXp: number): number {
  return Math.floor(totalXp / LEVEL_SIZE) + 1;
}

export function xpIntoLevel(totalXp: number): number {
  return totalXp % LEVEL_SIZE;
}

export function xpToNextLevel(totalXp: number): number {
  return LEVEL_SIZE - xpIntoLevel(totalXp);
}

export function levelProgress(totalXp: number): number {
  return xpIntoLevel(totalXp) / LEVEL_SIZE;
}

export function xpForSolveDelta(delta: {
  easy?: number;
  medium?: number;
  hard?: number;
}): number {
  const e = Math.max(0, delta.easy ?? 0);
  const m = Math.max(0, delta.medium ?? 0);
  const h = Math.max(0, delta.hard ?? 0);
  return e * XP.EASY + m * XP.MEDIUM + h * XP.HARD;
}

// Returns Monday 00:00 UTC for the week containing `date`.
export function weekStart(date = new Date()): Date {
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
  const day = d.getUTCDay(); // 0 = Sun … 6 = Sat
  const diff = (day + 6) % 7; // days since Monday
  d.setUTCDate(d.getUTCDate() - diff);
  return d;
}

export function isSameUTCDay(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

export function isYesterdayUTC(previous: Date, now: Date): boolean {
  const y = new Date(now);
  y.setUTCDate(y.getUTCDate() - 1);
  return isSameUTCDay(previous, y);
}
