<script setup lang="ts">
import { JZZ } from 'jzz'
import { Tiny } from 'jzz-synth-tiny'
import { SMF } from 'jzz-midi-smf'
Tiny(JZZ)
SMF(JZZ)

const props = defineProps<{
  isPlaying: string
  isLooping: boolean
}>()

const $emit = defineEmits(['changeIsPlaying', 'changeIsPaused', 'changeIsLooping'])

const playButtonHandler = () => {
  switch (props.isPlaying) {
    case 'false':
      $emit('changeIsPlaying', 'true')
      break
    case 'pause':
      $emit('changeIsPlaying', 'resume')
      break
    case 'resume':
      $emit('changeIsPlaying', 'pause')
      break
    case 'true':
      $emit('changeIsPlaying', 'pause')
      break
  }
}
</script>

<template>
  <label for="play-panel">Play MIDI File:</label>
  <div id="play-panel" class="">
    <button class="play play-panel-button" @click="playButtonHandler"></button>
    <button
      class="stop play-panel-button"
      @click="!(isPlaying === 'false') ? $emit('changeIsPlaying', 'false') : null"
    ></button>
    <button
      class="loop play-panel-button"
      @click="$emit('changeIsLooping', !props.isLooping)"
    ></button>
  </div>
</template>

<style>
.play::before {
  content: '▶️';
}

.stop::before {
  content: '⏹️';
}

.loop::before {
  content: '🔁';
}

.play-panel-button {
  cursor: pointer;
  background-color: transparent;
  border: 1px solid var(--color-accent);
  padding: 0.2em;
}

.play-panel-button:hover {
  background-color: var(--color-hover);
}
</style>
