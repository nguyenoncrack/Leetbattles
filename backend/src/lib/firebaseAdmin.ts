import { readFileSync } from "fs";
import { getApps, initializeApp, cert, applicationDefault } from "firebase-admin/app";
import { getAuth, type DecodedIdToken } from "firebase-admin/auth";

let initialized = false;
let disabled = false;

function init() {
  if (initialized || disabled) return;

  const projectId =
    process.env.FIREBASE_PROJECT_ID ?? process.env.APP_FIREBASE_PROJECT_ID;
  const saJson =
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON ??
    process.env.APP_FIREBASE_SERVICE_ACCOUNT_JSON;
  const saPath =
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH ??
    process.env.APP_FIREBASE_SERVICE_ACCOUNT_KEY_PATH ??
    process.env.GOOGLE_APPLICATION_CREDENTIALS;

  try {
    if (getApps().length > 0) {
      initialized = true;
      return;
    }

    if (saJson) {
      initializeApp({ credential: cert(JSON.parse(saJson)) });
    } else if (saPath) {
      const raw = JSON.parse(readFileSync(saPath, "utf8"));
      initializeApp({ credential: cert(raw) });
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      initializeApp({ credential: applicationDefault() });
    } else if (projectId) {
      // Last resort: project ID only. Token verification still works
      // because firebase-admin will fetch Google's public keys.
      initializeApp({ projectId });
    } else {
      disabled = true;
      console.warn(
        "[firebaseAdmin] No FIREBASE_PROJECT_ID or service account configured — /api/auth/firebase will 503."
      );
      return;
    }
    initialized = true;
  } catch (err) {
    disabled = true;
    console.error("[firebaseAdmin] init failed:", err);
  }
}

export function isFirebaseAdminConfigured(): boolean {
  init();
  return initialized && !disabled;
}

export async function verifyFirebaseIdToken(
  idToken: string
): Promise<DecodedIdToken> {
  init();
  if (!initialized || disabled) {
    throw new Error("Firebase Admin is not configured on this server.");
  }
  return getAuth().verifyIdToken(idToken, true);
}
