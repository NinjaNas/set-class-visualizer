<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
const transpositionTextProgram = ref<boolean>(
  localStorage.getItem('transpositionTextProgram') === 'off' ? false : true
)

const $emit = defineEmits(['changeTranspositionTextProgram'])

watch(transpositionTextProgram, () => {
  const mode = transpositionTextProgram.value ? 'on' : 'off'
  $emit('changeTranspositionTextProgram', transpositionTextProgram.value)
  localStorage.setItem('transpositionTextProgram', mode)
})

onMounted(() => {
  const mode = transpositionTextProgram.value ? 'on' : 'off'
  $emit('changeTranspositionTextProgram', transpositionTextProgram.value)
  localStorage.setItem('transpositionTextProgram', mode)
})
</script>

<template>
  <label for="transpositionTextButton">Transposition Text Playback:</label>
  <label class="switch">
    <input
      id="transpositionTextButton"
      type="checkbox"
      @click="transpositionTextProgram = !transpositionTextProgram"
      :checked="transpositionTextProgram"
    />
    <span class="slider"></span>
  </label>
</template>

<style></style>
