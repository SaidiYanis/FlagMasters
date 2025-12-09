const QUIZ_CONFIG = Object.freeze({
  baseTotalQuestions: 10,
  optionsPerQuestion: 4
});

const DIFFICULTY_RANGES = Object.freeze({
  easy: { min: 130, max: 200 }, // pays très connus
  normal: { min: 50, max: 175 },
  hard: { min: 0, max: 100 },   // pays moins connus
  mixed: { min: 0, max: 200 }   // ignore la difficulté
});

const { createApp } = Vue;

createApp({
  data() {
    return {
      countries: COUNTRIES,              // depuis countries.js
      selectedDifficulty: 'easy',        // easy | normal | hard | mixed
      gameMode: 'country-to-flag',       // 'country-to-flag' | 'flag-to-country'

      totalQuestions: QUIZ_CONFIG.baseTotalQuestions,
      questionPool: [],

      questionNumber: 0,  // 1..totalQuestions
      score: 0,
      currentCountry: null,
      options: [],
      answered: false,
      selectedCode: null,
      message: 'Choisis une réponse pour commencer.',
      flagLoadError: false,
      loadedConfig: null
    };
  },

  computed: {
    // Liste des pays selon la difficulté choisie (avec fallback)
    filteredCountries() {
      const level = DIFFICULTY_RANGES[this.selectedDifficulty];

      if (!level || this.selectedDifficulty === 'mixed') {
        return this.countries;
      }

      const list = this.countries.filter(
        c => c.difficulty >= level.min && c.difficulty <= level.max
      );

      // Si le filtrage est trop strict, on retombe sur tous les pays
      return list.length ? list : this.countries;
    },

    // Question affichée (sans tricher en donnant la réponse)
    questionText() {
      if (!this.currentCountry) return '';
      if (this.gameMode === 'country-to-flag') {
        return `Quel est le drapeau de ${this.currentCountry.name} ?`;
      }
      return `À quel pays appartient ce drapeau ?`;
    },

    // Drapeau principal (mode "Trouver le pays")
    flagUrl() {
      if (!this.currentCountry || this.flagLoadError) return '';
      return QuizService.flagUrlFor(this.currentCountry, 'main');
    },

    // Le quiz est-il terminé ?
    isFinished() {
      return this.questionNumber >= this.totalQuestions;
    }
  },

  methods: {
    // Génère une URL de drapeau via le service stateless
    flagUrlFor(country, kind = 'main') {
      return QuizService.flagUrlFor(country, kind);
    },

    // Reset de tout ce qui concerne une seule question
    resetQuestionState(message = '') {
      this.answered = false;
      this.selectedCode = null;
      this.flagLoadError = false;
      this.message = message;
    },

    // Génère la liste des options (1 bonne + mauvaises) sans doublon
    buildOptions(correct, pool) {
      return QuizService.buildOptions(correct, pool, QUIZ_CONFIG.optionsPerQuestion);
    },

    // Construit le pool de questions (sans répétition)
    buildQuestionPool() {
      const source = this.filteredCountries;
      const shuffled = QuizService.shuffle(source);

      this.totalQuestions = Math.min(
        QUIZ_CONFIG.baseTotalQuestions,
        shuffled.length
      );
      this.questionPool = shuffled.slice(0, this.totalQuestions);
    },

    resetQuiz() {
      // reset global (score + numéro de question)
      this.score = 0;
      this.questionNumber = 0;
      this.currentCountry = null;
      this.options = [];

      // reset de l’état d’une question (message commun via helper)
      this.resetQuestionState('Choisis une réponse pour commencer.');

      this.buildQuestionPool();

      if (this.totalQuestions > 0) {
        this.nextQuestion();
      } else {
        this.message = 'Aucun pays disponible pour le quiz.';
      }
    },

    nextQuestion() {
      if (this.isFinished) {
        this.message = `Quiz terminé ! Score final : ${this.score} / ${this.totalQuestions}`;
        return;
      }

      // Reset par question
      this.resetQuestionState('');

      // Index dans le pool (0-based)
      const index = this.questionNumber;
      const correct = this.questionPool[index];
      this.currentCountry = correct;

      // Options (bonne + mauvaises) construites via helper
      const pool = this.filteredCountries;
      this.options = this.buildOptions(correct, pool);

      this.questionNumber++;
    },

    handleAnswer(option) {
      if (this.answered || !this.currentCountry) return;

      this.answered = true;
      this.selectedCode = option.code;

      if (option.code === this.currentCountry.code) {
        this.score++;
        this.message = 'Bravo, bonne réponse ! ✅';
      } else {
        this.message = `Raté ❌ La bonne réponse était ${this.currentCountry.name}.`;
      }

      if (this.isFinished) {
        this.message += `  Quiz terminé ! Score final : ${this.score} / ${this.totalQuestions}`;
      }
    },

    buttonClass(option) {
      if (!this.answered) return '';

      if (option.code === this.currentCountry.code) {
        return 'correct';
      }
      if (option.code === this.selectedCode && option.code !== this.currentCountry.code) {
        return 'wrong';
      }
      return '';
    },

    onFlagError() {
      this.flagLoadError = true;
      this.message = `Impossible de charger le drapeau pour ${this.currentCountry?.name || 'ce pays'}.`;
    }
  },

  mounted() {
    // Exemple d'appel IPC via preload : charge une config si disponible
    if (window.api?.readConfig) {
      window.api.readConfig()
        .then(cfg => {
          this.loadedConfig = cfg;
          if (cfg?.totalQuestions) {
            this.totalQuestions = Math.max(1, Math.min(50, cfg.totalQuestions));
          }
          if (cfg?.difficulty && DIFFICULTY_RANGES[cfg.difficulty]) {
            this.selectedDifficulty = cfg.difficulty;
          }
        })
        .catch(() => {
          // silencieux : fallback sur config par défaut
        })
        .finally(() => this.resetQuiz());
    } else {
      this.resetQuiz();
    }
  }
}).mount('#app');
