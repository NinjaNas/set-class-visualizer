<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  zoomRef: number
}>()

const ZOOM_CONSTANT = 23

const $emit = defineEmits(['changeZoom'])

// gives the scale as a string percentage
const zoomScale = () => {
  return Math.round(props.zoomRef * 100).toString() + '%'
}

// format zoom into a number
const zoomFormat = () => {
  return parseInt(zoomText.value.replace(/\D/g, ''))
}

const zoomText = ref<string>(zoomScale())

// add percent sign back if needed and run changeZoom
const handleBlur = () => {
  console.log(zoomText.value)
  if (zoomText.value.charAt(zoomText.value.length - 1) !== '%') {
    zoomText.value = zoomText.value + '%'
  }
  $emit('changeZoom', zoomFormat())
}

// changeZoom upon enter and set zoomText
const handleEnter = () => {
  $emit('changeZoom', zoomFormat())
  zoomText.value = zoomScale()
}

// watch zoomRef to change zoomText
watch(
  () => props.zoomRef,
  () => {
    zoomText.value = zoomScale()
  }
)
</script>

<template>
  <label for="zoomInput">
    <button
      class="zoom-button zoom-minus"
      @click="$emit('changeZoom', zoomFormat() - ZOOM_CONSTANT)"
    >
      -
    </button>
    <input
      id="zoomInput"
      class="zoom-input"
      type="text"
      v-model.trim="zoomText"
      @focus="zoomText = zoomText.slice(0, -1)"
      @blur="handleBlur()"
      v-on:keydown.enter="handleEnter()"
    />
    <button
      class="zoom-button zoom-plus"
      @click="$emit('changeZoom', zoomFormat() + ZOOM_CONSTANT)"
    >
      +
    </button>
  </label>
</template>

<style>
.zoom-input {
  text-align: center;
  width: 4em;
  height: 2.5em;
  background-color: transparent;
  border: 1px solid var(--color-accent);
  color: var(--color-text);
}

.zoom-button {
  background-color: transparent;
  border: 1px solid var(--color-accent);
  color: var(--color-text);
  cursor: pointer;
  width: 2em;
  height: 2.5em;
}

.zoom-button:hover {
  background-color: var(--color-hover);
}

.zoom-minus {
  border-radius: 25% 0 0 25%;
}

.zoom-plus {
  border-radius: 0 25% 25% 0;
}
</style>
