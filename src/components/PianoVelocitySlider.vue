<script setup lang="ts">
import { ref, watch } from 'vue'

const localPianoVel = localStorage.getItem('pianoVelocity')
const pianoVel = ref<string>(localPianoVel ? localPianoVel : '60')

const $emit = defineEmits(['changePianoVel'])

watch(pianoVel, () => {
  $emit('changePianoVel', pianoVel.value)
  localStorage.setItem('pianoVelocity', pianoVel.value)
})
</script>

<template>
  <label for="pianoVel">Velocity:</label>
  <input type="range" min="0" max="127" v-model="pianoVel" class="slider" id="pianoVel" />
</template>

<style></style>
