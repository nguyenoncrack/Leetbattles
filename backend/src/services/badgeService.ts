import { prisma } from "../lib/prisma";
import { recordActivity } from "./activityService";

// A rule examines the latest user state and returns true when the badge
// should be awarded. Keep rules pure — read from a snapshot passed in.
interface Rule {
  key: string;
  check: (s: Snapshot) => boolean;
}

interface Snapshot {
  totalSolved: number;
  mediumSolved: number;
  hardSolved: number;
  currentStreak: number;
  weeklySolved: number;
}

const RULES: Rule[] = [
  { key: "first_blood", check: (s) => s.totalSolved >= 1 },
  { key: "grinder", check: (s) => s.weeklySolved >= 10 },
  { key: "medium_menace", check: (s) => s.mediumSolved >= 20 },
  { key: "hardcore", check: (s) => s.hardSolved >= 5 },
  { key: "consistency_demon", check: (s) => s.currentStreak >= 7 },
];

export async function maybeAwardBadges(userId: string): Promise<string[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { leetcodeProfile: true, badges: true },
  });
  if (!user) return [];

  const snap: Snapshot = {
    totalSolved: user.leetcodeProfile?.totalSolved ?? 0,
    mediumSolved: user.leetcodeProfile?.mediumSolved ?? 0,
    hardSolved: user.leetcodeProfile?.hardSolved ?? 0,
    currentStreak: user.currentStreak,
    weeklySolved: user.weeklySolved,
  };

  const already = new Set<string>();
  for (const ub of user.badges) already.add(ub.badgeId);

  const badgesByKey = await prisma.badge.findMany({
    where: { key: { in: RULES.map((r) => r.key) } },
  });
  const map = new Map(badgesByKey.map((b) => [b.key, b]));

  const awarded: string[] = [];
  for (const rule of RULES) {
    const badge = map.get(rule.key);
    if (!badge || already.has(badge.id)) continue;
    if (!rule.check(snap)) continue;

    await prisma.userBadge.create({
      data: { userId, badgeId: badge.id },
    });
    await recordActivity(
      userId,
      "BADGE_EARNED",
      `Earned the "${badge.name}" badge`,
      { badgeKey: badge.key, badgeIcon: badge.icon }
    );
    awarded.push(badge.name);
  }
  return awarded;
}
