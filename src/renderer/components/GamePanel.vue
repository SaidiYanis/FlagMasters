<template>
  <section class="panel panel-game">
    <header class="panel-header compact">
      <div class="pill">
        {{ quizOptions.mode === 'flag-to-country' ? 'Mode : Trouver le pays' : 'Mode : Trouver le drapeau' }}
      </div>
      <div class="stats">
        <div class="stat">
          <span class="label">Question</span>
          <span class="value">
            {{ questionIndex }} / {{ totalQuestions }}
          </span>
        </div>
        <div class="stat">
          <span class="label">Score</span>
          <span class="value score">
            {{ score }}
          </span>
        </div>
      </div>
    </header>

    <transition name="fade">
      <div v-if="currentQuestion" key="question" class="question-block">
        <p class="question-text">
          {{ questionText }}
        </p>

        <!-- 1 drapeau -> trouver le pays -->
        <div v-if="quizOptions.mode === 'flag-to-country'" class="flag-container">
          <div class="flag-frame" :style="flagBgStyle">
            <img :src="flagUrl" alt="Drapeau à deviner" @error="$emit('flag-error')" />
          </div>
        </div>

        <!-- Réponses texte -->
        <div v-if="quizOptions.mode === 'flag-to-country'" class="answers">
          <button
            v-for="opt in currentQuestion?.options || []"
            :key="opt.code"
            class="answer-btn"
            :class="buttonClass(opt)"
            type="button"
            :disabled="answered"
            @click="$emit('answer', opt)"
          >
            {{ opt.name }}
          </button>
        </div>

        <!-- 1 pays -> trouver le drapeau -->
        <div v-else class="answers answers-flags">
          <button
            v-for="opt in currentQuestion?.options || []"
            :key="opt.code"
            class="answer-btn flag-option"
            :class="buttonClass(opt)"
            type="button"
            :disabled="answered"
            @click="$emit('answer', opt)"
          >
            <div class="flag-frame mini" :style="flagBgStyleFor(opt)">
              <img :src="opt.flag" :alt="'Drapeau de ' + opt.name" />
            </div>
          </button>
        </div>

        <footer class="footer">
          <p class="message">
            {{ message }}
          </p>
          <div class="footer-actions">
            <button v-if="!isFinished" id="next-btn" type="button" :disabled="!answered" @click="$emit('next')">
              Question suivante
            </button>
            <button v-else class="ghost-btn" type="button" @click="$emit('end')">
              Fin du quiz
            </button>
          </div>
        </footer>
      </div>
    </transition>
  </section>
</template>

<script setup>
defineProps({
  quizOptions: { type: Object, required: true },
  questionIndex: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  questionText: { type: String, required: true },
  currentQuestion: { type: Object, default: null },
  answered: { type: Boolean, required: true },
  isFinished: { type: Boolean, required: true },
  message: { type: String, default: '' },
  flagUrl: { type: String, default: '' },
  flagBgStyle: { type: Object, default: () => ({}) },
  flagBgStyleFor: { type: Function, required: true },
  buttonClass: { type: Function, required: true },
  score: { type: Number, required: true }
});

defineEmits(['answer', 'next', 'end', 'flag-error']);
</script>
