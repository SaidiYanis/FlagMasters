<template>
  <header class="topbar">
    <div class="brand">
      <img class="logo" :src="logo" alt="Flag Masters logo" />
      <div class="titles">
        <span class="eyebrow">Flag Masters</span>
        <span class="headline">Championnats des drapeaux</span>
      </div>
    </div>

    <div class="top-actions">
      <button
        v-if="screen === 'game'"
        class="ghost-btn"
        type="button"
        @click="$emit('back')"
      >
        Retour menu
      </button>
      <button class="ghost-btn" type="button" @click="$emit('show-scores')">
        Leaderboard
      </button>
    </div>
  </header>
</template>

<script setup>
defineProps({
  logo: { type: String, required: true },
  screen: { type: String, required: true }
});
defineEmits(['back', 'show-scores']);
</script>
