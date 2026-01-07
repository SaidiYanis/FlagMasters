<template>
  <div class="page app-shell">
    <div class="bg-map"></div>

    <TopBar
      :logo="logo"
      :screen="screen"
      :user="user"
      @back="backToMenu"
      @show-scores="showScores"
      @logout="logout"
    />

    <main class="content main-area">
      <div v-if="user" :class="['card', 'glass', screen === 'menu' ? 'menu-card' : 'game-card']">
        <transition name="fade-slide" mode="out-in">
          <MenuPanel
            v-if="screen === 'menu'"
            key="menu"
            :game-mode="menuGameMode"
            :difficulty="menuDifficulty"
            :questions="menuQuestions"
            @update:gameMode="menuGameMode = $event"
            @update:difficulty="menuDifficulty = $event"
            @update:questions="menuQuestions = $event"
            @start="startGame"
          />
          <GamePanel
            v-else
            key="game"
            :quiz-options="quizOptions"
            :question-index="questionIndex"
            :total-questions="totalQuestions"
            :question-text="questionText"
            :current-question="currentQuestion"
            :answered="answered"
            :is-finished="isFinished"
            :message="message"
            :flag-url="flagUrl"
            :flag-bg-style="flagBgStyle"
            :flag-bg-style-for="flagBgStyleForCurrent"
            :button-class="buttonClass"
            :score="score"
            @answer="handleAnswer"
            @next="handleNext"
            @end="backToMenu"
            @flag-error="onFlagError"
          />
        </transition>
      </div>
      <div v-else class="card glass menu-card login-card">
        <h2>Connexion requise</h2>
        <p>Connecte-toi avec Google pour jouer et enregistrer tes scores.</p>
        <button class="primary-btn" type="button" @click="login">Se connecter avec Google</button>
        <p v-if="authError" class="login-error">{{ authError }}</p>
      </div>
    </main>

    <ScoreModal :visible="scoreModal" :scores="sortedScores" @close="scoreModal = false" />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import logo from '../../resources/logo.png'
import TopBar from './components/TopBar.vue'
import MenuPanel from './components/MenuPanel.vue'
import GamePanel from './components/GamePanel.vue'
import ScoreModal from './components/ScoreModal.vue'
import { loadInitialConfig, applyConfigToState } from './services/configService'
import { useSounds } from './composables/useSounds'
import { useAuth } from './composables/useAuth'
import { useScores } from './composables/useScores'
import { useQuiz, DIFFICULTY_RANGES } from './composables/useQuiz'
import buttonSfxUrl from '../../resources/button.mp3'
import goodSfxUrl from '../../resources/good.mp3'
import badSfxUrl from '../../resources/bad.mp3'
import startSfxUrl from '../../resources/start.mp3'

const { playClick, playGood, playBad, playStart } = useSounds({
  click: buttonSfxUrl,
  good: goodSfxUrl,
  bad: badSfxUrl,
  start: startSfxUrl
})

const { user, initAuth, login: loginAuth, logout: logoutAuth } = useAuth()
const authError = ref('')

const {
  scores,
  scoreModal,
  sortedScores,
  loadScores,
  showScores,
  resetScores,
  recordScoreIncrement
} = useScores(user)

const {
  state: quizState,
  quizOptions,
  totalQuestions,
  questionIndex,
  score,
  currentQuestion,
  answered,
  message,
  screen,
  menuGameMode,
  menuDifficulty,
  menuQuestions,
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
} = useQuiz({
  user,
  sounds: { playClick, playGood, playBad, playStart },
  recordScoreIncrement
})

const handleAuthChange = (u) => {
  if (u?.uid) {
    console.log('[renderer] user connected', u.uid)
    authError.value = ''
    backToMenu({ silent: true })
    loadScores()
  } else {
    console.log('[renderer] user signed out')
    resetScores()
    message.value = 'Connecte-toi avec Google pour jouer.'
    backToMenu({ silent: true })
  }
}

onMounted(() => {
  initAuth(handleAuthChange)

  loadInitialConfig(window.api?.config)
    .then((cfg) => {
      quizState.loadedConfig = cfg
      applyConfigToState(cfg, quizState, DIFFICULTY_RANGES)
    })
    .catch(() => {})
    .finally(() => {
      if (user.value) loadScores()
    })
})

async function login() {
  try {
    console.log('[renderer] login click')
    authError.value = ''
    const res = await loginAuth()
    if (res?.uid) {
      backToMenu({ silent: true })
      loadScores()
    } else {
      authError.value = 'Connexion Google non aboutie.'
      message.value = authError.value
    }
  } catch (err) {
    const code = err?.code || 'unknown'
    const text = err?.message || 'Connexion Google impossible.'
    console.error('[renderer] login error', err)
    authError.value = `Connexion Google impossible: ${code}`
    message.value = text
  }
}

async function logout() {
  try {
    await logoutAuth()
  } catch (err) {
    console.error('[renderer] logout error', err)
  } finally {
    resetScores()
    message.value = 'Connecte-toi avec Google pour jouer.'
    backToMenu({ silent: true })
  }
}
</script>
