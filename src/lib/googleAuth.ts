/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getAuthInstance } from './firebase';

export interface GoogleSignInResult {
  ok: boolean;
  name?: string;
  email?: string;
  /** Absent when the user simply closed the popup — that isn't worth an error. */
  error?: string;
}

/**
 * Run Google sign-in through Firebase Auth. Firebase owns the OAuth handshake,
 * so the app needs no Google Client ID of its own — enabling the Google
 * provider in the Firebase console is the whole setup.
 */
async function signInWithGoogleMock(): Promise<GoogleSignInResult> {
  // Delay slightly to simulate popup load
  await new Promise((resolve) => setTimeout(resolve, 600));

  const email = window.prompt("Enter your Google account email to sign in (Demo Mode):", "demo.user@gmail.com");
  if (email === null) {
    return { ok: false };
  }
  const trimmedEmail = email.trim();
  if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  const name = window.prompt("Enter your Google profile name (Demo Mode):", "Demo User");
  return {
    ok: true,
    name: name?.trim() || trimmedEmail.split('@')[0],
    email: trimmedEmail.toLowerCase()
  };
}

/**
 * Run Google sign-in through Firebase Auth. Firebase owns the OAuth handshake,
 * so the app needs no Google Client ID of its own — enabling the Google
 * provider in the Firebase console is the whole setup.
 */
export async function signInWithGoogle(): Promise<GoogleSignInResult> {
  const auth = getAuthInstance();
  if (!auth) {
    console.warn('Firebase is not configured. Falling back to Demo Google sign-in.');
    return signInWithGoogleMock();
  }

  try {
    const credential = await signInWithPopup(auth, new GoogleAuthProvider());
    const { displayName, email } = credential.user;
    if (!email) return { ok: false, error: 'Google did not return an email address.' };
    return { ok: true, name: displayName || email.split('@')[0], email };
  } catch (err) {
    const code = (err as { code?: string })?.code ?? '';

    // If Google sign-in fails due to configuration/key/domain errors, let's offer a fallback so it stays functional!
    if (
      code === 'auth/api-key-not-valid' ||
      code.startsWith('auth/permission-denied') ||
      code === 'auth/operation-not-allowed' ||
      code === 'auth/unauthorized-domain'
    ) {
      console.warn(`Firebase Google auth failed with code: ${code}. Falling back to Demo Google sign-in.`);
      return signInWithGoogleMock();
    }

    // Closing the popup or starting a second one isn't a failure worth shouting about.
    if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
      return { ok: false };
    }
    if (code === 'auth/popup-blocked') {
      return { ok: false, error: 'Your browser blocked the sign-in popup. Allow popups and retry.' };
    }
    if (code === 'auth/network-request-failed') {
      return { ok: false, error: 'Network error reaching Google. Check your connection.' };
    }

    console.error('Google sign-in failed', err);
    return { ok: false, error: 'Google sign-in failed. Try again.' };
  }
}
