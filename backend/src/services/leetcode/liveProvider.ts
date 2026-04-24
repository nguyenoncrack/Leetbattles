import { BadRequest, NotFound } from "../../utils/errors";
import type { LeetcodeProfileData, LeetcodeProvider } from "./types";

// Queries the public LeetCode GraphQL endpoint. Only hits publicly-available
// profile data — never asks for a password or token.
const LEETCODE_GRAPHQL = "https://leetcode.com/graphql";

// Two queries so the profile endpoint works even if LeetCode tweaks one.
// `matchedUser` exposes counts + ranking; `recentAcSubmissionList` is the
// public 20-item feed. Accepted-submission totals are used to derive an
// acceptance rate.
const QUERY = /* GraphQL */ `
  query userProfile($username: String!) {
    matchedUser(username: $username) {
      username
      profile {
        ranking
        userAvatar
      }
      submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
          submissions
        }
        totalSubmissionNum {
          difficulty
          count
          submissions
        }
      }
    }
    recentAcSubmissionList(username: $username, limit: 15) {
      title
      titleSlug
      timestamp
    }
  }
`;

interface DifficultyBucket {
  difficulty: string;
  count: number;
  submissions: number;
}

interface LeetCodeBody {
  data?: {
    matchedUser: {
      username: string;
      profile: { ranking: number | null; userAvatar: string | null };
      submitStatsGlobal: {
        acSubmissionNum: DifficultyBucket[];
        totalSubmissionNum: DifficultyBucket[];
      };
    } | null;
    recentAcSubmissionList:
      | Array<{ title: string; titleSlug: string; timestamp: string }>
      | null;
  };
  errors?: Array<{ message: string }>;
}

export class LiveLeetcodeProvider implements LeetcodeProvider {
  async fetchProfile(username: string): Promise<LeetcodeProfileData> {
    const trimmed = username.trim();
    if (!trimmed) throw BadRequest("LeetCode username is required");

    let res: Response;
    try {
      res = await fetch(LEETCODE_GRAPHQL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Referer: `https://leetcode.com/${trimmed}/`,
          "User-Agent":
            "Mozilla/5.0 (compatible; CodeClash/1.0; +https://codeclash.local)",
        },
        body: JSON.stringify({ query: QUERY, variables: { username: trimmed } }),
      });
    } catch (err) {
      throw BadRequest(
        `Could not reach LeetCode: ${(err as Error).message}. Try again in a moment.`
      );
    }

    if (res.status === 404) {
      throw NotFound(`LeetCode user "${trimmed}" not found`);
    }
    if (res.status === 429) {
      throw BadRequest(
        "LeetCode is rate-limiting us right now. Please try again in a minute."
      );
    }
    if (!res.ok) {
      throw BadRequest(`LeetCode request failed (${res.status})`);
    }

    const body = (await res.json()) as LeetCodeBody;
    if (body.errors && body.errors.length) {
      throw BadRequest(`LeetCode error: ${body.errors[0].message}`);
    }
    const user = body.data?.matchedUser;
    if (!user) throw NotFound(`LeetCode user "${trimmed}" not found`);

    const byDiffAc = bucketsByDifficulty(user.submitStatsGlobal.acSubmissionNum);
    const byDiffTotal = bucketsByDifficulty(
      user.submitStatsGlobal.totalSubmissionNum
    );

    const easy = byDiffAc["Easy"]?.count ?? 0;
    const medium = byDiffAc["Medium"]?.count ?? 0;
    const hard = byDiffAc["Hard"]?.count ?? 0;
    const totalSolved = byDiffAc["All"]?.count ?? easy + medium + hard;

    // Acceptance rate from total submissions (accepted / total * 100).
    const acSubs = byDiffAc["All"]?.submissions ?? 0;
    const totalSubs = byDiffTotal["All"]?.submissions ?? 0;
    const acceptanceRate =
      totalSubs > 0 ? Math.round((acSubs / totalSubs) * 1000) / 10 : null;

    const recent = (body.data?.recentAcSubmissionList ?? []).map((s) => ({
      title: s.title,
      titleSlug: s.titleSlug,
      timestamp: Number(s.timestamp),
      difficulty: null,
      statusDisplay: "Accepted",
    }));

    return {
      // Preserve LeetCode's canonical display casing.
      username: user.username,
      ranking: user.profile.ranking ?? null,
      totalSolved,
      easySolved: easy,
      mediumSolved: medium,
      hardSolved: hard,
      acceptanceRate,
      recentSubmissions: recent,
      fetchedAt: new Date(),
    };
  }
}

function bucketsByDifficulty(
  buckets: DifficultyBucket[]
): Record<string, DifficultyBucket> {
  return Object.fromEntries(buckets.map((b) => [b.difficulty, b]));
}
