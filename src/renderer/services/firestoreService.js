import { getFirebaseApp } from './authService'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  serverTimestamp,
  setDoc
} from 'firebase/firestore'

function getDb() {
  const app = getFirebaseApp()
  return getFirestore(app)
}

function normalizeCountry(docSnap) {
  const data = docSnap.data() || {}
  const code = docSnap.id
  const mainLink = data.link || data.flagUrl || `https://flagcdn.com/w320/${code.toLowerCase()}.png`
  const flagUrl = data.flagUrl || mainLink
  const flagThumbUrl = data.flagThumbUrl || `https://flagcdn.com/w160/${code.toLowerCase()}.png`
  const enabled =
    data.enabled === undefined
      ? true
      : data.enabled === true || data.enabled === 'true' || data.enabled === 1
  return {
    code,
    ...data,
    link: mainLink,
    flagUrl,
    flagThumbUrl,
    enabled
  }
}

export async function fetchCountries() {
  const db = getDb()
  const snap = await getDocs(collection(db, 'countrySettings'))
  return snap.docs.map((docSnap) => normalizeCountry(docSnap)).filter((c) => c.enabled !== false)
}

export async function addScoreIncrement(user, payload) {
  if (!user?.uid) throw new Error('unauthenticated')
  const correct = Number.isFinite(payload?.correct) ? payload.correct : 0
  const total = Number.isFinite(payload?.total) ? payload.total : 0
  if (total <= 0 || correct < 0 || correct > total) throw new Error('invalid_score_payload')

  const db = getDb()
  const ref = doc(db, 'users', user.uid)
  const snap = await getDoc(ref)
  const prev = snap.exists() ? snap.data() : { good: 0, question: 0 }
  const prevGood = Number.isFinite(prev.good) ? prev.good : 0
  const prevQuestion = Number.isFinite(prev.question) ? prev.question : 0
  const nextGood = Math.round(prevGood + Math.min(correct, total))
  const nextQuestion = Math.round(prevQuestion + total)
  const successRate = nextQuestion > 0 ? Math.round((nextGood / nextQuestion) * 100) : 0

  await setDoc(
    ref,
    {
      displayName: user.displayName || prev.displayName || 'Joueur',
      photoURL: user.photoURL || prev.photoURL || '',
      email: user.email || prev.email || '',
      good: Number(nextGood),
      question: Number(nextQuestion),
      successRate: Number(successRate),
      updatedAt: serverTimestamp()
    },
    { merge: true }
  )

  return {
    uid: user.uid,
    displayName: user.displayName || prev.displayName || 'Joueur',
    photoURL: user.photoURL || prev.photoURL || '',
    successRate: Number(successRate),
    totalCorrect: Number(nextGood),
    totalQuestions: Number(nextQuestion)
  }
}

export async function listScores() {
  const db = getDb()
  const snap = await getDocs(collection(db, 'users'))
  return snap.docs
    .map((d) => {
      const data = d.data() || {}
      const good = Number.isFinite(data.good) ? data.good : 0
      const question = Number.isFinite(data.question) ? data.question : 0
      const successRate = question > 0 ? Math.round((good / question) * 100) : 0
      return {
        uid: d.id,
        displayName: data.displayName || 'Joueur',
        photoURL: data.photoURL || '',
        successRate: Number(successRate),
        totalCorrect: Number(good),
        totalQuestions: Number(question)
      }
    })
    .sort((a, b) => b.successRate - a.successRate || b.totalQuestions - a.totalQuestions)
}
