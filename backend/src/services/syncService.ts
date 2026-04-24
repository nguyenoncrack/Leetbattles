import type { ChallengeKind, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { fetchLeetcodeProfile } from "./leetcode";
import { BadRequest, NotFound } from "../utils/errors";
import { env } from "../utils/env";
import {
  XP,
  isSameUTCDay,
  isYesterdayUTC,
  levelFromXp,
  weekStart,
  xpForSolveDelta,
} from "../utils/game";
import { maybeAwardBadges } from "./badgeService";
import { recordActivity } from "./activityService";

export interface SyncResult {
  xpGained: number;
  solvedDelta: { easy: number; medium: number; hard: number; total: number };
  leveledUp: boolean;
  previousLevel: number;
  newLevel: number;
  streak: number;
  passedRival: { username: string; displayName: string } | null;
  challengesCompleted: string[];
  badgesEarned: string[];
}

// Connect or refresh a user's LeetCode profile, compute deltas, award XP,
// update streak, weekly stats, challenges and badges — all in one transaction.
export async function syncUserLeetcode(
  userId: string,
  opts: { force?: boolean } = {}
): Promise<SyncResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { leetcodeProfile: true, rival: true },
  });
  if (!user) throw NotFound("User not found");
  if (!user.leetcodeProfile) {
    throw BadRequest(
      "Connect a LeetCode username first via POST /api/leetcode/connect"
    );
  }

  const now = new Date();
  const cacheMs = env.LEETCODE_CACHE_MINUTES * 60 * 1000;
  const lastSync = user.leetcodeProfile.lastSyncedAt;
  if (!opts.force && lastSync && now.getTime() - lastSync.getTime() < cacheMs) {
    return emptyResult(user.level, user.currentStreak);
  }

  const fresh = await fetchLeetcodeProfile(user.leetcodeProfile.leetcodeUsername);

  const prev = user.leetcodeProfile;
  const solvedDelta = {
    easy: Math.max(0, fresh.easySolved - prev.easySolved),
    medium: Math.max(0, fresh.mediumSolved - prev.mediumSolved),
    hard: Math.max(0, fresh.hardSolved - prev.hardSolved),
    total: 0,
  };
  solvedDelta.total =
    solvedDelta.easy + solvedDelta.medium + solvedDelta.hard;

  let xpGained = xpForSolveDelta(solvedDelta);

  // Streak logic — only grant the bonus if the user actually solved today
  // and wasn't already credited for today.
  let streak = user.currentStreak;
  let longestStreak = user.longestStreak;
  const last = user.lastActivityAt;
  const solvedSomething = solvedDelta.total > 0;
  let streakBonusGranted = false;

  if (solvedSomething) {
    if (!last) {
      streak = 1;
    } else if (isSameUTCDay(last, now)) {
      // already counted today — no change
    } else if (isYesterdayUTC(last, now)) {
      streak += 1;
      streakBonusGranted = true;
      xpGained += XP.DAILY_STREAK;
    } else {
      streak = 1;
    }
    if (streak > longestStreak) longestStreak = streak;
  }

  const previousLevel = user.level;
  const newXp = user.xp + xpGained;
  const newLevel = levelFromXp(newXp);
  const leveledUp = newLevel > previousLevel;

  // Weekly bucket — reset if we've crossed into a new week.
  const thisWeekStart = weekStart(now);
  const inNewWeek =
    !user.weekResetAt ||
    user.weekResetAt.getTime() < thisWeekStart.getTime();
  const newWeeklyXp = (inNewWeek ? 0 : user.weeklyXp) + xpGained;
  const newWeeklySolved =
    (inNewWeek ? 0 : user.weeklySolved) + solvedDelta.total;

  // Rival pass detection — computed before the update.
  let passedRival: SyncResult["passedRival"] = null;
  if (user.rival && user.xp <= user.rival.xp && newXp > user.rival.xp) {
    passedRival = {
      username: user.rival.username,
      displayName: user.rival.displayName,
    };
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.leetCodeProfile.update({
      where: { userId },
      data: {
        ranking: fresh.ranking,
        totalSolved: fresh.totalSolved,
        easySolved: fresh.easySolved,
        mediumSolved: fresh.mediumSolved,
        hardSolved: fresh.hardSolved,
        acceptanceRate: fresh.acceptanceRate,
        recentSubmissions: fresh.recentSubmissions as unknown as Prisma.InputJsonValue,
        lastSyncedAt: now,
      },
    });

    await tx.user.update({
      where: { id: userId },
      data: {
        xp: newXp,
        level: newLevel,
        currentStreak: streak,
        longestStreak,
        lastActivityAt: solvedSomething ? now : user.lastActivityAt,
        weeklyXp: newWeeklyXp,
        weeklySolved: newWeeklySolved,
        weekResetAt: thisWeekStart,
      },
    });

    return { newXp, newLevel };
  });

  // Side-effects: challenge progress, badges, activity.
  const challengesCompleted = await progressChallenges(
    userId,
    solvedDelta,
    thisWeekStart
  );

  const badgesEarned = await maybeAwardBadges(userId);

  if (solvedDelta.total > 0) {
    await recordActivity(userId, "SOLVED_PROBLEMS", buildSolveMessage(solvedDelta), {
      solvedDelta,
      xpGained,
      streakBonusGranted,
    });
  }
  if (leveledUp) {
    await recordActivity(
      userId,
      "LEVELED_UP",
      `Reached Level ${updated.newLevel}`,
      { from: previousLevel, to: updated.newLevel }
    );
  }
  if (passedRival) {
    await recordActivity(
      userId,
      "PASSED_RIVAL",
      `Passed rival @${passedRival.username} on the leaderboard`,
      passedRival
    );
  }

  return {
    xpGained,
    solvedDelta,
    leveledUp,
    previousLevel,
    newLevel,
    streak,
    passedRival,
    challengesCompleted,
    badgesEarned,
  };
}

function buildSolveMessage(delta: SyncResult["solvedDelta"]): string {
  const parts: string[] = [];
  if (delta.easy) parts.push(`${delta.easy} Easy`);
  if (delta.medium) parts.push(`${delta.medium} Medium`);
  if (delta.hard) parts.push(`${delta.hard} Hard`);
  const phrase = parts.join(", ");
  return `Solved ${phrase || delta.total + " problems"}`;
}

function emptyResult(level: number, streak: number): SyncResult {
  return {
    xpGained: 0,
    solvedDelta: { easy: 0, medium: 0, hard: 0, total: 0 },
    leveledUp: false,
    previousLevel: level,
    newLevel: level,
    streak,
    passedRival: null,
    challengesCompleted: [],
    badgesEarned: [],
  };
}

// --- Weekly challenges -------------------------------------------------

async function progressChallenges(
  userId: string,
  delta: { easy: number; medium: number; hard: number; total: number },
  weekStartDate: Date
): Promise<string[]> {
  const challenges = await prisma.weeklyChallenge.findMany({
    where: { weekStart: weekStartDate },
  });
  if (challenges.length === 0) return [];

  const completed: string[] = [];

  for (const ch of challenges) {
    const increment = deltaForKind(ch.kind, delta);
    if (increment <= 0) {
      // Still make sure a row exists so the UI can render progress.
      await prisma.userChallengeProgress.upsert({
        where: {
          userId_challengeId: { userId, challengeId: ch.id },
        },
        update: {},
        create: { userId, challengeId: ch.id, progress: 0 },
      });
      continue;
    }

    const existing = await prisma.userChallengeProgress.upsert({
      where: { userId_challengeId: { userId, challengeId: ch.id } },
      create: {
        userId,
        challengeId: ch.id,
        progress: Math.min(ch.target, increment),
      },
      update: {
        progress: { increment },
      },
    });

    if (!existing.completed && existing.progress >= ch.target) {
      await prisma.userChallengeProgress.update({
        where: { id: existing.id },
        data: { completed: true, completedAt: new Date() },
      });
      await prisma.user.update({
        where: { id: userId },
        data: {
          xp: { increment: XP.WEEKLY_CHALLENGE },
          weeklyXp: { increment: XP.WEEKLY_CHALLENGE },
        },
      });
      // Recompute level after the bonus.
      const u = await prisma.user.findUnique({ where: { id: userId } });
      if (u) {
        await prisma.user.update({
          where: { id: userId },
          data: { level: levelFromXp(u.xp) },
        });
      }
      await recordActivity(
        userId,
        "CHALLENGE_COMPLETED",
        `Completed weekly challenge: ${ch.title}`,
        { challengeId: ch.id, xpReward: ch.xpReward }
      );
      completed.push(ch.title);
    }
  }

  return completed;
}

function deltaForKind(
  kind: ChallengeKind,
  delta: { easy: number; medium: number; hard: number; total: number }
): number {
  switch (kind) {
    case "SOLVE_EASY":
      return delta.easy;
    case "SOLVE_MEDIUM":
      return delta.medium;
    case "SOLVE_HARD":
      return delta.hard;
    case "SOLVE_TOTAL":
      return delta.total;
  }
}
