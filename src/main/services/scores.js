import { getAdminDb, getCurrentUid } from './auth.js'

export function createScoreService() {
  const clamp = (val, min, max) => Math.min(Math.max(val, min), max)

  function validatePayload(payload) {
    if (!payload || typeof payload !== 'object') return { ok: false, reason: 'invalid_payload' }
    const correct = Number.isFinite(payload.correct) ? payload.correct : 0
    const total = Number.isFinite(payload.total) ? payload.total : 0
    const displayName = typeof payload.displayName === 'string' ? payload.displayName.trim() : ''
    const photoURL = typeof payload.photoURL === 'string' ? payload.photoURL : ''
    const email = typeof payload.email === 'string' ? payload.email : ''
    if (total <= 0 || correct < 0 || correct > total) {
      return { ok: false, reason: 'invalid_values' }
    }
    return {
      ok: true,
      correct: Math.round(correct),
      total: Math.round(total),
      displayName,
      photoURL,
      email
    }
  }

  async function add(payload) {
    const valid = validatePayload(payload)
    if (!valid.ok) throw new Error(valid.reason || 'invalid_payload')
    const uid = getCurrentUid()
    if (!uid) throw new Error('unauthenticated')

    const db = await ensureAdminApp()
    const ref = db.collection('users').doc(uid)
    const snap = await ref.get()
    const prev = snap.exists ? snap.data() : { good: 0, question: 0 }
    const prevGood = Number.isFinite(prev.good) ? prev.good : 0
    const prevQuestion = Number.isFinite(prev.question) ? prev.question : 0
    const addedGood = clamp(valid.correct, 0, valid.total)
    const nextGood = Math.round(prevGood + addedGood)
    const nextQuestion = Math.round(prevQuestion + valid.total)
    const successRate = nextQuestion > 0 ? Math.round((nextGood / nextQuestion) * 100) : 0

    await ref.set(
      {
        displayName: valid.displayName || prev.displayName || 'Joueur',
        photoURL: valid.photoURL || prev.photoURL || '',
        email: valid.email || prev.email || '',
        good: Number(nextGood),
        question: Number(nextQuestion),
        successRate: Number(successRate),
        updatedAt: new Date()
      },
      { merge: true }
    )

    return {
      uid,
      displayName: valid.displayName || prev.displayName || 'Joueur',
      photoURL: valid.photoURL || prev.photoURL || '',
      successRate: Number(successRate),
      totalCorrect: Number(nextGood),
      totalQuestions: Number(nextQuestion)
    }
  }

  async function list() {
    const db = await ensureAdminApp()
    const snap = await db.collection('users').get()
    return snap.docs
      .map((d) => {
        const data = d.data()
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

  async function ensureAdminApp() {
    return getAdminDb()
  }

  return { add, list, validatePayload }
}
