import { initializeApp, type FirebaseApp } from "firebase/app";
import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  signOut as fbSignOut,
  type Auth,
  type User as FirebaseUser,
} from "firebase/auth";
import { getAnalytics, isSupported as analyticsSupported } from "firebase/analytics";

// Values come from Vite env vars — safe to expose in client bundles.
// Firebase "api key" is not a secret; access is controlled via security rules.
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

function hasCompleteConfig(): boolean {
  return Boolean(
    config.apiKey && config.authDomain && config.projectId && config.appId
  );
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  if (!hasCompleteConfig()) return null;
  if (!app) app = initializeApp(config);
  return app;
}

export function getFirebaseAuth(): Auth | null {
  const a = getFirebaseApp();
  if (!a) return null;
  if (!auth) auth = getAuth(a);
  return auth;
}

export async function initAnalyticsIfSupported(): Promise<void> {
  const a = getFirebaseApp();
  if (!a) return;
  try {
    if (await analyticsSupported()) getAnalytics(a);
  } catch {
    // analytics unsupported in some envs (SSR/insecure) — safe to ignore
  }
}

export const isFirebaseConfigured = hasCompleteConfig;

export async function signInWithGoogle(): Promise<{
  user: FirebaseUser;
  idToken: string;
}> {
  const a = getFirebaseAuth();
  if (!a) throw new Error("Firebase is not configured in this environment.");
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const res = await signInWithPopup(a, provider);
  const idToken = await res.user.getIdToken();
  return { user: res.user, idToken };
}

export async function signOutFirebase(): Promise<void> {
  const a = getFirebaseAuth();
  if (!a) return;
  await fbSignOut(a);
}
