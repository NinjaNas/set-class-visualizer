<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  octave: number
}>()

const $emit = defineEmits(['changeOctave', 'focusedOnText', 'blurredOnText'])

const octaveText = ref<string>('O4')
const octaveInputRef = ref<null | HTMLInputElement>(null)

const handleFocus = () => {
  octaveText.value = octaveText.value.slice(1)
  $emit('focusedOnText')
}

const handleBlur = () => {
  $emit('changeOctave', parseInt(octaveText.value.replace(/[^0-9-]/g, '')))
  $emit('blurredOnText')
  octaveText.value = 'O' + props.octave
}

const handleEnter = () => {
  if (octaveInputRef.value) {
    octaveInputRef.value.blur() // calls handleBlur
  }
}

watch(
  () => props.octave,
  () => {
    octaveText.value = 'O' + props.octave.toString()
  }
)
</script>

<template>
  <label for="octaveInput">
    <button
      class="graph-button graph-button-minus"
      @click="$emit('changeOctave', parseInt(octaveText.slice(1)) - 1)"
    >
      -
    </button>
    <input
      id="octaveInput"
      ref="octaveInputRef"
      class="graph-button-input"
      type="text"
      v-model.trim="octaveText"
      @focus="handleFocus()"
      @blur="handleBlur()"
      v-on:keydown.enter="handleEnter()"
    />
    <button
      class="graph-button graph-button-plus"
      @click="$emit('changeOctave', parseInt(octaveText.slice(1)) + 1)"
    >
      +
    </button>
  </label>
</template>

<style></style>
