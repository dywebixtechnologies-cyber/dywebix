/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Inquiry } from '../types';
import { getSupabase } from './supabase';

const TABLE = 'inquiries';
const STORAGE_KEY = 'inquiries';

/* ------------------------------------------------------------------ *
 * Row mapping
 *
 * Postgres columns are snake_case (see supabase/schema.sql) while the app's
 * Inquiry type is camelCase, so every read and write passes through here.
 * `timestamp` maps to `created_at` because "timestamp" is a type name in
 * Postgres and would need quoting everywhere.
 * ------------------------------------------------------------------ */

interface InquiryRow {
  id: string;
  name: string;
  email: string;
  company: string | null;
  project_type: string;
  budget: string;
  timeline: string;
  details: string;
  created_at: string;
  read: boolean;
  accepted: boolean | null;
  accepted_at: string | null;
  finished: boolean | null;
  finished_at: string | null;
  rate: string | null;
  owner_email: string | null;
}

function toInquiry(row: InquiryRow): Inquiry {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    company: row.company ?? undefined,
    projectType: row.project_type,
    budget: row.budget,
    timeline: row.timeline,
    details: row.details,
    timestamp: row.created_at,
    read: row.read,
    accepted: row.accepted ?? undefined,
    acceptedAt: row.accepted_at ?? undefined,
    finished: row.finished ?? undefined,
    finishedAt: row.finished_at ?? undefined,
    rate: row.rate ?? undefined,
    ownerEmail: row.owner_email ?? undefined,
  };
}

/** Column name for each Inquiry field, so partial updates can be mapped too. */
const COLUMN: Record<keyof Inquiry, keyof InquiryRow> = {
  id: 'id',
  name: 'name',
  email: 'email',
  company: 'company',
  projectType: 'project_type',
  budget: 'budget',
  timeline: 'timeline',
  details: 'details',
  timestamp: 'created_at',
  read: 'read',
  accepted: 'accepted',
  acceptedAt: 'accepted_at',
  finished: 'finished',
  finishedAt: 'finished_at',
  rate: 'rate',
  ownerEmail: 'owner_email',
};

/**
 * Map a patch to column names. `undefined` means "clear this field", which in
 * SQL is NULL — dropping the key instead would leave the old value in place.
 */
function toRow(patch: Partial<Inquiry>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(patch)) {
    const column = COLUMN[key as keyof Inquiry];
    if (column) row[column] = value === undefined ? null : value;
  }
  return row;
}

/* ------------------------------------------------------------------ *
 * localStorage fallback — used verbatim until Supabase is configured.
 * ------------------------------------------------------------------ */

function readLocal(): Inquiry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as Inquiry[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(list: Inquiry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

function sortNewestFirst(list: Inquiry[]): Inquiry[] {
  return [...list].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}

/* ------------------------------------------------------------------ *
 * Public API — always async, so swapping backends never changes callers.
 * ------------------------------------------------------------------ */

/** Newest first. An empty store stays empty — nothing is seeded. */
export async function listInquiries(): Promise<Inquiry[]> {
  const db = getSupabase();
  if (!db) return sortNewestFirst(readLocal());

  const { data, error } = await db
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as InquiryRow[]).map(toInquiry);
}

/** Inquiries submitted by one signed-in user, newest first. */
export async function listInquiriesFor(ownerEmail: string): Promise<Inquiry[]> {
  const target = ownerEmail.toLowerCase();
  const db = getSupabase();

  if (!db) {
    return sortNewestFirst(readLocal()).filter((i) => i.ownerEmail?.toLowerCase() === target);
  }

  // Filter in Postgres rather than fetching the whole table to the browser.
  const { data, error } = await db
    .from(TABLE)
    .select('*')
    .ilike('owner_email', target)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as InquiryRow[]).map(toInquiry);
}

export async function countUnread(): Promise<number> {
  const db = getSupabase();
  if (!db) return readLocal().filter((i) => !i.read).length;

  // head:true asks for the count only — no rows come back over the wire.
  const { count, error } = await db
    .from(TABLE)
    .select('*', { count: 'exact', head: true })
    .eq('read', false);

  if (error) throw error;
  return count ?? 0;
}

export async function createInquiry(inquiry: Inquiry): Promise<void> {
  const db = getSupabase();
  if (!db) {
    writeLocal([inquiry, ...readLocal()]);
    return;
  }
  const { error } = await db.from(TABLE).insert(toRow(inquiry));
  if (error) throw error;
}

/**
 * Apply a partial update to one inquiry. Keys set to `undefined` mean "clear
 * this field" and are written as NULL.
 */
export async function updateInquiry(id: string, patch: Partial<Inquiry>): Promise<void> {
  const db = getSupabase();
  if (!db) {
    writeLocal(readLocal().map((i) => (i.id === id ? { ...i, ...patch } : i)));
    return;
  }
  const { error } = await db.from(TABLE).update(toRow(patch)).eq('id', id);
  if (error) throw error;
}

export async function deleteInquiry(id: string): Promise<void> {
  const db = getSupabase();
  if (!db) {
    writeLocal(readLocal().filter((i) => i.id !== id));
    return;
  }
  const { error } = await db.from(TABLE).delete().eq('id', id);
  if (error) throw error;
}

/**
 * Live updates. With Supabase this pushes row changes from other devices over
 * a websocket (requires Realtime to be enabled for the table); on the
 * localStorage fallback it only fires for writes from *other* tabs, which is
 * the best a single-device store can do. Returns an unsubscribe function.
 */
export function subscribeInquiries(onChange: (list: Inquiry[]) => void): () => void {
  const db = getSupabase();

  if (!db) {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) onChange(readLocal());
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }

  const channel = db
    .channel('inquiries-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: TABLE }, () => {
      // Any change re-reads the list; the table is small enough that this is
      // cheaper than reconciling individual row events.
      void listInquiries().then(onChange).catch(() => undefined);
    })
    .subscribe();

  return () => {
    void db.removeChannel(channel);
  };
}
