import cors from "cors";
import express from "express";
import { env } from "./utils/env";
import { errorHandler, notFound } from "./middleware/errorHandler";

import authRouter from "./routes/auth";
import usersRouter from "./routes/users";
import leetcodeRouter from "./routes/leetcode";
import friendsRouter from "./routes/friends";
import leaderboardRouter from "./routes/leaderboard";
import challengesRouter from "./routes/challenges";
import activityRouter from "./routes/activity";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin) return cb(null, true);
        if (env.CORS_ORIGIN.includes("*") || env.CORS_ORIGIN.includes(origin))
          return cb(null, true);
        cb(new Error(`CORS blocked: ${origin}`));
      },
      credentials: true,
    })
  );
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_req, res) =>
    res.json({ ok: true, mode: env.LEETCODE_MODE })
  );

  app.use("/api/auth", authRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/leetcode", leetcodeRouter);
  app.use("/api/friends", friendsRouter);
  app.use("/api/leaderboard", leaderboardRouter);
  app.use("/api/challenges", challengesRouter);
  app.use("/api/activity", activityRouter);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
