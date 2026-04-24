export interface LevelProgress {
  intoLevel: number;
  levelSize: number;
  toNextLevel: number;
  ratio: number;
}

export interface LeetcodeMini {
  username: string;
  ranking: number | null;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  acceptanceRate: number | null;
  lastSyncedAt: string | null;
  recentSubmissions?:
    | Array<{
        title: string;
        titleSlug: string;
        difficulty: "Easy" | "Medium" | "Hard" | null;
        timestamp: number;
        statusDisplay: string;
      }>
    | null;
}

export interface BadgeDTO {
  key: string;
  name: string;
  description: string;
  icon: string;
  tier: string;
  awardedAt: string;
}

export interface UserDTO {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  email?: string;
  xp: number;
  level: number;
  levelProgress: LevelProgress;
  computedLevel: number;
  currentStreak: number;
  longestStreak: number;
  weeklyXp: number;
  weeklySolved: number;
  rivalId: string | null;
  leetcode: LeetcodeMini | null;
  badges: BadgeDTO[];
  createdAt: string;
}

export interface LeaderboardRow {
  rank: number;
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  level: number;
  xp: number;
  weeklyXp: number;
  weeklySolved: number;
  currentStreak: number;
  leetcodeUsername: string | null;
  totalSolved: number;
}

export interface WeeklyChallengeDTO {
  id: string;
  title: string;
  description: string;
  kind: "SOLVE_EASY" | "SOLVE_MEDIUM" | "SOLVE_HARD" | "SOLVE_TOTAL";
  target: number;
  xpReward: number;
  progress: number;
  completed: boolean;
  ratio: number;
}

export type ActivityType =
  | "SOLVED_PROBLEMS"
  | "LEVELED_UP"
  | "BADGE_EARNED"
  | "CHALLENGE_COMPLETED"
  | "STREAK_MILESTONE"
  | "PASSED_RIVAL"
  | "FRIEND_ADDED"
  | "JOINED";

export interface ActivityEventDTO {
  id: string;
  type: ActivityType;
  message: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
}

export interface FriendshipsDTO {
  friends: UserDTO[];
  incoming: Array<{ id: string; from: UserDTO }>;
  outgoing: Array<{ id: string; to: UserDTO }>;
}

export interface SyncResultDTO {
  xpGained: number;
  solvedDelta: { easy: number; medium: number; hard: number; total: number };
  leveledUp: boolean;
  previousLevel: number;
  newLevel: number;
  streak: number;
  passedRival: { username: string; displayName: string } | null;
  challengesCompleted: string[];
  badgesEarned: string[];
}
