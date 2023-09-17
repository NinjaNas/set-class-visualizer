<script setup lang="ts">
import ZoomButton from './ZoomButton.vue'

defineProps<{
  zoomRef: number
}>()
</script>

<template>
  <div class="graph-container">
    <ZoomButton :zoomRef="zoomRef" @changeZoom="(d) => $emit('changeZoom', d)"></ZoomButton>
  </div>
</template>

<style>
.graph-container {
  position: absolute;
  padding: 10px;
}
</style>
