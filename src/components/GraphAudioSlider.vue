<script setup lang="ts">
import { ref, watch } from 'vue'

const localGraphVel = localStorage.getItem('graphVelocity')
const graphVel = ref<string>(localGraphVel ? localGraphVel : '127')

const $emit = defineEmits(['changeGraphVel'])

watch(graphVel, () => {
  $emit('changeGraphVel', graphVel.value)
  localStorage.setItem('graphVelocity', graphVel.value)
})
</script>

<template>
  <label for="pianoVel">Graph Audio Velocity:</label>
  <input type="range" min="0" max="127" v-model="graphVel" class="slider" id="pianoVel" />
</template>

<style></style>
