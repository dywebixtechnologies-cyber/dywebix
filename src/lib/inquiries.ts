/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  collection,
  deleteField,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { Inquiry } from '../types';
import { getDb } from './firebase';

const COLLECTION = 'inquiries';
const STORAGE_KEY = 'inquiries';

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

/** Newest first. An empty store stays empty — nothing is seeded. */
export async function listInquiries(): Promise<Inquiry[]> {
  const db = getDb();

  if (!db) return readLocal();

  const snap = await getDocs(query(collection(db, COLLECTION), orderBy('timestamp', 'desc')));
  return snap.docs.map((d) => ({ ...(d.data() as Inquiry), id: d.id }));
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
  await setDoc(doc(db, COLLECTION, inquiry.id), inquiry);
}

/**
 * Apply a partial update to one inquiry. Keys set to `undefined` mean "clear
 * this field" — Firestore rejects undefined outright, so they become deleteField().
 */
export async function updateInquiry(id: string, patch: Partial<Inquiry>): Promise<void> {
  const db = getDb();
  if (!db) {
    writeLocal(readLocal().map((i) => (i.id === id ? { ...i, ...patch } : i)));
    return;
  }

  const payload: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(patch)) {
    payload[key] = value === undefined ? deleteField() : value;
  }
  await updateDoc(doc(db, COLLECTION, id), payload);
}

export async function deleteInquiry(id: string): Promise<void> {
  const db = getDb();
  if (!db) {
    writeLocal(readLocal().filter((i) => i.id !== id));
    return;
  }
  await deleteDoc(doc(db, COLLECTION, id));
}

/**
 * Live updates. With Firestore this pushes changes from other devices; on the
 * localStorage fallback it only fires for writes from *other* tabs, which is
 * the best a single-device store can do. Returns an unsubscribe function.
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

  return onSnapshot(query(collection(db, COLLECTION), orderBy('timestamp', 'desc')), (snap) =>
    onChange(snap.docs.map((d) => ({ ...(d.data() as Inquiry), id: d.id }))),
  );
}
