import { api } from "./client";
import type {
  ActivityEventDTO,
  FriendshipsDTO,
  LeaderboardRow,
  SyncResultDTO,
  UserDTO,
  WeeklyChallengeDTO,
} from "../types/api";

export const AuthAPI = {
  register: (body: {
    email: string;
    username: string;
    displayName: string;
    password: string;
  }) => api.post<{ token: string; user: UserDTO }>("/api/auth/register", body),
  login: (body: { emailOrUsername: string; password: string }) =>
    api.post<{ token: string; user: UserDTO }>("/api/auth/login", body),
  firebase: (body: { idToken: string }) =>
    api.post<{ token: string; user: UserDTO; created: boolean }>(
      "/api/auth/firebase",
      body
    ),
  me: () => api.get<{ user: UserDTO }>("/api/auth/me"),
};

export const UsersAPI = {
  get: (idOrUsername: string) =>
    api.get<{ user: UserDTO }>(`/api/users/${idOrUsername}`),
  search: (q: string) =>
    api.get<{ users: UserDTO[] }>(
      `/api/users/search?query=${encodeURIComponent(q)}`
    ),
  updateMe: (body: {
    displayName?: string;
    bio?: string | null;
    avatarUrl?: string | null;
    rivalId?: string | null;
  }) => api.patch<{ user: UserDTO }>("/api/users/me", body),
};

export const LeetcodeAPI = {
  connect: (leetcodeUsername: string) =>
    api.post<{
      connected: boolean;
      leetcodeUsername: string;
      totalSolved: number;
      user: UserDTO;
    }>("/api/leetcode/connect", { leetcodeUsername }),
  sync: (force = false) =>
    api.post<SyncResultDTO>("/api/leetcode/sync", { force }),
};

export const LeaderboardAPI = {
  global: () => api.get<{ board: LeaderboardRow[] }>("/api/leaderboard/global"),
  weekly: () => api.get<{ board: LeaderboardRow[] }>("/api/leaderboard/weekly"),
  friends: () => api.get<{ board: LeaderboardRow[] }>("/api/leaderboard/friends"),
};

export const FriendsAPI = {
  list: () => api.get<FriendshipsDTO>("/api/friends"),
  request: (body: { userId?: string; username?: string }) =>
    api.post<{ status: string }>("/api/friends/request", body),
  accept: (friendshipId: string) =>
    api.post<{ friendship: unknown }>("/api/friends/accept", { friendshipId }),
  remove: (idOrUserId: string) =>
    api.del<{ removed: boolean }>(`/api/friends/${idOrUserId}`),
};

export const ChallengesAPI = {
  weekly: () =>
    api.get<{ weekStart: string; challenges: WeeklyChallengeDTO[] }>(
      "/api/challenges/weekly"
    ),
  checkProgress: () =>
    api.post<SyncResultDTO>("/api/challenges/check-progress"),
};

export const ActivityAPI = {
  feed: (before?: string, limit = 25) => {
    const q = new URLSearchParams();
    q.set("limit", String(limit));
    if (before) q.set("before", before);
    return api.get<{ events: ActivityEventDTO[] }>(
      `/api/activity/feed?${q.toString()}`
    );
  },
};
