import type { Prisma } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth, type AuthedRequest } from "../middleware/auth";
import { publicUser } from "./_serialize";
import { fetchLeetcodeProfile } from "../services/leetcode";
import { syncUserLeetcode } from "../services/syncService";
import { asyncHandler } from "../utils/async";
import { BadRequest, Conflict, NotFound } from "../utils/errors";

const router = Router();

const connectSchema = z.object({
  leetcodeUsername: z.string().min(1).max(64),
});

router.post(
  "/connect",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { userId } = req as AuthedRequest;
    const { leetcodeUsername } = connectSchema.parse(req.body);
    const normalized = leetcodeUsername.trim();

    // Validate the username exists before saving — throws if not.
    const fresh = await fetchLeetcodeProfile(normalized);

    // LeetCode usernames are case-insensitive — persist the canonical lowercase
    // form so uniqueness and lookups are consistent across the app.
    const canonical = fresh.username.toLowerCase();

    // Make sure no one else has already linked this LeetCode account.
    const claimed = await prisma.leetCodeProfile.findUnique({
      where: { leetcodeUsername: canonical },
    });
    if (claimed && claimed.userId !== userId) {
      throw Conflict(
        `LeetCode user "${fresh.username}" is already linked to another CodeClash account`
      );
    }

    // Persist the LeetCode profile. We use a single upsert so Connect /
    // Reconnect behave identically, and the DB's unique (userId) +
    // unique (leetcodeUsername) constraints keep things consistent even if
    // two requests race.
    await prisma.leetCodeProfile.upsert({
      where: { userId },
      create: {
        userId,
        leetcodeUsername: canonical,
        ranking: fresh.ranking,
        totalSolved: fresh.totalSolved,
        easySolved: fresh.easySolved,
        mediumSolved: fresh.mediumSolved,
        hardSolved: fresh.hardSolved,
        acceptanceRate: fresh.acceptanceRate,
        recentSubmissions:
          fresh.recentSubmissions as unknown as Prisma.InputJsonValue,
        lastSyncedAt: new Date(),
      },
      update: {
        leetcodeUsername: canonical,
        ranking: fresh.ranking,
        totalSolved: fresh.totalSolved,
        easySolved: fresh.easySolved,
        mediumSolved: fresh.mediumSolved,
        hardSolved: fresh.hardSolved,
        acceptanceRate: fresh.acceptanceRate,
        recentSubmissions:
          fresh.recentSubmissions as unknown as Prisma.InputJsonValue,
        lastSyncedAt: new Date(),
      },
    });

    // Immediately run a sync. Because we just wrote the "fresh" snapshot
    // above, the delta is 0 and no XP is awarded for the historical solves,
    // but this step *is* important: it ensures weekly challenge rows, badge
    // evaluation, and the `lastSyncedAt` timestamp are initialized so the
    // dashboard doesn't render a half-populated state on the very first
    // visit. If LeetCode's API hiccups during this step we still keep the
    // connection — the user can press "Sync now" later.
    try {
      await syncUserLeetcode(userId, { force: true });
    } catch (err) {
      console.warn("[connect] post-connect sync skipped:", err);
    }

    // Return the full, hydrated user so the frontend can drop it straight
    // into the auth context with no extra round-trip.
    const refreshed = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        leetcodeProfile: true,
        badges: { include: { badge: true }, orderBy: { awardedAt: "desc" } },
      },
    });
    if (!refreshed) throw NotFound("User not found");

    res.json({
      connected: true,
      leetcodeUsername: fresh.username,
      totalSolved: fresh.totalSolved,
      user: publicUser(refreshed, { includeEmail: true }),
    });
  })
);

router.post(
  "/sync",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { userId } = req as AuthedRequest;
    const force = req.body?.force === true;
    const result = await syncUserLeetcode(userId, { force });
    res.json(result);
  })
);

router.get(
  "/:username",
  requireAuth,
  asyncHandler(async (req, res) => {
    const username = req.params.username.trim();
    const canonical = username.toLowerCase();
    const cached = await prisma.leetCodeProfile.findUnique({
      where: { leetcodeUsername: canonical },
    });
    if (cached) return res.json({ profile: cached, source: "cache" });

    try {
      const fresh = await fetchLeetcodeProfile(username);
      return res.json({ profile: fresh, source: "live" });
    } catch (err) {
      if ((err as Error).message.includes("not found")) throw NotFound();
      throw BadRequest((err as Error).message);
    }
  })
);

export default router;
