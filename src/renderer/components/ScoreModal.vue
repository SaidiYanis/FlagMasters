<template>
  <transition name="fade">
    <div v-if="visible" class="scores-modal">
      <div class="scores-card glass">
        <header class="scores-header">
          <div>
            <p class="eyebrow">Classement</p>
            <h2>Leaderboard</h2>
          </div>
          <button class="ghost-btn" type="button" @click="$emit('close')">
            Fermer
          </button>
        </header>

        <p v-if="scores.length === 0" class="no-scores">
          Aucun score enregistré.
        </p>

        <ul v-else class="score-list">
          <li
            v-for="(item, idx) in scores"
            :key="item.name"
            :class="['score-item', podiumClass(idx)]"
          >
            <span class="score-rank">
              {{ idx + 1 }}
            </span>

            <div class="score-info">
              <span class="score-name">
                {{ item.name }}
              </span>
              <span class="score-meta">
                ({{ item.totalCorrect }}/{{ item.totalQuestions }} questions)
              </span>
            </div>

            <span class="score-rate">
              {{ item.successRate }}%
            </span>
          </li>
        </ul>
      </div>
    </div>
  </transition>
</template>

<script setup>
const props = defineProps({
  visible: { type: Boolean, required: true },
  scores: { type: Array, required: true }
});
defineEmits(['close']);

function podiumClass(idx) {
  if (idx === 0) return 'gold';
  if (idx === 1) return 'silver';
  if (idx === 2) return 'bronze';
  return '';
}
</script>
