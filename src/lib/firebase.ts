/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

// Firebase is kept for one job only: the "Continue with Google" button (see
// src/lib/googleAuth.ts). Inquiry data lives in Postgres via Supabase — see
// src/lib/inquiries.ts.
//
// The whole config comes from the environment; none of it is committed.
// Firebase documents the web config as a public identifier, but Google's abuse
// tooling suspends API keys it finds in public repositories anyway, so keep
// them in .env locally and in the host's environment variables in production.
// What guards the project is the Authorized domains list in Firebase Auth.
//
// See .env.example. Without these the Google button stays disabled.
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '',
};

/** Enough config to start the app — this is all Auth needs. */
export const isFirebaseConfigured = () =>
  config.apiKey.trim().length > 0 && config.projectId.trim().length > 0;

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

/** Firebase Auth, used only for "Continue with Google". */
export function getAuthInstance(): Auth | null {
  if (!isFirebaseConfigured()) return null;
  app = app ?? initializeApp(config);
  if (!auth) auth = getAuth(app);
  return auth;
}
