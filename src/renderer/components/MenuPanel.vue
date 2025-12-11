<template>
  <section class="panel panel-menu">
    <header class="panel-header">
      <h1>Prépare ton match</h1>
      <p>Choisis tes paramètres et lance le défi.</p>
    </header>

    <div class="controls column">
      <div class="control">
        <label for="mode-select">Mode</label>
        <div class="field">
          <select
            id="mode-select"
            :value="gameMode"
            @change="$emit('update:gameMode', $event.target.value)"
          >
            <option value="country-to-flag">Trouver le drapeau</option>
            <option value="flag-to-country">Trouver le pays</option>
          </select>
          <span class="field-chevron">⌄</span>
        </div>
      </div>

      <div class="control">
        <label for="difficulty-select">Difficulté</label>
        <div class="field">
          <select
            id="difficulty-select"
            :value="difficulty"
            @change="$emit('update:difficulty', $event.target.value)"
          >
            <option value="easy">Facile</option>
            <option value="normal">Normal</option>
            <option value="hard">Difficile</option>
            <option value="mixed">Mixte</option>
          </select>
          <span class="field-chevron">⌄</span>
        </div>
      </div>

      <div class="control">
        <label for="questions-select">Nombre de questions</label>
        <div class="field">
          <select
            id="questions-select"
            :value="questions"
            @change="$emit('update:questions', Number($event.target.value))"
          >
            <option :value="5">5</option>
            <option :value="10">10</option>
            <option :value="15">15</option>
            <option :value="20">20</option>
          </select>
          <span class="field-chevron">⌄</span>
        </div>
      </div>
    </div>

    <div class="actions">
      <button class="primary-btn cta" type="button" @click="$emit('start')">
        Lancer le quiz
      </button>
    </div>
  </section>
</template>

<script setup>
defineProps({
  gameMode: { type: String, required: true },
  difficulty: { type: String, required: true },
  questions: { type: Number, required: true }
});
defineEmits(['update:gameMode', 'update:difficulty', 'update:questions', 'start']);
</script>
