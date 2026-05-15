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
  serverTimestamp
} from "firebase/firestore";
import { db } from "./firebase";

// User Services
export const createUserProfile = async (uid: string, name: string, grade: number) => {
  await setDoc(doc(db, "users", uid), {
    name,
    grade,
    xp: 0,
    quizzesDone: [],
  });
};

export const getUserData = async (uid: string) => {
  const userDoc = await getDoc(doc(db, "users", uid));
  return userDoc.exists() ? userDoc.data() : null;
};

// Subject Services
export const getSubjectsByGrade = async (grade: number) => {
  const q = query(collection(db, "subjects"), where("grade", "==", grade));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Study Material Services
export const getStudyMaterialBySubject = async (subjectId: string) => {
  const q = query(collection(db, "studyMaterial"), where("subjectId", "==", subjectId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getMaterialById = async (materialId: string) => {
  const materialDoc = await getDoc(doc(db, "studyMaterial", materialId));
  return materialDoc.exists() ? { id: materialDoc.id, ...materialDoc.data() } : null;
};

// Quiz Services
export const getQuizzesBySubject = async (subjectId: string) => {
  const q = query(collection(db, "quizzes"), where("subjectId", "==", subjectId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getQuizById = async (quizId: string) => {
  const quizDoc = await getDoc(doc(db, "quizzes", quizId));
  return quizDoc.exists() ? { id: quizDoc.id, ...quizDoc.data() } : null;
};

// Quiz Result & Gamification
export const submitQuizResult = async (uid: string, quizId: string, score: number, total: number, xpReward: number) => {
  // Add quiz result
  await addDoc(collection(db, "quizResults"), {
    uid,
    quizId,
    score,
    total,
    completedAt: serverTimestamp(),
  });

  // Update user XP and quizzesDone
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    xp: increment(xpReward),
    quizzesDone: arrayUnion(quizId),
  });
};
