<template>
  <header class="topbar" :class="{ 'is-game': screen === 'game' }">
    <div class="brand">
      <img class="logo" :src="logo" alt="Flag Masters logo" />
    </div>

    <div class="top-actions">
      <button v-if="screen === 'game'" class="ghost-btn" type="button" @click="$emit('back')">
        Retour
      </button>
      <button v-if="user" class="ghost-btn" type="button" @click="$emit('show-scores')">
        Leaderboard
      </button>
      <div v-if="user" class="user-chip">
        <img v-if="user.photoURL" :src="user.photoURL" alt="avatar" />
        <span class="user-name">{{ user.displayName || 'Joueur' }}</span>
        <button class="ghost-btn small" type="button" @click="$emit('logout')">Déconnexion</button>
      </div>
    </div>
  </header>
</template>

<script setup>
defineProps({
  logo: { type: String, required: true },
  screen: { type: String, required: true },
  user: { type: Object, default: null }
})
defineEmits(['back', 'show-scores', 'logout'])
</script>
