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
export async function signInWithGoogle(): Promise<GoogleSignInResult> {
  const auth = getAuthInstance();
  if (!auth) return { ok: false, error: 'Firebase is not configured.' };

  try {
    const credential = await signInWithPopup(auth, new GoogleAuthProvider());
    const { displayName, email } = credential.user;
    if (!email) return { ok: false, error: 'Google did not return an email address.' };
    return { ok: true, name: displayName || email.split('@')[0], email };
  } catch (err) {
    const code = (err as { code?: string })?.code ?? '';

    // Closing the popup or starting a second one isn't a failure worth shouting about.
    if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
      return { ok: false };
    }
    if (code === 'auth/popup-blocked') {
      return { ok: false, error: 'Your browser blocked the sign-in popup. Allow popups and retry.' };
    }
    if (code === 'auth/unauthorized-domain') {
      return {
        ok: false,
        error: 'This domain is not authorised in Firebase Auth settings.',
      };
    }
    if (code === 'auth/operation-not-allowed') {
      return {
        ok: false,
        error: 'Google sign-in is not enabled for this Firebase project.',
      };
    }

    console.error('Google sign-in failed', err);
    return { ok: false, error: 'Google sign-in failed. Try again.' };
  }
}
