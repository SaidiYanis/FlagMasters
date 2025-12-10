<template>
  <div class="page">
    <div class="bg-map"></div>

    <TopBar
      :logo="logo"
      :screen="screen"
      :user="user"
      @back="backToMenu"
      @show-scores="showScores"
      @logout="logout"
    />

    <main class="content">
      <div v-if="user" class="card glass">
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
            :show-name-form="false"
            :players="[]"
            :selected-player-name="null"
            :custom-player-name="''"
            :score="score"
            @answer="handleAnswer"
            @next="handleNext"
            @save="backToMenu"
            @end="backToMenu"
            @update:selected-name="() => {}"
            @update:custom-name="() => {}"
            @flag-error="onFlagError"
          />
        </transition>
      </div>
      <div v-else class="card glass login-card">
        <h2>Connexion requise</h2>
        <p>Connecte-toi avec Google pour jouer et enregistrer tes scores.</p>
        <button class="primary-btn" type="button" @click="login">
          Se connecter avec Google
        </button>
      </div>
    </main>

    <ScoreModal
      :visible="scoreModal"
      :scores="sortedScores"
      @close="scoreModal = false"
    />
  </div>
</template>


<script setup>
import { computed, onMounted, reactive, toRefs } from 'vue';
import logo from '../../resources/logo.png';
import TopBar from './components/TopBar.vue';
import MenuPanel from './components/MenuPanel.vue';
import GamePanel from './components/GamePanel.vue';
import ScoreModal from './components/ScoreModal.vue';
import { loadInitialConfig, applyConfigToState } from './services/configService';
import { loginGoogle as loginFirebase, logoutGoogle, subscribeAuth } from './services/authService';
import { useSounds } from './composables/useSounds';
import buttonSfxUrl from '../../resources/button.mp3';
import goodSfxUrl from '../../resources/good.mp3';
import badSfxUrl from '../../resources/bad.mp3';
import startSfxUrl from '../../resources/start.mp3';

const DIFFICULTY_RANGES = Object.freeze({
  easy: { min: 130, max: 200 },
  normal: { min: 50, max: 175 },
  hard: { min: 0, max: 100 },
  mixed: { min: 0, max: 200 }
});

const { playClick, playGood, playBad, playStart } = useSounds({
  click: buttonSfxUrl,
  good: goodSfxUrl,
  bad: badSfxUrl,
  start: startSfxUrl
});

const FLAG_BG_DEFAULT = '#0b1120';
const FLAG_BG_MAP = Object.freeze({
  JP: '#f5f5f5',
  FR: '#0f172a',
  US: '#1f2937',
  DE: '#111827',
  CN: '#1a0b0b'
});

const state = reactive({
  quizOptions: {
    difficulty: 'easy',
    mode: 'country-to-flag',
    totalQuestions: 10
  },
  user: null,
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
  message: 'Choisis une reponse pour commencer.',
  flagLoadError: false,
  loadedConfig: null,
  scoreModal: false,
  players: [],
  scores: [],
  selectedPlayerName: null,
  customPlayerName: '',
  showNameForm: false
});

const {
  quizOptions,
  totalQuestions,
  questionIndex,
  score,
  currentQuestion,
  questions,
  answered,
  message,
  screen,
  menuGameMode,
  menuDifficulty,
  menuQuestions,
  user,
  scoreModal,
  players,
  selectedPlayerName,
  customPlayerName,
  scores,
  showNameForm
} = toRefs(state);

const questionText = computed(() => {
  if (!state.currentQuestion) return '';
  if (state.quizOptions.mode === 'country-to-flag') {
    return `Quel est le drapeau de ${state.currentQuestion.name} ?`;
  }
  return `A quel pays appartient ce drapeau ?`;
});

const flagUrl = computed(() => {
  if (!state.currentQuestion || state.flagLoadError) return '';
  return state.currentQuestion.flagUrl;
});

const isFinished = computed(() => state.questionIndex >= state.totalQuestions);
const flagBgStyle = computed(() => flagBgStyleForCurrent(state.currentQuestion));
const sortedScores = computed(() => {
  const arr = scores.value || [];
  return [...arr].sort(
    (a, b) => b.successRate - a.successRate || b.totalQuestions - a.totalQuestions
  );
});

function resetQuestionState(msg = '') {
  state.answered = false;
  state.selectedCode = null;
  state.flagLoadError = false;
  state.message = msg;
}

function resetQuiz() {
  state.score = 0;
  state.questionIndex = 0;
  state.currentQuestion = null;
  state.questions = [];
  resetQuestionState('Choisis une reponse pour commencer.');
}

function flagBgStyleForCurrent(country) {
  if (!country) return { '--flag-bg': FLAG_BG_DEFAULT };
  const col = FLAG_BG_MAP[country.code] || FLAG_BG_DEFAULT;
  return { '--flag-bg': col };
}

function nextQuestion() {
  resetQuestionState('');
  const index = state.questionIndex;
  const q = state.questions[index];
  state.currentQuestion = q;
  state.questionIndex++;
}

function handleAnswer(option) {
  if (state.answered || !state.currentQuestion) return;

  playClick();
  state.answered = true;
  state.selectedCode = option.code;

  if (option.code === state.currentQuestion.code) {
    state.score++;
    state.message = 'Bravo, bonne reponse !';
    playGood();
  } else {
    state.message =
      state.quizOptions.mode === 'country-to-flag'
        ? 'Mauvaise reponse.'
        : `Mauvaise reponse. La bonne reponse etait ${state.currentQuestion.name}.`;
    playBad();
  }

  if (isFinished.value) {
    state.message += `  Quiz termine ! Score final : ${state.score} / ${state.totalQuestions}`;
    startNameCapture();
  }
}

function buttonClass(option) {
  if (!state.answered) return '';
  if (option.code === state.currentQuestion?.code) return 'correct';
  if (option.code === state.selectedCode && option.code !== state.currentQuestion?.code) return 'wrong';
  return '';
}

function onFlagError() {
  state.flagLoadError = true;
  state.message = `Impossible de charger le drapeau pour ${state.currentQuestion?.name || 'ce pays'}.`;
}

function startGame() {
  if (!state.user) {
    state.message = 'Connecte-toi avec Google pour jouer.';
    return;
  }
  playClick();
  playStart();
  state.quizOptions.difficulty = state.menuDifficulty;
  state.quizOptions.mode = state.menuGameMode;
  state.quizOptions.totalQuestions = state.menuQuestions;
  state.screen = 'game';
  fetchQuiz();
}

function backToMenu() {
  playClick();
  state.screen = 'menu';
  state.questions = [];
  state.currentQuestion = null;
  state.message = 'Choisis tes options puis lance la partie.';
  state.questionIndex = 0;
  state.score = 0;
  state.answered = false;
  state.showNameForm = false;
}

function handleNext() {
  playClick();
  nextQuestion();
}

function startNameCapture() {
  state.selectedPlayerName = players.value.length ? players.value[0] : '__new__';
  state.customPlayerName = '';
  state.showNameForm = true;
}

async function saveAndReturnMenu() {
  playClick();
  const chosen =
    state.selectedPlayerName === '__new__'
      ? (state.customPlayerName || '').trim()
      : state.selectedPlayerName;
  const name = chosen || 'Anonyme';
  const payload = { name, correct: state.score, total: state.totalQuestions };
  if (window.api?.scores?.add) {
    const res = await window.api.scores.add(payload);
    if (res?.successRate !== undefined) {
      state.message = `Moyenne de reussite pour ${name} : ${res.successRate}%`;
    }
    if (!players.value.includes(name)) {
      state.players.push(name);
    }
    loadScores();
  }
  state.showNameForm = false;
  backToMenu();
}

async function loadScores() {
  if (!window.api?.scores?.list) return;
  const list = await window.api.scores.list();
  state.scores = Array.isArray(list) ? list : [];
  state.players = state.scores.map((s) => s.name);
}

function showScores() {
  if (!state.user) return;
  playClick();
  loadScores().finally(() => {
    state.scoreModal = true;
  });
}

async function fetchQuiz() {
  resetQuiz();
  if (!window.api?.quiz?.generate) {
    state.message = 'Quiz non disponible (API quiz manquante).';
    return;
  }
  const payload = {
    mode: state.quizOptions.mode,
    difficulty: state.quizOptions.difficulty,
    totalQuestions: state.quizOptions.totalQuestions
  };
  const res = await window.api.quiz.generate(payload);
  state.questions = Array.isArray(res?.questions) ? res.questions : [];
  state.totalQuestions = res?.totalQuestions || state.questions.length;
  if (state.totalQuestions > 0) {
    nextQuestion();
  } else {
    state.message = 'Aucun pays disponible pour le quiz.';
  }
}

async function loadCountries() {
  if (!state.user) return;
  if (window.api?.countries?.list) {
    try {
      const res = await window.api.countries.list();
      const list = Array.isArray(res) ? res : res?.items;
      console.log('[renderer] countries loaded', Array.isArray(list) ? list.length : 0);
      if (Array.isArray(list) && list.length) {
        state.countries = list;
        return;
      }
      state.message = 'Aucun pays recu depuis Firestore.';
    } catch (err) {
      console.error('[renderer] countries load error', err);
      state.message = 'Impossible de charger les pays (verifie Firestore).';
    }
  }
  state.countries = [];
}

onMounted(() => {
  subscribeAuth((u) => {
    state.user = u;
    if (u?.uid) {
      console.log('[renderer] user connected', u.uid);
      state.screen = 'menu';
      loadCountries();
    } else {
      console.log('[renderer] user signed out');
      state.countries = [];
    }
  });
  Promise.all([
    loadInitialConfig(window.api?.config).then((cfg) => {
      state.loadedConfig = cfg;
      applyConfigToState(cfg, state, DIFFICULTY_RANGES);
    }),
    loadCountries()
  ]).finally(() => {
    loadScores();
  });
});

async function login() {
  try {
    console.log('[renderer] login click');
    const res = await loginFirebase();
    if (res?.uid) {
      state.user = res;
      state.screen = 'menu';
      loadCountries();
    } else {
      state.message = 'Connexion Google non aboutie.';
    }
  } catch (err) {
    console.error('[renderer] login error', err);
    state.message = 'Connexion Google impossible.';
  }
}

async function logout() {
  try {
    await logoutGoogle();
  } catch (err) {
    console.error('[renderer] logout error', err);
  } finally {
    state.user = null;
    state.message = 'Connecte-toi avec Google pour jouer.';
  }
}
</script>









