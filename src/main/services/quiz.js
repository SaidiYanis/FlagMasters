import { listCountries } from './firebaseCountries.js';

const FLAG_CDN_BASE = 'https://flagcdn.com';

const DIFFICULTY_RANGES = Object.freeze({
  easy: { min: 130, max: 200 },
  normal: { min: 50, max: 175 },
  hard: { min: 0, max: 100 },
  mixed: { min: 0, max: 200 }
});

const QUIZ_CONFIG = Object.freeze({
  baseTotalQuestions: 10,
  optionsPerQuestion: 4
});

function shuffle(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function flagUrlFor(country, kind = 'main') {
  if (!country) return '';
  const lowerCode = country.code.toLowerCase();
  const size = kind === 'answer' ? 'w160' : 'w320';
  return `${FLAG_CDN_BASE}/${size}/${lowerCode}.png`;
}

function filteredCountries(list, difficulty) {
  const enabledOnly = (list || []).filter((c) => c.enabled !== false);
  const level = DIFFICULTY_RANGES[difficulty];
  if (!level || difficulty === 'mixed') return enabledOnly;
  const filtered = enabledOnly.filter(
    (c) => c.difficulty >= level.min && c.difficulty <= level.max
  );
  return filtered.length ? filtered : enabledOnly;
}

function buildOptions(correct, pool) {
  const wrongs = [];
  const maxWrong = Math.min(QUIZ_CONFIG.optionsPerQuestion - 1, pool.length - 1);
  while (wrongs.length < maxWrong) {
    const candidate = pool[Math.floor(Math.random() * pool.length)];
    if (!wrongs.find((w) => w.code === candidate.code) && candidate.code !== correct.code) {
      wrongs.push(candidate);
    }
  }
  return shuffle([correct, ...wrongs]);
}

function buildQuestionPool(list, total) {
  const shuffled = shuffle(list);
  const count = Math.min(total || QUIZ_CONFIG.baseTotalQuestions, shuffled.length);
  return shuffled.slice(0, count);
}

function formatQuestion(country, gameMode) {
  const text =
    gameMode === 'country-to-flag'
      ? `Quel est le drapeau de ${country.name} ?`
      : `A quel pays appartient ce drapeau ?`;
  return {
    code: country.code,
    name: country.name,
    questionText: text,
    flagUrl: country.flagUrl || flagUrlFor(country, 'main')
  };
}

export function createQuizService() {
  async function generate({
    mode = 'country-to-flag',
    difficulty = 'easy',
    totalQuestions = QUIZ_CONFIG.baseTotalQuestions
  }) {
    const all = await listCountries();
    const normalized = (all || []).map((c) => ({
      ...c,
      flagUrl: c.flagUrl || flagUrlFor(c, 'main'),
      flagThumbUrl: c.flagThumbUrl || flagUrlFor(c, 'answer')
    }));
    const pool = filteredCountries(normalized, difficulty);
    if (!pool.length) {
      return { mode, difficulty, totalQuestions: 0, questions: [] };
    }
    const questionsPool = buildQuestionPool(pool, totalQuestions);
    const questions = questionsPool.map((country) => {
      const options = buildOptions(country, pool).map((opt) => ({
        code: opt.code,
        name: opt.name,
        flag: opt.flagThumbUrl || flagUrlFor(opt, 'answer')
      }));
      return {
        ...formatQuestion(country, mode),
        options
      };
    });
    return {
      mode,
      difficulty,
      totalQuestions: questions.length,
      questions
    };
  }

  return { generate, flagUrlFor, filteredCountries, buildOptions, buildQuestionPool };
}
