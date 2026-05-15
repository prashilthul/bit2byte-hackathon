import { db } from "./firebase"
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  collection,
  onSnapshot,
  type Unsubscribe,
} from "firebase/firestore"

export interface BattlePlayer {
  uid: string
  name: string
  score: number
  answers: { qIdx: number; answer: number; timeMs: number; correct: boolean }[]
  lastAnswerMs: number
}

export interface BattleRoom {
  code: string
  status: "waiting" | "playing" | "finished"
  hostId: string
  currentQ: number
  questions: { q: string; options: string[]; answer: number }[]
  questionStartMs: number
  createdAt: number
}

function getDb() {
  if (!db) throw new Error("Firestore not initialized")
  return db
}

export function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

export async function createRoom(hostId: string, hostName: string): Promise<string> {
  let code = generateRoomCode()
  // Ensure uniqueness
  for (let attempt = 0; attempt < 5; attempt++) {
    const existing = await getDoc(doc(getDb(), "rooms", code))
    if (!existing.exists()) break
    code = generateRoomCode()
  }

  const questions = [
    { q: "What is the chemical symbol for water?", options: ["H2O", "CO2", "NaCl", "O2"], answer: 0 },
    { q: "What planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Saturn"], answer: 1 },
    { q: "What is the square root of 144?", options: ["10", "11", "12", "13"], answer: 2 },
    { q: "Which gas do plants absorb from the atmosphere?", options: ["Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"], answer: 2 },
    { q: "What is the speed of light approximately?", options: ["300,000 km/s", "150,000 km/s", "500,000 km/s", "100,000 km/s"], answer: 0 },
    { q: "Who developed the theory of relativity?", options: ["Newton", "Einstein", "Galileo", "Hawking"], answer: 1 },
    { q: "What does CPU stand for?", options: ["Central Process Unit", "Central Processing Unit", "Computer Personal Unit", "Core Process Unit"], answer: 1 },
    { q: "What is the largest organ in the human body?", options: ["Liver", "Brain", "Heart", "Skin"], answer: 3 },
    { q: "What element has atomic number 1?", options: ["Helium", "Hydrogen", "Lithium", "Carbon"], answer: 1 },
    { q: "What is the powerhouse of the cell?", options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi"], answer: 2 },
  ]

  const room: BattleRoom = {
    code,
    status: "waiting",
    hostId,
    currentQ: 0,
    questions,
    questionStartMs: 0,
    createdAt: Date.now(),
  }

  await setDoc(doc(getDb(), "rooms", code), room)

  // Add host as player
  const playerRef = doc(getDb(), "rooms", code, "players", hostId)
  await setDoc(playerRef, {
    uid: hostId,
    name: hostName,
    score: 0,
    answers: [],
    lastAnswerMs: 0,
  })

  return code
}

export async function joinRoom(code: string, uid: string, name: string): Promise<boolean> {
  const roomDoc = await getDoc(doc(getDb(), "rooms", code.toUpperCase()))
  if (!roomDoc.exists()) return false

  const room = roomDoc.data() as BattleRoom
  if (room.status !== "waiting") return false

  const playerRef = doc(getDb(), "rooms", code.toUpperCase(), "players", uid)
  await setDoc(playerRef, {
    uid,
    name,
    score: 0,
    answers: [],
    lastAnswerMs: 0,
  })

  return true
}

export async function startBattle(code: string) {
  const now = Date.now()
  await updateDoc(doc(getDb(), "rooms", code), {
    status: "playing",
    currentQ: 0,
    questionStartMs: now,
  })
}

export async function submitAnswer(
  code: string,
  uid: string,
  qIdx: number,
  answer: number,
  timeMs: number,
  correct: boolean
) {
  const basePoints = correct ? 500 : 0
  const timeBonus = correct ? Math.max(0, 1000 - Math.floor(timeMs / 15)) : 0
  const pointGain = basePoints + timeBonus

  const playerRef = doc(getDb(), "rooms", code, "players", uid)
  const playerDoc = await getDoc(playerRef)
  const player = playerDoc.data() as BattlePlayer | undefined
  const newScore = (player?.score || 0) + pointGain

  await updateDoc(playerRef, {
    score: newScore,
    lastAnswerMs: Date.now(),
    answers: [...(player?.answers || []), { qIdx, answer, timeMs, correct }],
  })
}

export async function goToNextQuestion(code: string, nextQ: number, total: number) {
  if (nextQ >= total) {
    await updateDoc(doc(getDb(), "rooms", code), { status: "finished" })
  } else {
    await updateDoc(doc(getDb(), "rooms", code), {
      currentQ: nextQ,
      questionStartMs: Date.now(),
    })
  }
}

export function subscribeRoom(code: string, cb: (room: BattleRoom | null) => void): Unsubscribe {
  return onSnapshot(doc(getDb(), "rooms", code), (snap) => {
    cb(snap.exists() ? (snap.data() as BattleRoom) : null)
  })
}

export function subscribePlayers(
  code: string,
  cb: (players: BattlePlayer[]) => void
): Unsubscribe {
  return onSnapshot(collection(getDb(), "rooms", code, "players"), (snap) => {
    const players = snap.docs.map((d) => d.data() as BattlePlayer)
    players.sort((a, b) => b.score - a.score)
    cb(players)
  })
}

export async function deleteRoom(code: string) {
  await deleteDoc(doc(getDb(), "rooms", code))
}

export async function updateRating(uid: string, category: string, delta: number) {
  const ref = doc(getDb(), "users", uid, "ratings", category)
  const existing = await getDoc(ref)
  const current = existing.data()?.rating ?? 1000
  const newRating = Math.max(0, current + delta)
  await setDoc(ref, { rating: newRating, updatedAt: Date.now() })

  const historyRef = doc(collection(getDb(), "users", uid, "ratings", category, "history"))
  await setDoc(historyRef, { rating: newRating, delta, timestamp: Date.now() })
}

export async function getRating(uid: string, category: string): Promise<number> {
  const ref = doc(getDb(), "users", uid, "ratings", category)
  const snap = await getDoc(ref)
  return snap.data()?.rating ?? 1000
}

export async function getRatingHistory(uid: string, category: string): Promise<{ rating: number; delta: number; timestamp: number }[]> {
  const snap = await getDocs(collection(getDb(), "users", uid, "ratings", category, "history"))
  return snap.docs.map((d) => d.data() as { rating: number; delta: number; timestamp: number })
    .sort((a, b) => a.timestamp - b.timestamp)
}

export function calculateRatingDelta(
  myScore: number,
  scores: number[]
): number {
  if (scores.length <= 1) return 0
  const sorted = [...scores].sort((a, b) => b - a)
  const rank = sorted.indexOf(myScore)
  const total = sorted.length

  if (rank === 0) return +25  // 1st
  if (rank === 1) return +12  // 2nd
  if (rank <= Math.ceil(total / 2)) return +5
  if (rank === total - 1) return -10
  return -5
}
