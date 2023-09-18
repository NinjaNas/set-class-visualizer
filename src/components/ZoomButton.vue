<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  zoomRef: number
}>()

const ZOOM_CONSTANT = 23

const $emit = defineEmits(['changeZoom', 'focusedOnText', 'blurredOnText'])

// gives the scale as a string percentage
const zoomScale = () => {
  return Math.round(props.zoomRef * 100).toString() + '%'
}

// format zoom into a number
const zoomFormat = () => {
  return parseInt(zoomText.value.replace(/\D/g, ''))
}

const zoomText = ref<string>(zoomScale())
const zoomInputRef = ref<null | HTMLInputElement>(null)

const handleFocus = () => {
  zoomText.value = zoomText.value.slice(0, -1)
  $emit('focusedOnText')
}

// add percent sign back if needed and run changeZoom
const handleBlur = () => {
  $emit('changeZoom', zoomFormat())
  $emit('blurredOnText')
  zoomText.value = props.zoomRef * 100 + '%'
}

// changeZoom upon enter and set zoomText
const handleEnter = () => {
  if (zoomInputRef.value) {
    zoomInputRef.value.blur() // calls handleBlur
  }
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
      class="graph-button graph-button-minus"
      @click="$emit('changeZoom', zoomFormat() - ZOOM_CONSTANT)"
    >
      -
    </button>
    <input
      id="zoomInput"
      ref="zoomInputRef"
      class="graph-button-input"
      type="text"
      v-model.trim="zoomText"
      @focus="handleFocus()"
      @blur="handleBlur()"
      v-on:keydown.enter="handleEnter()"
    />
    <button
      class="graph-button graph-button-plus"
      @click="$emit('changeZoom', zoomFormat() + ZOOM_CONSTANT)"
    >
      +
    </button>
  </label>
</template>

<style></style>
