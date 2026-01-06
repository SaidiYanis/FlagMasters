import { computed, ref } from 'vue'
import { addScoreIncrement, listScores } from '../services/firestoreService'

export function useScores(user) {
  const scores = ref([])
  const scoreModal = ref(false)

  const sortedScores = computed(() => {
    const arr = scores.value || []
    return [...arr].sort((a, b) => b.successRate - a.successRate || b.totalQuestions - a.totalQuestions)
  })

  const resetScores = () => {
    scores.value = []
    scoreModal.value = false
  }

  const loadScores = async () => {
    try {
      const list = await listScores()
      scores.value = Array.isArray(list) ? list : []
    } catch (err) {
      console.error('[renderer] scores load failed', err)
    }
    return scores.value
  }

  const showScores = () => {
    if (!user?.value) return Promise.resolve()
    return loadScores().finally(() => {
      scoreModal.value = true
    })
  }

  const recordScoreIncrement = async (isCorrect) => {
    if (!user?.value) return
    const payload = {
      correct: isCorrect ? 1 : 0,
      total: 1,
      displayName: user.value.displayName || 'Joueur',
      photoURL: user.value.photoURL || '',
      email: user.value.email || ''
    }
    try {
      await addScoreIncrement(user.value, payload)
    } catch (err) {
      console.warn('[renderer] score sync failed', err)
    }
  }

  return { scores, scoreModal, sortedScores, loadScores, showScores, resetScores, recordScoreIncrement }
}
