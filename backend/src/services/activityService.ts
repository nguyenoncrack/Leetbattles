import type { ActivityType, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

export function recordActivity(
  userId: string,
  type: ActivityType,
  message: string,
  metadata?: Prisma.InputJsonValue
) {
  return prisma.activityEvent.create({
    data: { userId, type, message, metadata: metadata ?? undefined },
  });
}
