import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, type AuthedRequest } from "../middleware/auth";
import { getFriendIds } from "../services/friendshipService";
import { asyncHandler } from "../utils/async";

const router = Router();

// The feed mixes events from the current user and their friends. Sorted by
// recency, paginated by `?before=<ISO>` cursor for simple infinite scroll.
router.get(
  "/feed",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { userId } = req as AuthedRequest;
    const friendIds = await getFriendIds(userId);
    const limit = Math.min(50, Number(req.query.limit ?? 25));
    const before = req.query.before
      ? new Date(String(req.query.before))
      : undefined;

    const events = await prisma.activityEvent.findMany({
      where: {
        userId: { in: [userId, ...friendIds] },
        ...(before ? { createdAt: { lt: before } } : {}),
      },
      include: {
        user: {
          select: { id: true, username: true, displayName: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    res.json({
      events: events.map((e) => ({
        id: e.id,
        type: e.type,
        message: e.message,
        metadata: e.metadata,
        createdAt: e.createdAt,
        user: e.user,
      })),
    });
  })
);

export default router;
