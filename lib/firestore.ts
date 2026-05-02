import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "./firebase";
import type { TsumugiBook, TsumugiSnap, SnapCategory } from "../types/tsumugi";

const BOOKS = "tsumugi_books";
const SNAPS = "tsumugi_snaps";

// --- Books ---

export async function getBooks(): Promise<TsumugiBook[]> {
  const q = query(collection(db, BOOKS), orderBy("created_at", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as TsumugiBook));
}

export async function getBook(id: string): Promise<TsumugiBook | null> {
  const snap = await getDoc(doc(db, BOOKS, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as TsumugiBook;
}

export async function addBook(
  data: Omit<TsumugiBook, "id" | "created_at">
): Promise<string> {
  const ref = await addDoc(collection(db, BOOKS), {
    ...data,
    created_at: serverTimestamp(),
  });
  return ref.id;
}

export async function updateBook(
  id: string,
  data: Partial<Omit<TsumugiBook, "id" | "created_at">>
): Promise<void> {
  await updateDoc(doc(db, BOOKS, id), data);
}

export async function deleteBook(id: string): Promise<void> {
  await deleteDoc(doc(db, BOOKS, id));
}

// --- Snaps ---

export interface SnapFilter {
  category?: SnapCategory;
  book_id?: string;
}

export async function getSnaps(filter: SnapFilter = {}): Promise<TsumugiSnap[]> {
  const constraints: QueryConstraint[] = [orderBy("created_at", "desc")];
  if (filter.category) constraints.unshift(where("category", "==", filter.category));
  if (filter.book_id) constraints.unshift(where("book_id", "==", filter.book_id));
  const q = query(collection(db, SNAPS), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as TsumugiSnap));
}

export async function getSnap(id: string): Promise<TsumugiSnap | null> {
  const snap = await getDoc(doc(db, SNAPS, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as TsumugiSnap;
}

export async function addSnap(
  data: Omit<TsumugiSnap, "id" | "created_at">
): Promise<string> {
  const ref = await addDoc(collection(db, SNAPS), {
    ...data,
    created_at: serverTimestamp(),
  });
  return ref.id;
}

export async function updateSnap(
  id: string,
  data: Partial<Omit<TsumugiSnap, "id" | "created_at">>
): Promise<void> {
  await updateDoc(doc(db, SNAPS, id), data);
}

export async function deleteSnap(id: string): Promise<void> {
  await deleteDoc(doc(db, SNAPS, id));
}
