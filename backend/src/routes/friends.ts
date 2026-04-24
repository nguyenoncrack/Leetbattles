import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth, type AuthedRequest } from "../middleware/auth";
import { recordActivity } from "../services/activityService";
import { asyncHandler } from "../utils/async";
import { BadRequest, Conflict, NotFound } from "../utils/errors";
import { publicUser } from "./_serialize";

const router = Router();

const requestSchema = z.object({
  userId: z.string().optional(),
  username: z.string().optional(),
});

router.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { userId } = req as AuthedRequest;
    const rows = await prisma.friendship.findMany({
      where: { OR: [{ requesterId: userId }, { addresseeId: userId }] },
      include: {
        requester: { include: { leetcodeProfile: true } },
        addressee: { include: { leetcodeProfile: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    const friends: ReturnType<typeof publicUser>[] = [];
    const incoming: Array<{ id: string; from: ReturnType<typeof publicUser> }> = [];
    const outgoing: Array<{ id: string; to: ReturnType<typeof publicUser> }> = [];

    for (const row of rows) {
      const isRequester = row.requesterId === userId;
      const other = isRequester ? row.addressee : row.requester;
      if (row.status === "ACCEPTED") {
        friends.push(publicUser(other));
      } else if (row.status === "PENDING") {
        if (isRequester) outgoing.push({ id: row.id, to: publicUser(other) });
        else incoming.push({ id: row.id, from: publicUser(other) });
      }
    }

    res.json({ friends, incoming, outgoing });
  })
);

router.post(
  "/request",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { userId } = req as AuthedRequest;
    const body = requestSchema.parse(req.body);
    if (!body.userId && !body.username)
      throw BadRequest("userId or username required");

    const target = await prisma.user.findFirst({
      where: body.userId
        ? { id: body.userId }
        : { username: body.username!.toLowerCase() },
    });
    if (!target) throw NotFound("User not found");
    if (target.id === userId) throw BadRequest("Cannot friend yourself");

    // If a reciprocal request already exists, accept it outright.
    const reciprocal = await prisma.friendship.findFirst({
      where: {
        requesterId: target.id,
        addresseeId: userId,
        status: "PENDING",
      },
    });
    if (reciprocal) {
      const updated = await prisma.friendship.update({
        where: { id: reciprocal.id },
        data: { status: "ACCEPTED" },
      });
      await recordActivity(
        userId,
        "FRIEND_ADDED",
        `Became friends with @${target.username}`
      );
      return res.status(200).json({ friendship: updated, status: "ACCEPTED" });
    }

    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: userId, addresseeId: target.id },
          { requesterId: target.id, addresseeId: userId },
        ],
      },
    });
    if (existing)
      throw Conflict(
        existing.status === "ACCEPTED"
          ? "Already friends"
          : "Friend request already exists"
      );

    const friendship = await prisma.friendship.create({
      data: {
        requesterId: userId,
        addresseeId: target.id,
        status: "PENDING",
      },
    });
    res.status(201).json({ friendship, status: "PENDING" });
  })
);

router.post(
  "/accept",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { userId } = req as AuthedRequest;
    const { friendshipId } = z
      .object({ friendshipId: z.string() })
      .parse(req.body);

    const row = await prisma.friendship.findUnique({
      where: { id: friendshipId },
      include: { requester: true },
    });
    if (!row || row.addresseeId !== userId) throw NotFound("Request not found");
    if (row.status !== "PENDING") throw BadRequest("Request is not pending");

    const updated = await prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: "ACCEPTED" },
    });
    await recordActivity(
      userId,
      "FRIEND_ADDED",
      `Became friends with @${row.requester.username}`
    );
    res.json({ friendship: updated });
  })
);

router.delete(
  "/:idOrFriendshipId",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { userId } = req as AuthedRequest;
    const key = req.params.idOrFriendshipId;

    // Accept either the Friendship row id or the other user's id.
    const row = await prisma.friendship.findFirst({
      where: {
        OR: [
          { id: key },
          { requesterId: userId, addresseeId: key },
          { addresseeId: userId, requesterId: key },
        ],
      },
    });
    if (!row) throw NotFound("Friendship not found");
    if (row.requesterId !== userId && row.addresseeId !== userId)
      throw NotFound();

    await prisma.friendship.delete({ where: { id: row.id } });

    // If this person was the current user's rival, clear that link.
    await prisma.user.updateMany({
      where: {
        id: userId,
        rivalId:
          row.requesterId === userId ? row.addresseeId : row.requesterId,
      },
      data: { rivalId: null },
    });

    res.json({ removed: true });
  })
);

export default router;
