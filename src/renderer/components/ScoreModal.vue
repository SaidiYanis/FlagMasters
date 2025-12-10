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
          Aucun score enregistre©.
        </p>

        <ul v-else class="score-list">
          <li
            v-for="(item, idx) in scores"
            :key="item.name"
            :class="['score-item', podiumClass(idx)]"
          >
            <div class="score-rank">{{ idx + 1 }}</div>
            <div class="score-info">
              <div class="score-user">
                <img v-if="item.photoURL" class="score-avatar" :src="item.photoURL" alt="avatar" />
                <div class="score-name">{{ item.displayName || item.name || 'Joueur' }}</div>
              </div>
            </div>
            <div class="score-rate">
              {{ item.successRate ?? item.totalCorrect ?? 0 }}%
            </div>
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

