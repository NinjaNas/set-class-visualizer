<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

const localTempo = localStorage.getItem('tempo')
const tempo = ref<string>(localTempo ? localTempo : '1.0')

const $emit = defineEmits(['changeTempo'])

watch(tempo, () => {
  $emit('changeTempo', tempo.value)
  localStorage.setItem('tempo', tempo.value)
})

onMounted(() => {
  // $emit('changeTempo', tempo.value) done in loadPlayer() func call to prevent null error
  localStorage.setItem('tempo', tempo.value)
})
</script>

<template>
  <div class="tempo-label-container">
    <label for="tempo">Tempo:</label>
    <label for="tempo">{{ Math.floor(parseFloat(tempo) * 100) + '%' }}</label>
  </div>
  <input type="range" step="0.01" min="0.1" max="2.0" v-model="tempo" class="slider" id="tempo" />
</template>

<style>
.tempo-label-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
