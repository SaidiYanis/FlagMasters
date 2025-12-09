<template>
  <div class="page">
    <div class="card">
      <div class="top-bar">
        <h1>Quiz des drapeaux</h1>
        <button v-if="screen === 'game'" class="ghost-btn" @click="backToMenu">Retour menu</button>
      </div>
      <div class="subtitle">Choisis le bon pays ou le bon drapeau selon le mode.</div>

      <!-- Menu principal -->
      <div v-if="screen === 'menu'" class="menu">
        <button class="primary-btn" @click="startGame">Jouer</button>
        <button class="ghost-btn" @click="showScores">Scores</button>
        <div class="controls column">
          <div class="control">
            <label for="mode-select">Mode :</label>
            <select id="mode-select" v-model="menuGameMode">
              <option value="country-to-flag">Trouver le drapeau</option>
              <option value="flag-to-country">Trouver le pays</option>
            </select>
          </div>
          <div class="control">
            <label for="difficulty-select">Difficulté :</label>
            <select id="difficulty-select" v-model="menuDifficulty">
              <option value="easy">Facile (pays très connus)</option>
              <option value="normal">Normal</option>
              <option value="hard">Difficile (pays moins connus)</option>
              <option value="mixed">Mixte</option>
            </select>
          </div>
          <div class="control">
            <label for="questions-select">Nombre de questions :</label>
            <select id="questions-select" v-model.number="menuQuestions">
              <option :value="5">5</option>
              <option :value="10">10</option>
              <option :value="15">15</option>
              <option :value="20">20</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Écran de jeu -->
      <div v-else>
        <div class="info-bar">
          <div>Question : {{ questionNumber }} / {{ totalQuestions }}</div>
          <div>Score : {{ score }}</div>
        </div>

        <div class="question-text" v-if="currentCountry">
          {{ questionText }}
        </div>

        <div class="flag-container" v-if="currentCountry && gameMode === 'flag-to-country'">
          <div class="flag-frame" :style="flagBgStyle">
            <img :src="flagUrl" alt="Drapeau à deviner" @error="onFlagError">
          </div>
        </div>

        <div class="answers" v-if="gameMode === 'flag-to-country'">
          <button
            v-for="opt in options"
            :key="opt.code"
            class="answer-btn"
            :class="buttonClass(opt)"
            :disabled="answered"
            @click="handleAnswer(opt)"
          >
            {{ opt.name }}
          </button>
        </div>

        <div class="answers" v-else>
          <button
            v-for="opt in options"
            :key="opt.code"
            class="answer-btn"
            :class="buttonClass(opt)"
            :disabled="answered"
            @click="handleAnswer(opt)"
          >
            <div class="flag-frame mini" :style="flagBgStyleFor(opt)">
              <img :src="flagUrlFor(opt, 'answer')" :alt="'Drapeau de ' + opt.name">
            </div>
          </button>
        </div>

        <div class="footer">
          <div class="message">{{ message }}</div>
          <button
            v-if="!isFinished"
            id="next-btn"
            :disabled="!answered"
            @click="handleNext"
          >
            Question suivante
          </button>
        </div>

        <div v-if="showNameForm" class="name-form">
          <div class="name-form-row">
            <label>Choisis ou saisis ton nom :</label>
            <select v-model="selectedPlayerName">
              <option v-for="p in players" :key="p" :value="p">{{ p }}</option>
              <option value="__new__">Nouveau nom...</option>
            </select>
            <input
              v-if="selectedPlayerName === '__new__'"
              v-model="customPlayerName"
              type="text"
              placeholder="Ton nom"
            >
            <button class="primary-btn" @click="saveAndReturnMenu">Enregistrer & retour menu</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="scoreModal" class="scores-modal">
      <div class="scores-card">
        <div class="scores-header">
          <h2>Scores</h2>
          <button class="ghost-btn" @click="scoreModal = false">Fermer</button>
        </div>
        <div v-if="sortedScores.length === 0" class="no-scores">Aucun score enregistré.</div>
        <ul v-else class="score-list">
          <li v-for="item in sortedScores" :key="item.name">
            <span class="score-name">{{ item.name }}</span>
            <span class="score-rate">{{ item.successRate }}%</span>
            <span class="score-meta">({{ item.totalCorrect }}/{{ item.totalQuestions }} questions)</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, toRefs } from 'vue';
import { COUNTRIES } from './countries';
import { QuizService } from './quizService';
import { loadInitialConfig, applyConfigToState } from './services/configService';

const QUIZ_CONFIG = Object.freeze({
  baseTotalQuestions: 10,
  optionsPerQuestion: 4
});

const DIFFICULTY_RANGES = Object.freeze({
  easy: { min: 130, max: 200 },
  normal: { min: 50, max: 175 },
  hard: { min: 0, max: 100 },
  mixed: { min: 0, max: 200 }
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
  countries: COUNTRIES,
  selectedDifficulty: 'easy',
  gameMode: 'country-to-flag',
  screen: 'menu', // 'menu' | 'game'
  menuGameMode: 'country-to-flag',
  menuDifficulty: 'easy',
  menuQuestions: QUIZ_CONFIG.baseTotalQuestions,
  totalQuestions: QUIZ_CONFIG.baseTotalQuestions,
  questionPool: [],
  questionNumber: 0,
  score: 0,
  currentCountry: null,
  options: [],
  answered: false,
  selectedCode: null,
  message: 'Choisis une réponse pour commencer.',
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
  selectedDifficulty,
  gameMode,
  totalQuestions,
  questionNumber,
  score,
  currentCountry,
  options,
  answered,
  message,
  screen,
  menuGameMode,
  menuDifficulty,
  menuQuestions,
  scoreModal,
  players,
  selectedPlayerName,
  customPlayerName,
  scores,
  showNameForm
} = toRefs(state);

const filteredCountries = computed(() => {
  const level = DIFFICULTY_RANGES[state.selectedDifficulty];
  if (!level || state.selectedDifficulty === 'mixed') return state.countries;

  const list = state.countries.filter(
    c => c.difficulty >= level.min && c.difficulty <= level.max
  );
  return list.length ? list : state.countries;
});

const questionText = computed(() => {
  if (!state.currentCountry) return '';
  if (state.gameMode === 'country-to-flag') {
    return `Quel est le drapeau de ${state.currentCountry.name} ?`;
  }
  return `À quel pays appartient ce drapeau ?`;
});

const flagUrl = computed(() => {
  if (!state.currentCountry || state.flagLoadError) return '';
  return QuizService.flagUrlFor(state.currentCountry, 'main');
});

const isFinished = computed(() => state.questionNumber >= state.totalQuestions);
const flagBgStyle = computed(() => flagBgStyleFor(state.currentCountry));
const sortedScores = computed(() => {
  const arr = scores.value || [];
  return [...arr].sort((a, b) => b.successRate - a.successRate || b.totalQuestions - a.totalQuestions);
});

function flagUrlFor(country, kind = 'main') {
  return QuizService.flagUrlFor(country, kind);
}

function flagBgStyleFor(country) {
  if (!country) return { '--flag-bg': FLAG_BG_DEFAULT };
  const col = FLAG_BG_MAP[country.code] || FLAG_BG_DEFAULT;
  return { '--flag-bg': col };
}

function resetQuestionState(message = '') {
  state.answered = false;
  state.selectedCode = null;
  state.flagLoadError = false;
  state.message = message;
}

function buildOptions(correct, pool) {
  return QuizService.buildOptions(correct, pool, QUIZ_CONFIG.optionsPerQuestion);
}

function buildQuestionPool() {
  const source = filteredCountries.value;
  const shuffled = QuizService.shuffle(source);
  state.totalQuestions = Math.min(state.totalQuestions, shuffled.length);
  state.questionPool = shuffled.slice(0, state.totalQuestions);
}

function resetQuiz() {
  state.score = 0;
  state.questionNumber = 0;
  state.currentCountry = null;
  state.options = [];
  resetQuestionState('Choisis une réponse pour commencer.');
  buildQuestionPool();

  if (state.totalQuestions > 0) {
    nextQuestion();
  } else {
    state.message = 'Aucun pays disponible pour le quiz.';
  }
}

function nextQuestion() {
  if (isFinished.value) {
    state.message = `Quiz terminé ! Score final : ${state.score} / ${state.totalQuestions}`;
    return;
  }

  resetQuestionState('');
  const index = state.questionNumber;
  const correct = state.questionPool[index];
  state.currentCountry = correct;
  state.options = buildOptions(correct, filteredCountries.value);
  state.questionNumber++;
}

function handleAnswer(option) {
  if (state.answered || !state.currentCountry) return;

  state.answered = true;
  state.selectedCode = option.code;

  if (option.code === state.currentCountry.code) {
    state.score++;
    state.message = 'Bravo, bonne réponse ! ✅';
  } else {
    state.message = `Raté ❌ La bonne réponse était ${state.currentCountry.name}.`;
  }

  if (isFinished.value) {
    state.message += `  Quiz terminé ! Score final : ${state.score} / ${state.totalQuestions}`;
    startNameCapture();
  }
}

function buttonClass(option) {
  if (!state.answered) return '';
  if (option.code === state.currentCountry?.code) return 'correct';
  if (option.code === state.selectedCode && option.code !== state.currentCountry?.code) return 'wrong';
  return '';
}

function onFlagError() {
  state.flagLoadError = true;
  state.message = `Impossible de charger le drapeau pour ${state.currentCountry?.name || 'ce pays'}.`;
}

function startGame() {
  state.selectedDifficulty = state.menuDifficulty;
  state.gameMode = state.menuGameMode;
  state.totalQuestions = state.menuQuestions;
  state.screen = 'game';
  resetQuiz();
}

function backToMenu() {
  state.screen = 'menu';
  state.questionPool = [];
  state.currentCountry = null;
  state.options = [];
  state.message = 'Choisis tes options puis lance la partie.';
  state.questionNumber = 0;
  state.score = 0;
  state.answered = false;
  state.showNameForm = false;
}

function handleNext() {
  nextQuestion();
}

function pickPlayerName() {
  const existing = players.value;
  state.selectedPlayerName = existing.length ? existing[0] : '__new__';
  state.customPlayerName = '';
  state.showNameForm = true;
}

function startNameCapture() {
  if (!players.value.length) {
    state.selectedPlayerName = '__new__';
  } else {
    state.selectedPlayerName = players.value[0];
  }
  state.customPlayerName = '';
  state.showNameForm = true;
}

async function saveAndReturnMenu() {
  const chosen = state.selectedPlayerName === '__new__'
    ? (state.customPlayerName || '').trim()
    : state.selectedPlayerName;
  const name = chosen || 'Anonyme';
  const payload = { name, correct: state.score, total: state.totalQuestions };
  if (window.api?.saveScore) {
    const res = await window.api.saveScore(payload);
    if (res?.successRate !== undefined) {
      state.message = `Moyenne de réussite pour ${name} : ${res.successRate}%`;
    }
    if (!players.value.includes(name)) {
      state.players.push(name);
    }
    loadScores(); // refresh list
  }
  state.showNameForm = false;
  backToMenu();
}

async function loadScores() {
  if (!window.api?.listScores) return;
  const list = await window.api.listScores();
  state.scores = Array.isArray(list) ? list : [];
  state.players = state.scores.map(s => s.name);
}

function showScores() {
  loadScores().finally(() => {
    state.scoreModal = true;
  });
}

onMounted(() => {
  loadInitialConfig(window.api).then(cfg => {
    state.loadedConfig = cfg;
    applyConfigToState(cfg, state, DIFFICULTY_RANGES);
  }).finally(() => {
    loadScores();
  });
});
</script>

<style scoped>
* { box-sizing: border-box; }
body, html, #app, .page {
  margin: 0;
  min-height: 100vh;
}
.page {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #020617;
  color: #e5e7eb;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
}
.card {
  background: #020617;
  border-radius: 16px;
  border: 1px solid #1f2937;
  box-shadow: 0 20px 40px rgba(0,0,0,0.6);
  padding: 24px 28px;
  width: 720px;
  max-width: 100%;
}
h1 {
  margin: 0;
  font-size: 26px;
}
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}
.subtitle {
  text-align: center;
  font-size: 13px;
  color: #9ca3af;
  margin: 8px 0 16px;
}
.menu {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.primary-btn {
  align-self: flex-start;
  padding: 10px 16px;
  border-radius: 10px;
  background: #2563eb;
  border: 1px solid #1d4ed8;
  color: white;
  font-size: 15px;
  cursor: pointer;
  transition: background 0.12s, transform 0.05s;
}
.primary-btn:hover {
  background: #1d4ed8;
  transform: translateY(-1px);
}
.ghost-btn {
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid #1f2937;
  background: #0b1120;
  color: #e5e7eb;
  cursor: pointer;
  transition: background 0.12s, transform 0.05s;
}
.ghost-btn:hover {
  background: #111827;
  transform: translateY(-1px);
}
.controls {
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: #9ca3af;
}
.controls.column {
  flex-direction: column;
}
.control {
  display: flex;
  align-items: center;
  gap: 8px;
}
.control select {
  background: #020617;
  color: #e5e7eb;
  border-radius: 999px;
  padding: 4px 10px;
  border: 1px solid #374151;
  font-size: 13px;
}
.info-bar {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #9ca3af;
  margin-bottom: 12px;
}
.question-text {
  margin-bottom: 10px;
  font-size: 16px;
}
.flag-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}
.flag-frame {
  position: relative;
  aspect-ratio: 4 / 3;
  border-radius: 12px;
  border: 1px solid #1f2937;
  background: radial-gradient(ellipse at center, #0b1120 0%, #020617 75%);
  overflow: hidden;
  padding: 10px;
  box-shadow: 0 10px 24px rgba(0,0,0,0.35);
}
.flag-frame::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--flag-bg, #0b1120);
  filter: blur(24px);
  opacity: 0.25;
  transform: scale(1.2);
}
.flag-frame img {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  z-index: 1;
  border-radius: 8px;
}
.flag-frame.mini {
  padding: 6px;
  border-radius: 10px;
}
.answers {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 12px;
}
.answer-btn {
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #1f2937;
  background: #020617;
  color: #e5e7eb;
  text-align: left;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.12s, transform 0.05s, border-color 0.12s;
}
.answer-btn:hover:enabled {
  background: #0b1120;
  transform: translateY(-1px);
  border-color: #374151;
}
.answer-btn:disabled {
  opacity: 0.8;
  cursor: default;
}
.answer-btn.correct {
  background: #065f46;
  border-color: #22c55e;
  color: #ecfdf5;
}
.answer-btn.wrong {
  background: #7f1d1d;
  border-color: #f97373;
  color: #fee2e2;
}
.answers img {
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: 8px;
  object-fit: contain;
  border: 1px solid #1f2937;
  background: #000;
}
.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
}
.message {
  font-size: 14px;
  min-height: 18px;
}
#next-btn {
  padding: 8px 16px;
  border-radius: 999px;
  border: none;
  font-size: 14px;
  background: #2563eb;
  color: white;
  cursor: pointer;
  transition: background 0.12s, transform 0.05s;
}
#next-btn:hover:enabled {
  background: #1d4ed8;
  transform: translateY(-1px);
}
#next-btn:disabled {
  opacity: 0.5;
  cursor: default;
}
.name-form {
  margin-top: 12px;
  padding: 12px;
  border: 1px solid #1f2937;
  border-radius: 12px;
  background: #0b1120;
}
.name-form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
.name-form select,
.name-form input {
  background: #020617;
  color: #e5e7eb;
  border-radius: 8px;
  padding: 6px 10px;
  border: 1px solid #374151;
  font-size: 13px;
}
.scores-modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}
.scores-card {
  background: #0b1120;
  border: 1px solid #1f2937;
  border-radius: 16px;
  padding: 16px;
  width: min(520px, 100%);
  box-shadow: 0 20px 40px rgba(0,0,0,0.6);
}
.scores-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.score-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.score-list li {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 8px;
  padding: 8px 10px;
  border: 1px solid #1f2937;
  border-radius: 10px;
  background: #0f172a;
}
.score-name { font-weight: 600; }
.score-rate { color: #22c55e; }
.score-meta { color: #9ca3af; font-size: 12px; }
.no-scores { color: #9ca3af; font-size: 14px; }
@media (max-width: 780px) {
  .card { width: 100%; }
  .controls { flex-direction: column; align-items: flex-start; }
  .info-bar { flex-direction: column; gap: 4px; }
}
</style>
