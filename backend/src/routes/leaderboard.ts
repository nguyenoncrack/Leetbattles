import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, type AuthedRequest } from "../middleware/auth";
import { getFriendIds } from "../services/friendshipService";
import { asyncHandler } from "../utils/async";

const router = Router();

type Board = "global" | "weekly" | "friends";

function rowFromUser(
  u: Awaited<ReturnType<typeof prisma.user.findMany>>[number] & {
    leetcodeProfile: any;
  },
  rank: number
) {
  return {
    rank,
    id: u.id,
    username: u.username,
    displayName: u.displayName,
    avatarUrl: u.avatarUrl,
    level: u.level,
    xp: u.xp,
    weeklyXp: u.weeklyXp,
    weeklySolved: u.weeklySolved,
    currentStreak: u.currentStreak,
    leetcodeUsername: u.leetcodeProfile?.leetcodeUsername ?? null,
    totalSolved: u.leetcodeProfile?.totalSolved ?? 0,
  };
}

async function buildBoard(
  kind: Board,
  viewerId: string | null,
  limit: number
) {
  let where: any = {};
  let orderBy: any = { xp: "desc" };

  if (kind === "weekly") orderBy = { weeklyXp: "desc" };
  if (kind === "friends") {
    if (!viewerId) return [];
    const friendIds = await getFriendIds(viewerId);
    where = { id: { in: [viewerId, ...friendIds] } };
  }

  const users = await prisma.user.findMany({
    where,
    orderBy: [orderBy, { level: "desc" }, { createdAt: "asc" }],
    take: limit,
    include: { leetcodeProfile: true },
  });

  return users.map((u, i) => rowFromUser(u as any, i + 1));
}

router.get(
  "/global",
  asyncHandler(async (req, res) => {
    const limit = Math.min(100, Number(req.query.limit ?? 50));
    const board = await buildBoard("global", null, limit);
    res.json({ board });
  })
);

router.get(
  "/weekly",
  asyncHandler(async (req, res) => {
    const limit = Math.min(100, Number(req.query.limit ?? 50));
    const board = await buildBoard("weekly", null, limit);
    res.json({ board });
  })
);

router.get(
  "/friends",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { userId } = req as AuthedRequest;
    const limit = Math.min(100, Number(req.query.limit ?? 50));
    const board = await buildBoard("friends", userId, limit);
    res.json({ board });
  })
);

export default router;
