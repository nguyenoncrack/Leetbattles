import { onRequest } from "firebase-functions/v2/https";
import { createApp } from "../../backend/src/app";

// Reuse the existing Express app so all current /api routes keep working.
const app = createApp();

export const api = onRequest(
  {
    region: "us-central1",
    cors: true,
    memory: "512MiB",
    timeoutSeconds: 60,
  },
  app
);
