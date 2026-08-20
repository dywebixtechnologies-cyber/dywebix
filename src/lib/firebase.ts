/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getDatabase, type Database } from 'firebase/database';
import { getAuth, type Auth } from 'firebase/auth';

// Realtime Database rather than Firestore: new Firestore databases require a
// billing account, while RTDB is still free on the Spark plan.
//
// The whole config comes from the environment — none of it is committed.
// Firebase documents the web config as a public identifier, but Google's abuse
// tooling suspends API keys it finds in public repositories anyway, so keep
// them in .env locally and in the host's environment variables in production.
// What actually guards the project is database.rules.json plus the Authorized
// domains list in Firebase Auth.
//
// See .env.example. Without these the site falls back to localStorage and the
// Google button stays disabled.
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '';

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
  projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '',
  // Non-US database instances live on a regional host, so the URL can't always
  // be derived — set VITE_FIREBASE_DATABASE_URL when the console shows one.
  // Left underivable until the database is actually created.
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || '',
};

/** Enough config to start the app at all — this is what Auth needs. */
export const isFirebaseConfigured = () =>
  config.apiKey.trim().length > 0 && config.projectId.trim().length > 0;

/**
 * The database additionally needs a URL. Until it has one the inquiry store
 * falls back to localStorage, so the site runs with no setup.
 */
export const isDatabaseConfigured = () =>
  isFirebaseConfigured() && config.databaseURL.trim().length > 0;

let app: FirebaseApp | null = null;
let db: Database | null = null;
let auth: Auth | null = null;

function getApp(): FirebaseApp | null {
  if (!isFirebaseConfigured()) return null;
  app = app ?? initializeApp(config);
  return app;
}

/** Lazily initialise on first use; returns null when unconfigured. */
export function getDb(): Database | null {
  if (!isDatabaseConfigured()) return null;
  const instance = getApp();
  if (!instance) return null;
  if (!db) db = getDatabase(instance);
  return db;
}

/** Firebase Auth, used only for "Continue with Google". */
export function getAuthInstance(): Auth | null {
  const instance = getApp();
  if (!instance) return null;
  if (!auth) auth = getAuth(instance);
  return auth;
}
