import { db } from "./firebase"
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore"

export interface Note {
  id: string
  title: string
  content: string
  createdAt: number
  updatedAt: number
}

const STORAGE_KEY = "bit2byte_notes"

// ─── LocalStorage ───

function getLocalNotes(): Note[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function setLocalNotes(notes: Note[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
}

// ─── CRUD ───

export function getNotes(): Note[] {
  return getLocalNotes()
}

export function getNote(id: string): Note | undefined {
  return getLocalNotes().find((n) => n.id === id)
}

export function saveNoteLocally(note: Note) {
  const notes = getLocalNotes()
  const idx = notes.findIndex((n) => n.id === note.id)
  if (idx >= 0) {
    notes[idx] = { ...note, updatedAt: Date.now() }
  } else {
    notes.push({ ...note, createdAt: Date.now(), updatedAt: Date.now() })
  }
  setLocalNotes(notes)
}

export function deleteNoteLocally(id: string) {
  setLocalNotes(getLocalNotes().filter((n) => n.id !== id))
}

// ─── Firestore sync ───

function getDb() {
  if (!db) return null
  return db
}

let _online = typeof window !== "undefined" ? navigator.onLine : false
if (typeof window !== "undefined") {
  window.addEventListener("online", () => { _online = true })
  window.addEventListener("offline", () => { _online = false })
}

export function isOnline() {
  return _online
}

export async function syncNoteToFirestore(uid: string, note: Note) {
  const firestore = getDb()
  if (!firestore || !_online || !uid) return
  try {
    await setDoc(doc(firestore, "notes", note.id), {
      uid,
      title: note.title,
      content: note.content,
      createdAt: note.createdAt,
      updatedAt: serverTimestamp(),
    })
  } catch {
    // Silent fail — will retry next time
  }
}

export async function deleteNoteFromFirestore(uid: string, noteId: string) {
  const firestore = getDb()
  if (!firestore || !_online || !uid) return
  try {
    await deleteDoc(doc(firestore, "notes", noteId))
  } catch {}
}

export async function pullNotesFromFirestore(uid: string): Promise<Note[]> {
  const firestore = getDb()
  if (!firestore || !_online || !uid) return []
  try {
    const q = query(collection(firestore, "notes"), where("uid", "==", uid))
    const snap = await getDocs(q)
    return snap.docs.map((d) => {
      const data = d.data()
      return {
        id: d.id,
        title: data.title || "",
        content: data.content || "",
        createdAt: data.createdAt?.toMillis?.() || Date.now(),
        updatedAt: data.updatedAt?.toMillis?.() || Date.now(),
      } as Note
    })
  } catch {
    return []
  }
}

export async function mergeNotesFromFirestore(uid: string) {
  const remote = await pullNotesFromFirestore(uid)
  if (!remote.length) return
  const local = getLocalNotes()
  const merged = [...local]

  for (const rn of remote) {
    const localIdx = local.findIndex((n) => n.id === rn.id)
    if (localIdx >= 0) {
      // Keep whichever was updated more recently
      if (rn.updatedAt > local[localIdx].updatedAt) {
        merged[localIdx] = rn
      }
    } else {
      merged.push(rn)
    }
  }

  setLocalNotes(merged)
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}
