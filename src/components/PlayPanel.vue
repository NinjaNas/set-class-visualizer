<script setup lang="ts">
import { JZZ } from 'jzz'
import { Tiny } from 'jzz-synth-tiny'
import { SMF } from 'jzz-midi-smf'
import { ref } from 'vue'
Tiny(JZZ)
SMF(JZZ)

const props = defineProps<{
  isPlaying: string
  isLooping: boolean
  isMidiLoaded: boolean
  position: number
  duration: number
}>()

const range = ref<number>(props.position)

const $emit = defineEmits([
  'changeIsPlaying',
  'changeIsPaused',
  'changeIsLooping',
  'jumpPosition',
  'changePositionText'
])

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
  <div id="play-panel" class="play-panel-container">
    <div>
      <button
        class="play-panel-button-disabled"
        :class="isMidiLoaded ? 'midi-loaded' : 'midi-not-loaded'"
        disabled
      ></button>
      <button
        class="play-panel-button"
        @click="playButtonHandler"
        :class="[
          isPlaying === 'true' || isPlaying === 'resume' ? 'pause' : 'play',
          isMidiLoaded ? '' : 'play-panel-button-disabled-color play-panel-button-disabled-cursor'
        ]"
        :disabled="!isMidiLoaded"
      ></button>
      <button
        class="stop play-panel-button"
        @click="!(isPlaying === 'false') ? $emit('changeIsPlaying', 'false') : null"
        :class="[
          isPlaying !== 'false'
            ? ''
            : 'play-panel-button-disabled-color play-panel-button-disabled-cursor',
          ,
          isMidiLoaded ? '' : 'play-panel-button-disabled-color play-panel-button-disabled-cursor'
        ]"
        :disabled="!isMidiLoaded || isPlaying === 'false'"
      ></button>
      <button
        class="loop play-panel-button"
        @click="$emit('changeIsLooping', !props.isLooping)"
        :class="[
          isLooping ? '' : 'play-panel-button-disabled-color',
          ,
          isMidiLoaded ? '' : 'play-panel-button-disabled-color play-panel-button-disabled-cursor'
        ]"
        :disabled="!isMidiLoaded"
      ></button>
    </div>
    <label for="duration" style="text-align: end"
      >{{
        Math.floor(position / 1000 / 60)
          .toString()
          .padStart(2, '0')
      }}:{{
        Math.floor((position / 1000) % 60)
          .toString()
          .padStart(2, '0')
      }}/{{
        Math.floor(duration / 1000 / 60)
          .toString()
          .padStart(2, '0')
      }}:{{
        Math.floor((duration / 1000) % 60)
          .toString()
          .padStart(2, '0')
      }}</label
    >
  </div>
  <input
    type="range"
    min="0"
    :max="duration"
    class="slider"
    :value="position"
    :v-model="range"
    @input="(e) => $emit('changePositionText', parseInt((e.target as HTMLInputElement).value))"
    @mouseup="(e) => $emit('jumpPosition', parseInt((e.target as HTMLInputElement).value))"
    id="duration"
  />
</template>

<style>
.midi-not-loaded::before {
  content: '🔴';
}

.midi-loaded::before {
  content: '🟢';
}

.play::before {
  content: '▶️';
}

.pause::before {
  content: '⏸️';
}

.stop::before {
  content: '⏹️';
}

.loop::before {
  content: '🔁';
}

.play-panel-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.play-panel-button {
  cursor: pointer;
  background-color: transparent;
  border: 1px solid var(--color-accent);
  padding: 0.2em;
}

.play-panel-button-disabled {
  background-color: transparent;
  border: 1px solid var(--color-accent);
  padding: 0.2em;
}

.play-panel-button-disabled-color {
  background-color: var(--color-hover) !important;
}

.play-panel-button-disabled-cursor {
  cursor: auto !important;
}
</style>
