/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Supabase hosts the Postgres database and exposes it over an HTTP API the
// browser can call — a browser cannot speak Postgres' wire protocol directly.
//
// The anon key is designed to be public: it identifies the project and carries
// no privileges of its own. Row Level Security policies (see supabase/schema.sql)
// are what actually decide who may read and write. Never put the *service role*
// key in this file — that one bypasses RLS entirely.
const url = import.meta.env.VITE_SUPABASE_URL ?? '';
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

/**
 * Until a project is configured the inquiry store falls back to localStorage,
 * so the site runs with no setup.
 */
export const isSupabaseConfigured = () => url.trim().length > 0 && anonKey.trim().length > 0;

let client: SupabaseClient | null = null;

/** Lazily create the client on first use; returns null when unconfigured. */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!client) {
    // Supabase owns authentication, so it must persist and refresh the
    // session itself — that JWT is what every RLS policy is evaluated against.
    client = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return client;
}
