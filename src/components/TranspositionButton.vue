<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  transposition: number
}>()

const $emit = defineEmits(['changeTransposition', 'focusedOnText', 'blurredOnText'])

const transpositionText = ref<string>('T0')
const transpositionInputRef = ref<null | HTMLInputElement>(null)

const handleFocus = () => {
  transpositionText.value = transpositionText.value.slice(1)
  $emit('focusedOnText')
}

const handleBlur = () => {
  $emit('changeTransposition', parseInt(transpositionText.value.replace(/\D/g, '')))
  $emit('blurredOnText')
  transpositionText.value = 'T' + props.transposition
}

const handleEnter = () => {
  if (transpositionInputRef.value) {
    transpositionInputRef.value.blur() // calls handleBlur
  }
}

watch(
  () => props.transposition,
  () => {
    transpositionText.value = 'T' + props.transposition.toString()
  }
)
</script>

<template>
  <label for="transpositionInput">
    <button
      class="graph-button graph-button-minus"
      @click="$emit('changeTransposition', parseInt(transpositionText.slice(1)) - 1)"
    >
      -
    </button>
    <input
      id="transpositionInput"
      ref="transpositionInputRef"
      class="graph-button-input"
      type="text"
      v-model.trim="transpositionText"
      @focus="handleFocus()"
      @blur="handleBlur()"
      v-on:keydown.enter="handleEnter()"
    />
    <button
      class="graph-button graph-button-plus"
      @click="$emit('changeTransposition', parseInt(transpositionText.slice(1)) + 1)"
    >
      +
    </button>
  </label>
</template>

<style></style>
