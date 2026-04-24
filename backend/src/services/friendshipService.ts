import { prisma } from "../lib/prisma";

// Returns the list of accepted friend user-IDs for a given user.
export async function getFriendIds(userId: string): Promise<string[]> {
  const rows = await prisma.friendship.findMany({
    where: {
      status: "ACCEPTED",
      OR: [{ requesterId: userId }, { addresseeId: userId }],
    },
    select: { requesterId: true, addresseeId: true },
  });
  return rows.map((r) =>
    r.requesterId === userId ? r.addresseeId : r.requesterId
  );
}
