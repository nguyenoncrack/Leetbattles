export interface LeetcodeRecentSubmission {
  title: string;
  titleSlug: string;
  // Live LeetCode's recent-submission list does not always expose difficulty,
  // so this can be null for live results. Mock data always fills it in.
  difficulty: "Easy" | "Medium" | "Hard" | null;
  timestamp: number; // unix seconds
  statusDisplay: string;
}

export interface LeetcodeProfileData {
  username: string;
  ranking: number | null;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  acceptanceRate: number | null;
  recentSubmissions: LeetcodeRecentSubmission[];
  fetchedAt: Date;
}

export interface LeetcodeProvider {
  fetchProfile(username: string): Promise<LeetcodeProfileData>;
}
