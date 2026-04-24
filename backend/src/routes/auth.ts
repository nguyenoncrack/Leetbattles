import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import {
  isFirebaseAdminConfigured,
  verifyFirebaseIdToken,
} from "../lib/firebaseAdmin";
import {
  hashPassword,
  signToken,
  verifyPassword,
} from "../services/authService";
import { recordActivity } from "../services/activityService";
import { asyncHandler } from "../utils/async";
import { defaultAvatarFor } from "../utils/avatar";
import { BadRequest, Conflict, HttpError, Unauthorized } from "../utils/errors";
import { requireAuth, type AuthedRequest } from "../middleware/auth";
import { publicUser } from "./_serialize";

const router = Router();

// Shared Prisma include block so every auth response ships a fully-hydrated
// user — same shape as /api/auth/me — and the client never has to chase a
// follow-up request just to discover its own LeetCode profile or badges.
const USER_INCLUDE = {
  leetcodeProfile: true,
  badges: {
    include: { badge: true },
    orderBy: { awardedAt: "desc" as const },
  },
} as const;

const registerSchema = z.object({
  email: z.string().email(),
  username: z
    .string()
    .min(3)
    .max(24)
    .regex(/^[a-zA-Z0-9_]+$/, "letters, numbers and underscores only"),
  displayName: z.string().min(1).max(48),
  password: z.string().min(8).max(128),
});

const loginSchema = z.object({
  emailOrUsername: z.string().min(1),
  password: z.string().min(1),
});

router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const body = registerSchema.parse(req.body);
    const email = body.email.toLowerCase();
    const username = body.username.toLowerCase();

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existing) {
      throw Conflict(
        existing.email === email
          ? "Email already registered"
          : "Username already taken"
      );
    }

    const passwordHash = await hashPassword(body.password);
    const created = await prisma.user.create({
      data: {
        email,
        username,
        displayName: body.displayName,
        passwordHash,
        avatarUrl: defaultAvatarFor(username),
      },
    });

    await recordActivity(created.id, "JOINED", `Joined CodeClash`);

    const user = await prisma.user.findUnique({
      where: { id: created.id },
      include: USER_INCLUDE,
    });

    res.status(201).json({
      token: signToken(created.id),
      user: publicUser(user ?? created, { includeEmail: true }),
    });
  })
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { emailOrUsername, password } = loginSchema.parse(req.body);
    const needle = emailOrUsername.toLowerCase();
    // Include leetcodeProfile + badges so the dashboard renders the
    // connected state immediately — without this the client used to see
    // `user.leetcode === null` and prompt the user to reconnect on every
    // login.
    const user = await prisma.user.findFirst({
      where: { OR: [{ email: needle }, { username: needle }] },
      include: USER_INCLUDE,
    });
    if (!user || !user.passwordHash) throw Unauthorized("Invalid credentials");
    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) throw Unauthorized("Invalid credentials");

    res.json({
      token: signToken(user.id),
      user: publicUser(user, { includeEmail: true }),
    });
  })
);

const firebaseSchema = z.object({
  idToken: z.string().min(10),
});

// Exchanges a Firebase ID token (from Google sign-in, etc.) for a CodeClash
// JWT. Creates a user row on first sign-in.
router.post(
  "/firebase",
  asyncHandler(async (req, res) => {
    if (!isFirebaseAdminConfigured()) {
      throw new HttpError(
        503,
        "Firebase sign-in is not configured on this server."
      );
    }

    const { idToken } = firebaseSchema.parse(req.body);

    let decoded;
    try {
      decoded = await verifyFirebaseIdToken(idToken);
    } catch {
      throw Unauthorized("Invalid Firebase ID token");
    }

    const email = (decoded.email ?? "").toLowerCase();
    if (!email) throw BadRequest("Firebase account has no email");

    const displayName =
      (decoded.name as string | undefined) ||
      email.split("@")[0] ||
      "Coder";
    const avatarUrl = (decoded.picture as string | undefined) ?? null;

    const existing = await prisma.user.findUnique({
      where: { email },
      include: USER_INCLUDE,
    });
    if (existing) {
      return res.json({
        token: signToken(existing.id),
        user: publicUser(existing, { includeEmail: true }),
        created: false,
      });
    }

    // Generate a unique username derived from email local-part.
    const baseUsername = email
      .split("@")[0]
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "")
      .slice(0, 20) || "player";
    let username = baseUsername;
    for (let i = 1; i < 50; i++) {
      const clash = await prisma.user.findUnique({ where: { username } });
      if (!clash) break;
      username = `${baseUsername}${i}`;
    }

    const created = await prisma.user.create({
      data: {
        email,
        username,
        displayName,
        avatarUrl: avatarUrl ?? defaultAvatarFor(username),
      },
    });

    await recordActivity(created.id, "JOINED", "Joined CodeClash via Google");

    const user = await prisma.user.findUnique({
      where: { id: created.id },
      include: USER_INCLUDE,
    });

    res.status(201).json({
      token: signToken(created.id),
      user: publicUser(user ?? created, { includeEmail: true }),
      created: true,
    });
  })
);

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { userId } = req as AuthedRequest;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: USER_INCLUDE,
    });
    if (!user) throw BadRequest("User not found");
    res.json({ user: publicUser(user, { includeEmail: true }) });
  })
);

export default router;
