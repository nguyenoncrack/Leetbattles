import { PrismaClient, ChallengeKind } from "@prisma/client";

const prisma = new PrismaClient();

function weekStart(date = new Date()): Date {
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
  const diff = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - diff);
  return d;
}

async function main() {
  console.log("Seeding badges…");
  // `icon` is a semantic slug; the frontend maps it to a hand-drawn SVG.
  const badges = [
    {
      key: "first_blood",
      name: "First Blood",
      description: "Solved your first tracked problem.",
      icon: "drop",
      tier: "bronze",
    },
    {
      key: "grinder",
      name: "Grinder",
      description: "Solved 10 problems in a single week.",
      icon: "gear",
      tier: "silver",
    },
    {
      key: "medium_menace",
      name: "Medium Menace",
      description: "Cleared 20 Medium problems.",
      icon: "flame",
      tier: "silver",
    },
    {
      key: "hardcore",
      name: "Hardcore",
      description: "Cleared 5 Hard problems.",
      icon: "skull",
      tier: "gold",
    },
    {
      key: "consistency_demon",
      name: "Consistency Demon",
      description: "Maintained a 7-day streak.",
      icon: "bolt",
      tier: "gold",
    },
  ];
  for (const b of badges) {
    await prisma.badge.upsert({
      where: { key: b.key },
      create: b,
      update: b,
    });
  }

  console.log("Seeding weekly challenges…");
  const ws = weekStart();
  const weekly = [
    {
      title: "Easy Warmup",
      description: "Solve 5 Easy problems this week.",
      kind: ChallengeKind.SOLVE_EASY,
      target: 5,
      xpReward: 100,
    },
    {
      title: "Medium Grinder",
      description: "Solve 3 Medium problems this week.",
      kind: ChallengeKind.SOLVE_MEDIUM,
      target: 3,
      xpReward: 100,
    },
    {
      title: "Hard Conqueror",
      description: "Solve 1 Hard problem this week.",
      kind: ChallengeKind.SOLVE_HARD,
      target: 1,
      xpReward: 100,
    },
    {
      title: "Sprint of Ten",
      description: "Solve 10 total problems this week.",
      kind: ChallengeKind.SOLVE_TOTAL,
      target: 10,
      xpReward: 100,
    },
  ];
  for (const c of weekly) {
    await prisma.weeklyChallenge.upsert({
      where: {
        weekStart_kind_target: {
          weekStart: ws,
          kind: c.kind,
          target: c.target,
        },
      },
      create: { ...c, weekStart: ws },
      update: { ...c, weekStart: ws },
    });
  }

  console.log("Seed complete (badges + weekly challenges)");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
