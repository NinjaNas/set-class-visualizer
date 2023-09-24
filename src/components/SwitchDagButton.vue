<script setup lang="ts">
import { ref, watch } from 'vue'
const isCardinalDag = ref<boolean>(
  localStorage.getItem('dag') === 'cardinaldagprimeforte' ? true : false
)

const $emit = defineEmits(['useLocalOrFetchAndCreateDag'])

watch(isCardinalDag, () => {
  const display = isCardinalDag.value ? 'cardinaldagprimeforte' : 'strictdagprimeforte'
  $emit('useLocalOrFetchAndCreateDag', display)
  localStorage.setItem('dag', display)
})
</script>

<template>
  <div class="toggle-container">
    Strictly-Increasing Graph / Cardinality Growth Graph
    <label class="switch" for="switchDagButton">
      <input
        id="switchDagButton"
        type="checkbox"
        @click="isCardinalDag = !isCardinalDag"
        :checked="isCardinalDag"
      />
      <span class="slider"></span>
    </label>
  </div>
</template>

<style></style>
