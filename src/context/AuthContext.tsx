/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';

export interface AuthUser {
  /** Supabase auth user id — this is what RLS policies are keyed on. */
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

interface AuthResult {
  ok: boolean;
  error?: string;
  user?: AuthUser;
  /** Set when the account was created but needs email confirmation first. */
  needsConfirmation?: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAdmin: boolean;
  /** True until the stored session has been restored — gate redirects on this. */
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  signup: (name: string, email: string, password: string) => Promise<AuthResult>;
  loginWithGoogle: () => Promise<AuthResult>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const NOT_CONFIGURED: AuthResult = {
  ok: false,
  error: 'Accounts are not configured for this build.',
};

/**
 * Number of registered accounts, for the admin overview. Only an admin can
 * read every profile, so this returns 0 for everyone else by policy.
 */
export async function getRegisteredUserCount(): Promise<number> {
  const db = getSupabase();
  if (!db) return 0;
  const { count, error } = await db
    .from('profiles')
    .select('*', { count: 'exact', head: true });
  if (error) return 0;
  return count ?? 0;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Build the app's user from the Supabase session plus its profile row.
   * The admin flag is read from the database, never from anything the client
   * could set — that is the whole point of moving it off a hardcoded constant.
   */
  const hydrate = async (): Promise<AuthUser | null> => {
    const db = getSupabase();
    if (!db) return null;

    const { data: sessionData } = await db.auth.getUser();
    const authUser = sessionData.user;
    if (!authUser) return null;

    const { data: profile } = await db
      .from('profiles')
      .select('name, is_admin')
      .eq('id', authUser.id)
      .maybeSingle();

    const meta = authUser.user_metadata ?? {};
    return {
      id: authUser.id,
      name:
        profile?.name ||
        (meta.name as string) ||
        (meta.full_name as string) ||
        authUser.email?.split('@')[0] ||
        'Account',
      email: authUser.email ?? '',
      role: profile?.is_admin ? 'admin' : 'user',
    };
  };

  useEffect(() => {
    const db = getSupabase();
    if (!db) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    void hydrate().then((u) => {
      if (!cancelled) {
        setUser(u);
        setLoading(false);
      }
    });

    // Covers sign-in, sign-out, token refresh, and the OAuth redirect landing.
    const { data: sub } = db.auth.onAuthStateChange(() => {
      void hydrate().then((u) => !cancelled && setUser(u));
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    const db = getSupabase();
    if (!db) return NOT_CONFIGURED;

    const normalized = email.trim().toLowerCase();
    if (!normalized || !password) {
      return { ok: false, error: 'Email and password are required.' };
    }

    const { error } = await db.auth.signInWithPassword({
      email: normalized,
      password,
    });
    if (error) {
      // Supabase deliberately does not say which half was wrong.
      if (error.message.toLowerCase().includes('email not confirmed')) {
        return { ok: false, error: 'Confirm your email address first — check your inbox.' };
      }
      return { ok: false, error: 'Incorrect email or password.' };
    }

    const account = await hydrate();
    setUser(account);
    return { ok: true, user: account ?? undefined };
  };

  const signup = async (name: string, email: string, password: string): Promise<AuthResult> => {
    const db = getSupabase();
    if (!db) return NOT_CONFIGURED;

    const trimmedName = name.trim();
    const normalized = email.trim().toLowerCase();

    if (!trimmedName) return { ok: false, error: 'Full name is required.' };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      return { ok: false, error: 'Please enter a valid email.' };
    }
    if (password.length < 6) {
      // Supabase enforces 6 characters; say so before the round-trip.
      return { ok: false, error: 'Password must be at least 6 characters.' };
    }

    const { data, error } = await db.auth.signUp({
      email: normalized,
      password,
      options: { data: { name: trimmedName } },
    });
    if (error) {
      if (error.message.toLowerCase().includes('already registered')) {
        return { ok: false, error: 'An account with this email already exists.' };
      }
      return { ok: false, error: error.message };
    }

    // With email confirmation switched on, signUp returns no session and the
    // account is unusable until the link is clicked.
    if (!data.session) return { ok: true, needsConfirmation: true };

    const account = await hydrate();
    setUser(account);
    return { ok: true, user: account ?? undefined };
  };

  /**
   * Google sign-in via Supabase. This redirects the browser away, so nothing
   * after it runs on success; the session is picked up on the way back by
   * detectSessionInUrl and the onAuthStateChange listener above.
   */
  const loginWithGoogle = async (): Promise<AuthResult> => {
    const db = getSupabase();
    if (!db) return NOT_CONFIGURED;

    const { error } = await db.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/#dashboard` },
    });
    if (error) {
      if (error.message.toLowerCase().includes('provider is not enabled')) {
        return { ok: false, error: 'Google sign-in is not enabled for this project yet.' };
      }
      return { ok: false, error: 'Google sign-in failed. Try again.' };
    }
    return { ok: true };
  };

  const logout = async () => {
    const db = getSupabase();
    if (db) await db.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, isAdmin: user?.role === 'admin', loading, login, signup, loginWithGoogle, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

/** Whether accounts are usable at all in this build. */
export const isAuthConfigured = isSupabaseConfigured;
