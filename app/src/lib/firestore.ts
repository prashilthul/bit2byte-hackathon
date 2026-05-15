import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  increment,
  arrayUnion,
  addDoc,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "./firebase"

function getDb() {
  if (!db) throw new Error("Firestore not initialized (server-side)")
  return db
}

export const createUserProfile = async (uid: string, name: string, grade: number) => {
  await setDoc(doc(getDb(), "users", uid), {
    name,
    grade,
    xp: 0,
    quizzesDone: [],
  })
}

export const updateUserGrade = async (uid: string, grade: number) => {
  await updateDoc(doc(getDb(), "users", uid), { grade })
}

export const getUserData = async (uid: string) => {
  const userDoc = await getDoc(doc(getDb(), "users", uid))
  return userDoc.exists() ? userDoc.data() : null
}

export const getSubjectsByGrade = async (grade: number) => {
  const q = query(collection(getDb(), "subjects"), where("grades", "array-contains", grade))
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export const getStudyMaterialBySubject = async (subjectId: string) => {
  const q = query(collection(getDb(), "studyMaterial"), where("subjectId", "==", subjectId))
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export const getMaterialById = async (materialId: string) => {
  const materialDoc = await getDoc(doc(getDb(), "studyMaterial", materialId))
  return materialDoc.exists() ? { id: materialDoc.id, ...materialDoc.data() } : null
}

export const getQuizzesBySubject = async (subjectId: string) => {
  const q = query(collection(getDb(), "quizzes"), where("subjectId", "==", subjectId))
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export const getQuizById = async (quizId: string) => {
  const quizDoc = await getDoc(doc(getDb(), "quizzes", quizId))
  return quizDoc.exists() ? { id: quizDoc.id, ...quizDoc.data() } : null
}

export const submitQuizResult = async (
  uid: string,
  quizId: string,
  score: number,
  total: number,
  xpReward: number
) => {
  await addDoc(collection(getDb(), "quizResults"), {
    uid,
    quizId,
    score,
    total,
    completedAt: serverTimestamp(),
  })

  const userRef = doc(getDb(), "users", uid)
  await updateDoc(userRef, {
    xp: increment(xpReward),
    quizzesDone: arrayUnion(quizId),
  })
}
