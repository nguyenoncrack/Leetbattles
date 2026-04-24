// Returns null so the frontend Avatar component renders nice initials on a
// color-hashed gradient instead of a third-party identicon tile. Google
// sign-in still uses the Google profile photo when available.
export function defaultAvatarFor(_seed: string): string | null {
  return null;
}
