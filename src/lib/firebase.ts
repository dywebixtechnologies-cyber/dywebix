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
// These values are not secrets — they identify the project and ship in every
// client bundle by design; access is controlled by the database rules
// (database.rules.json), not by hiding this config. Set them in a .env file.
// The live project's config, committed on purpose. Firebase web config is a
// public identifier, not a credential — it is served to every visitor inside
// the JS bundle no matter what, so hiding it buys nothing. What actually
// protects the project is database.rules.json plus the Authorized domains
// list in Firebase Auth. Committing it means a deploy works without anyone
// having to remember to set environment variables.
//
// The .env values still win, so a different project can be pointed at without
// touching this file.
const DEFAULTS = {
  apiKey: 'AIzaSyBZlloNo565Kvk_9QYjGCbi1GzowUU6rik',
  authDomain: 'dywebix.firebaseapp.com',
  projectId: 'dywebix',
  storageBucket: 'dywebix.firebasestorage.app',
  messagingSenderId: '40689726664',
  appId: '1:40689726664:web:9700e01017a1d45034a1fd',
};

const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || DEFAULTS.projectId;

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || DEFAULTS.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || DEFAULTS.authDomain,
  projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || DEFAULTS.storageBucket,
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || DEFAULTS.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || DEFAULTS.appId,
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
