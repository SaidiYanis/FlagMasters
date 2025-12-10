<template>
  <transition name="fade-slide">
    <div v-if="visible" class="name-form">
      <div class="name-form-row">
        <label>Choisis ou saisis ton nom :</label>

        <div class="field compact">
          <select :value="selectedName" @change="$emit('update:selected-name', $event.target.value)">
            <option v-for="p in players" :key="p" :value="p">
              {{ p }}
            </option>
            <option value="__new__">Nouveau nom...</option>
          </select>
          <span class="field-chevron">⌄</span>
        </div>

        <input
          v-if="selectedName === '__new__'"
          :value="customName"
          type="text"
          placeholder="Ton nom"
          @input="$emit('update:custom-name', $event.target.value)"
        />

        <button class="primary-btn small" type="button" @click="$emit('save')">
          Enregistrer & retour menu
        </button>
      </div>
    </div>
  </transition>
</template>

<script setup>
defineProps({
  visible: { type: Boolean, required: true },
  players: { type: Array, required: true },
  selectedName: { type: String, default: null },
  customName: { type: String, default: '' }
});
defineEmits(['update:selected-name', 'update:custom-name', 'save']);
</script>
