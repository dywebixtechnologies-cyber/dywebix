/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';

// The whole config comes from the environment — none of it is committed.
// Firebase documents the web config as a public identifier, but Google's abuse
// tooling suspends API keys it finds in public repositories anyway, so keep
// them in .env locally and in the host's environment variables in production.
// What actually guards the project is firestore.rules plus the Authorized
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
};

// A Firebase project can hold several Firestore databases. The SDK talks to the
// one called "(default)" unless given an id, and ours is named — so this must
// match the name in the console's Database dropdown or every read 404s.
const DATABASE_ID = import.meta.env.VITE_FIREBASE_DATABASE_ID || '(default)';

/** Enough config to start the app at all — this is what Auth needs. */
export const isFirebaseConfigured = () =>
  config.apiKey.trim().length > 0 && config.projectId.trim().length > 0;

/** Firestore needs nothing beyond the base config. */
export const isDatabaseConfigured = () => isFirebaseConfigured();

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

function getApp(): FirebaseApp | null {
  if (!isFirebaseConfigured()) return null;
  app = app ?? initializeApp(config);
  return app;
}

/** Lazily initialise on first use; returns null when unconfigured. */
export function getDb(): Firestore | null {
  const instance = getApp();
  if (!instance) return null;
  if (!db) db = getFirestore(instance, DATABASE_ID);
  return db;
}

/** Firebase Auth, used only for "Continue with Google". */
export function getAuthInstance(): Auth | null {
  const instance = getApp();
  if (!instance) return null;
  if (!auth) auth = getAuth(instance);
  return auth;
}
