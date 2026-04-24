import type { LeetCodeProfile, User, UserBadge, Badge } from "@prisma/client";
import {
  levelFromXp,
  xpIntoLevel,
  xpToNextLevel,
  LEVEL_SIZE,
} from "../utils/game";

type UserWithExtras = User & {
  leetcodeProfile?: LeetCodeProfile | null;
  badges?: (UserBadge & { badge: Badge })[];
};

export function publicUser(
  user: UserWithExtras,
  opts: { includeEmail?: boolean } = {}
) {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    email: opts.includeEmail ? user.email : undefined,
    xp: user.xp,
    level: user.level,
    levelProgress: {
      intoLevel: xpIntoLevel(user.xp),
      levelSize: LEVEL_SIZE,
      toNextLevel: xpToNextLevel(user.xp),
      ratio: xpIntoLevel(user.xp) / LEVEL_SIZE,
    },
    computedLevel: levelFromXp(user.xp),
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
    weeklyXp: user.weeklyXp,
    weeklySolved: user.weeklySolved,
    rivalId: user.rivalId,
    leetcode: user.leetcodeProfile
      ? {
          username: user.leetcodeProfile.leetcodeUsername,
          ranking: user.leetcodeProfile.ranking,
          totalSolved: user.leetcodeProfile.totalSolved,
          easySolved: user.leetcodeProfile.easySolved,
          mediumSolved: user.leetcodeProfile.mediumSolved,
          hardSolved: user.leetcodeProfile.hardSolved,
          acceptanceRate: user.leetcodeProfile.acceptanceRate,
          lastSyncedAt: user.leetcodeProfile.lastSyncedAt,
          recentSubmissions: user.leetcodeProfile.recentSubmissions,
        }
      : null,
    badges:
      user.badges?.map((ub) => ({
        key: ub.badge.key,
        name: ub.badge.name,
        description: ub.badge.description,
        icon: ub.badge.icon,
        tier: ub.badge.tier,
        awardedAt: ub.awardedAt,
      })) ?? [],
    createdAt: user.createdAt,
  };
}

export type PublicUser = ReturnType<typeof publicUser>;
