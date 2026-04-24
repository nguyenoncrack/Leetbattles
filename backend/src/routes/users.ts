import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth, type AuthedRequest } from "../middleware/auth";
import { asyncHandler } from "../utils/async";
import { BadRequest, NotFound } from "../utils/errors";
import { publicUser } from "./_serialize";

const router = Router();

const updateMeSchema = z.object({
  displayName: z.string().min(1).max(48).optional(),
  bio: z.string().max(280).optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
  rivalId: z.string().optional().nullable(),
});

router.patch(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { userId } = req as AuthedRequest;
    const data = updateMeSchema.parse(req.body);

    if (data.rivalId) {
      if (data.rivalId === userId)
        throw BadRequest("You cannot be your own rival");
      const friend = await prisma.friendship.findFirst({
        where: {
          status: "ACCEPTED",
          OR: [
            { requesterId: userId, addresseeId: data.rivalId },
            { addresseeId: userId, requesterId: data.rivalId },
          ],
        },
      });
      if (!friend) throw BadRequest("You can only rival a friend");
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        displayName: data.displayName ?? undefined,
        bio: data.bio === null ? null : data.bio ?? undefined,
        avatarUrl: data.avatarUrl === null ? null : data.avatarUrl ?? undefined,
        rivalId: data.rivalId === null ? null : data.rivalId ?? undefined,
      },
      include: {
        leetcodeProfile: true,
        badges: { include: { badge: true } },
      },
    });

    res.json({ user: publicUser(user, { includeEmail: true }) });
  })
);

router.get(
  "/search",
  requireAuth,
  asyncHandler(async (req, res) => {
    const q = (req.query.query as string | undefined)?.trim() ?? "";
    if (q.length < 2) {
      return res.json({ users: [] });
    }
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: q, mode: "insensitive" } },
          { displayName: { contains: q, mode: "insensitive" } },
          {
            leetcodeProfile: {
              leetcodeUsername: { contains: q, mode: "insensitive" },
            },
          },
        ],
      },
      take: 20,
      orderBy: { xp: "desc" },
      include: { leetcodeProfile: true },
    });
    res.json({ users: users.map((u) => publicUser(u)) });
  })
);

router.get(
  "/:idOrUsername",
  requireAuth,
  asyncHandler(async (req, res) => {
    const key = req.params.idOrUsername;
    const user = await prisma.user.findFirst({
      where: { OR: [{ id: key }, { username: key.toLowerCase() }] },
      include: {
        leetcodeProfile: true,
        badges: { include: { badge: true } },
      },
    });
    if (!user) throw NotFound("User not found");
    res.json({ user: publicUser(user) });
  })
);

export default router;
