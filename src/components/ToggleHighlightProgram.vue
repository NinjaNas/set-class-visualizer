<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
const highlightProgram = ref<boolean>(
  localStorage.getItem('highlightProgram') === 'off' ? false : true
)

const $emit = defineEmits(['changeHighlightProgram'])

watch(highlightProgram, () => {
  const mode = highlightProgram.value ? 'on' : 'off'
  $emit('changeHighlightProgram', highlightProgram.value)
  localStorage.setItem('highlightProgram', mode)
})

onMounted(() => {
  const mode = highlightProgram.value ? 'on' : 'off'
  $emit('changeHighlightProgram', highlightProgram.value)
  localStorage.setItem('highlightProgram', mode)
})
</script>

<template>
  <label for="highlightProgramButton">Graph Highlight Playback:</label>
  <label class="switch">
    <input
      id="highlightProgramButton"
      type="checkbox"
      @click="highlightProgram = !highlightProgram"
      :checked="highlightProgram"
    />
    <span class="slider"></span>
  </label>
</template>

<style></style>
