<script setup lang="ts">
import TranspositionButton from './TranspositionButton.vue'
import ZoomButton from './ZoomButton.vue'

defineProps<{
  zoomRef: number
  transposition: number
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
