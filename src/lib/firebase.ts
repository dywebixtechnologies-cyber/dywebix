/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Firebase web config. These values are not secrets — they identify the project
// and ship in every client bundle by design; access is controlled by Firestore
// security rules, not by hiding this config. Set them in a .env file.
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '',
};

/**
 * Firestore is used only when a project is actually configured. Until then the
 * inquiry store falls back to localStorage, so the site runs with no setup.
 */
export const isFirebaseConfigured = () =>
  config.apiKey.trim().length > 0 && config.projectId.trim().length > 0;

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

/** Lazily initialise on first use; returns null when unconfigured. */
export function getDb(): Firestore | null {
  if (!isFirebaseConfigured()) return null;
  if (!db) {
    app = app ?? initializeApp(config);
    db = getFirestore(app);
  }
  return db;
}
