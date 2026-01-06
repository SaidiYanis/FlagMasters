import { computed, reactive, toRefs } from 'vue'
import { generateQuiz } from '../services/quizClientService'
import { DIFFICULTY_RANGES } from '../../shared/quizConstants.js'

const FLAG_BG_DEFAULT = '#0b1120'
const FLAG_BG_MAP = Object.freeze({
  JP: '#f5f5f5',
  FR: '#0f172a',
  US: '#1f2937',
  DE: '#111827',
  CN: '#1a0b0b'
})

export { DIFFICULTY_RANGES }

const INITIAL_MESSAGE = 'Choisis une réponse pour commencer.'

export function useQuiz({ user, sounds, recordScoreIncrement } = {}) {
  const state = reactive({
    quizOptions: {
      difficulty: 'easy',
      mode: 'country-to-flag',
      totalQuestions: 10
    },
    screen: 'menu',
    menuGameMode: 'country-to-flag',
    menuDifficulty: 'easy',
    menuQuestions: 10,
    totalQuestions: 0,
    questionIndex: 0,
    score: 0,
    currentQuestion: null,
    questions: [],
    answered: false,
    selectedCode: null,
    message: INITIAL_MESSAGE,
    flagLoadError: false
  })

  const questionText = computed(() => {
    if (!state.currentQuestion) return ''
    return state.quizOptions.mode === 'country-to-flag'
      ? `Quel est le drapeau de ${state.currentQuestion.name} ?`
      : `À quel pays appartient ce drapeau ?`
  })

  const flagUrl = computed(() => {
    if (!state.currentQuestion || state.flagLoadError) return ''
    return state.currentQuestion.flagUrl
  })

  const isFinished = computed(() => state.questionIndex >= state.totalQuestions && state.answered)
  const flagBgStyle = computed(() => flagBgStyleForCurrent(state.currentQuestion))

  function flagBgStyleForCurrent(country) {
    if (!country) return { '--flag-bg': FLAG_BG_DEFAULT }
    const col = FLAG_BG_MAP[country.code] || FLAG_BG_DEFAULT
    return { '--flag-bg': col }
  }

  function resetQuestionState(msg = '') {
    state.answered = false
    state.selectedCode = null
    state.flagLoadError = false
    state.message = msg
  }

  function resetQuiz() {
    state.score = 0
    state.questionIndex = 0
    state.currentQuestion = null
    state.questions = []
    resetQuestionState(INITIAL_MESSAGE)
  }

  function nextQuestion() {
    if (!state.questions.length || state.questionIndex >= state.questions.length) {
      state.message = 'Fin du quiz.'
      return
    }
    resetQuestionState('')
    const q = state.questions[state.questionIndex]
    state.currentQuestion = q
    state.questionIndex += 1
  }

  async function handleAnswer(option) {
    if (state.answered || !state.currentQuestion) return

    sounds?.playClick?.()
    state.answered = true
    state.selectedCode = option.code

    const isCorrect = option.code === state.currentQuestion.code
    if (isCorrect) {
      state.score += 1
      state.message = 'Bravo, bonne réponse !'
      sounds?.playGood?.()
    } else {
      state.message =
        state.quizOptions.mode === 'country-to-flag'
          ? 'Mauvaise réponse.'
          : `Mauvaise réponse. La bonne réponse était ${state.currentQuestion.name}.`
      sounds?.playBad?.()
    }

    if (recordScoreIncrement) {
      try {
        await recordScoreIncrement(isCorrect)
      } catch (err) {
        console.warn('[renderer] score sync failed', err)
      }
    }

    if (isFinished.value) {
      state.message += `  Quiz terminé ! Score final : ${state.score} / ${state.totalQuestions}`
    }
  }

  function buttonClass(option) {
    if (!state.answered) return ''
    if (option.code === state.currentQuestion?.code) return 'correct'
    if (option.code === state.selectedCode && option.code !== state.currentQuestion?.code) return 'wrong'
    return ''
  }

  function onFlagError() {
    state.flagLoadError = true
    state.message = `Impossible de charger le drapeau pour ${state.currentQuestion?.name || 'ce pays'}.`
  }

  function backToMenu({ silent = false } = {}) {
    if (!silent) sounds?.playClick?.()
    state.screen = 'menu'
    resetQuiz()
    state.message = 'Choisis tes options puis lance la partie.'
  }

  function handleNext() {
    sounds?.playClick?.()
    nextQuestion()
  }

  async function fetchQuiz() {
    resetQuiz()
    const payload = {
      mode: state.quizOptions.mode,
      difficulty: state.quizOptions.difficulty,
      totalQuestions: state.quizOptions.totalQuestions
    }
    try {
      const res = await generateQuiz(payload)
      state.questions = Array.isArray(res?.questions) ? res.questions : []
      state.totalQuestions = res?.totalQuestions || state.questions.length
      if (state.totalQuestions > 0) {
        nextQuestion()
      } else {
        state.message = 'Aucun pays disponible pour le quiz.'
      }
    } catch (err) {
      console.error('[renderer] quiz generation failed', err)
      state.message = 'Impossible de générer le quiz.'
    }
  }

  function startGame() {
    if (!user?.value) {
      state.message = 'Connecte-toi avec Google pour jouer.'
      return
    }
    sounds?.playClick?.()
    sounds?.playStart?.()
    state.quizOptions.difficulty = state.menuDifficulty
    state.quizOptions.mode = state.menuGameMode
    state.quizOptions.totalQuestions = state.menuQuestions
    state.screen = 'game'
    fetchQuiz()
  }

  return {
    ...toRefs(state),
    state,
    questionText,
    flagUrl,
    isFinished,
    flagBgStyle,
    flagBgStyleForCurrent,
    startGame,
    backToMenu,
    handleAnswer,
    handleNext,
    buttonClass,
    onFlagError
  }
}
