import { NotFound } from "../../utils/errors";
import type { LeetcodeProfileData, LeetcodeProvider } from "./types";

// Deterministic pseudo-random based on username so the same profile always
// returns the same stats. This makes local dev and tests predictable.
function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

const SAMPLE_PROBLEMS: Array<{
  title: string;
  slug: string;
  difficulty: "Easy" | "Medium" | "Hard";
}> = [
  { title: "Two Sum", slug: "two-sum", difficulty: "Easy" },
  { title: "Valid Parentheses", slug: "valid-parentheses", difficulty: "Easy" },
  { title: "Merge Two Sorted Lists", slug: "merge-two-sorted-lists", difficulty: "Easy" },
  { title: "Add Two Numbers", slug: "add-two-numbers", difficulty: "Medium" },
  { title: "Longest Substring Without Repeating Characters", slug: "longest-substring-without-repeating-characters", difficulty: "Medium" },
  { title: "3Sum", slug: "3sum", difficulty: "Medium" },
  { title: "Container With Most Water", slug: "container-with-most-water", difficulty: "Medium" },
  { title: "LRU Cache", slug: "lru-cache", difficulty: "Medium" },
  { title: "Median of Two Sorted Arrays", slug: "median-of-two-sorted-arrays", difficulty: "Hard" },
  { title: "Trapping Rain Water", slug: "trapping-rain-water", difficulty: "Hard" },
  { title: "Word Ladder", slug: "word-ladder", difficulty: "Hard" },
];

const UNKNOWN_USERNAMES = new Set(["unknown", "doesnotexist", "404"]);

export class MockLeetcodeProvider implements LeetcodeProvider {
  async fetchProfile(username: string): Promise<LeetcodeProfileData> {
    const normalized = username.trim().toLowerCase();
    if (!normalized || UNKNOWN_USERNAMES.has(normalized)) {
      throw NotFound(`LeetCode user "${username}" not found`);
    }

    const seed = hash(normalized);
    const easy = 20 + (seed % 250);
    const medium = 10 + ((seed >> 3) % 200);
    const hard = (seed >> 6) % 75;
    const total = easy + medium + hard;
    const ranking = 10_000 + ((seed >> 2) % 900_000);
    const acceptance = 40 + ((seed >> 5) % 50) + ((seed % 100) / 100);

    // Spread recent submissions over the last 7 days.
    const now = Math.floor(Date.now() / 1000);
    const count = 5 + (seed % 6);
    const recent = Array.from({ length: count }, (_, i) => {
      const p = SAMPLE_PROBLEMS[(seed + i) % SAMPLE_PROBLEMS.length];
      return {
        title: p.title,
        titleSlug: p.slug,
        difficulty: p.difficulty,
        timestamp: now - (i + 1) * 3600 * (3 + (i % 8)),
        statusDisplay: "Accepted",
      };
    });

    return {
      username: normalized,
      ranking,
      totalSolved: total,
      easySolved: easy,
      mediumSolved: medium,
      hardSolved: hard,
      acceptanceRate: Math.round(acceptance * 10) / 10,
      recentSubmissions: recent,
      fetchedAt: new Date(),
    };
  }
}
