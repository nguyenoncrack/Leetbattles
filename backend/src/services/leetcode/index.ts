import { env } from "../../utils/env";
import { LiveLeetcodeProvider } from "./liveProvider";
import { MockLeetcodeProvider } from "./mockProvider";
import type { LeetcodeProfileData, LeetcodeProvider } from "./types";

// Swap the provider based on env so the rest of the app stays identical.
const provider: LeetcodeProvider =
  env.LEETCODE_MODE === "live"
    ? new LiveLeetcodeProvider()
    : new MockLeetcodeProvider();

export function fetchLeetcodeProfile(
  username: string
): Promise<LeetcodeProfileData> {
  return provider.fetchProfile(username);
}

export type { LeetcodeProfileData, LeetcodeProvider } from "./types";
