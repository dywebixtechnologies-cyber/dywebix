/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { get, onValue, ref, remove, set, update } from 'firebase/database';
import { Inquiry } from '../types';
import { getDb } from './firebase';

const NODE = 'inquiries';
const STORAGE_KEY = 'inquiries';

// Seeded when the store is completely empty, so a fresh admin inbox isn't blank.
export const SAMPLE_INQUIRY: Inquiry = {
  id: 'PROJ-1',
  name: 'Adrian Croft',
  email: 'adrian@creativeagency.co',
  company: 'Croft Creative Studio',
  projectType: 'Creative Agency/Editorial Portfolio',
  budget: '₹2,50,000 - ₹4,00,000',
  timeline: 'Standard (3-4 weeks)',
  details:
    'We are looking for a highly refined portfolio gallery to showcase our architectural renders. Needs to load within 0.8 seconds and support smooth high-fidelity transitions between pages.',
  timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
  read: false,
};

/** Newest first. */
function sortNewestFirst(list: Inquiry[]): Inquiry[] {
  return [...list].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}

/** The database stores inquiries keyed by id; flatten that back to an array. */
function toList(value: unknown): Inquiry[] {
  if (!value || typeof value !== 'object') return [];
  return sortNewestFirst(Object.values(value as Record<string, Inquiry>));
}

/* ------------------------------------------------------------------ *
 * localStorage fallback — used verbatim until Firebase is configured.
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

/* ------------------------------------------------------------------ *
 * Public API — always async, so swapping backends never changes callers.
 * ------------------------------------------------------------------ */

/** Newest first. Seeds the sample inquiry when the store is empty. */
export async function listInquiries(): Promise<Inquiry[]> {
  const db = getDb();

  if (!db) {
    const local = readLocal();
    if (local.length === 0) {
      writeLocal([SAMPLE_INQUIRY]);
      return [SAMPLE_INQUIRY];
    }
    return sortNewestFirst(local);
  }

  const snap = await get(ref(db, NODE));
  const list = toList(snap.val());
  if (list.length === 0) {
    await set(ref(db, `${NODE}/${SAMPLE_INQUIRY.id}`), SAMPLE_INQUIRY);
    return [SAMPLE_INQUIRY];
  }
  return list;
}

/** Inquiries submitted by one signed-in user, newest first. */
export async function listInquiriesFor(ownerEmail: string): Promise<Inquiry[]> {
  const all = await listInquiries();
  const target = ownerEmail.toLowerCase();
  return all.filter((i) => i.ownerEmail?.toLowerCase() === target);
}

export async function countUnread(): Promise<number> {
  return (await listInquiries()).filter((i) => !i.read).length;
}

export async function createInquiry(inquiry: Inquiry): Promise<void> {
  const db = getDb();
  if (!db) {
    writeLocal([inquiry, ...readLocal()]);
    return;
  }
  // Undefined optional fields would be rejected; drop them.
  const clean = Object.fromEntries(
    Object.entries(inquiry).filter(([, v]) => v !== undefined),
  );
  await set(ref(db, `${NODE}/${inquiry.id}`), clean);
}

/**
 * Apply a partial update to one inquiry. Keys set to `undefined` mean "clear
 * this field" — the database rejects undefined, and writing null deletes a key.
 */
export async function updateInquiry(id: string, patch: Partial<Inquiry>): Promise<void> {
  const db = getDb();
  if (!db) {
    writeLocal(readLocal().map((i) => (i.id === id ? { ...i, ...patch } : i)));
    return;
  }

  const payload: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(patch)) {
    payload[key] = value === undefined ? null : value;
  }
  await update(ref(db, `${NODE}/${id}`), payload);
}

export async function deleteInquiry(id: string): Promise<void> {
  const db = getDb();
  if (!db) {
    writeLocal(readLocal().filter((i) => i.id !== id));
    return;
  }
  await remove(ref(db, `${NODE}/${id}`));
}

/**
 * Live updates. With the database this pushes changes from other devices; on
 * the localStorage fallback it only fires for writes from *other* tabs, which
 * is the best a single-device store can do. Returns an unsubscribe function.
 */
export function subscribeInquiries(onChange: (list: Inquiry[]) => void): () => void {
  const db = getDb();

  if (!db) {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) onChange(readLocal());
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }

  return onValue(ref(db, NODE), (snap) => onChange(toList(snap.val())));
}
