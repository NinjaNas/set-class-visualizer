<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

const localPositionDebounce = localStorage.getItem('positionDebounce')
const positionDebounce = ref<string>(localPositionDebounce ? localPositionDebounce : '100')

const $emit = defineEmits(['changePositionDebounce'])

watch(positionDebounce, () => {
  $emit('changePositionDebounce', positionDebounce.value)
  localStorage.setItem('positionDebounce', positionDebounce.value)
})

onMounted(() => {
  $emit('changePositionDebounce', positionDebounce.value)
  localStorage.setItem('positionDebounce', positionDebounce.value)
})
</script>

<template>
  <label for="positionDebounce" style="grid-column: span 2"
    >Position Debounce: {{ positionDebounce }}ms</label
  >
  <label for="positionDebounce"> ⬆️ ms, ⬆️ perf, ⬇️ chord change acc</label>
  <input
    type="range"
    min="10"
    max="500"
    v-model="positionDebounce"
    class="slider"
    id="positionDebounce"
  />
</template>

<style></style>
