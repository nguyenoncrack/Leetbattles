import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, type AuthedRequest } from "../middleware/auth";
import { syncUserLeetcode } from "../services/syncService";
import { asyncHandler } from "../utils/async";
import { weekStart } from "../utils/game";

const router = Router();

router.get(
  "/weekly",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { userId } = req as AuthedRequest;
    const start = weekStart();
    const challenges = await prisma.weeklyChallenge.findMany({
      where: { weekStart: start },
      orderBy: { xpReward: "asc" },
    });
    const progress = await prisma.userChallengeProgress.findMany({
      where: { userId, challengeId: { in: challenges.map((c) => c.id) } },
    });
    const byId = new Map(progress.map((p) => [p.challengeId, p]));

    res.json({
      weekStart: start,
      challenges: challenges.map((c) => {
        const p = byId.get(c.id);
        const current = Math.min(p?.progress ?? 0, c.target);
        return {
          id: c.id,
          title: c.title,
          description: c.description,
          kind: c.kind,
          target: c.target,
          xpReward: c.xpReward,
          progress: current,
          completed: p?.completed ?? false,
          ratio: current / c.target,
        };
      }),
    });
  })
);

router.post(
  "/check-progress",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { userId } = req as AuthedRequest;
    // "Checking progress" = re-sync LeetCode stats which naturally advances
    // any weekly challenge rows. Caches respected unless `force: true`.
    const result = await syncUserLeetcode(userId, { force: true });
    res.json(result);
  })
);

export default router;
