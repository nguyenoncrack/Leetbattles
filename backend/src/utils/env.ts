import "dotenv/config";

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: parseInt(process.env.PORT ?? "4000", 10),
  JWT_SECRET: required("JWT_SECRET", "dev-insecure-secret-change-me"),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? "7d",
  CORS_ORIGIN: (process.env.CORS_ORIGIN ?? "http://localhost:5173")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  LEETCODE_MODE: (process.env.LEETCODE_MODE ?? "mock") as "mock" | "live",
  LEETCODE_CACHE_MINUTES: parseInt(
    process.env.LEETCODE_CACHE_MINUTES ?? "30",
    10
  ),
};
