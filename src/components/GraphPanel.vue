<script setup lang="ts">
import GraphOctaveButton from './GraphOctaveButton.vue'
import TranspositionButton from './TranspositionButton.vue'
import ZoomButton from './ZoomButton.vue'

defineProps<{
  zoomRef: number
  transposition: number
  octave: number
}>()
</script>

<template>
  <div class="graph-container">
    <ZoomButton
      :zoomRef="zoomRef"
      @changeZoom="(d) => $emit('changeZoom', d)"
      @focusedOnText="$emit('focusedOnText')"
      @blurredOnText="$emit('blurredOnText')"
    ></ZoomButton>
    <TranspositionButton
      :transposition="transposition"
      @changeTransposition="(d) => $emit('changeTransposition', d)"
      @focusedOnText="$emit('focusedOnText')"
      @blurredOnText="$emit('blurredOnText')"
    ></TranspositionButton>
    <GraphOctaveButton
      :octave="octave"
      @changeOctave="(d) => $emit('changeOctave', d)"
      @focusedOnText="$emit('focusedOnText')"
      @blurredOnText="$emit('blurredOnText')"
    >
    </GraphOctaveButton>
  </div>
</template>

<style>
.graph-container {
  display: flex;
  position: absolute;
  padding: 10px;
  gap: 10px;
}
</style>
