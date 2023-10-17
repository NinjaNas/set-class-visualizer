<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  firstInteraction: boolean
}>()

const localSwitchMidi = localStorage.getItem('midiChannel')
const switchMidi = ref<string>(localSwitchMidi ? localSwitchMidi : '0')

const $emit = defineEmits(['changeMidiChannel'])

const handleSelectChange = (e: Event) => {
  const target = e.target as HTMLSelectElement
  target.blur()
}

watch([switchMidi, () => props.firstInteraction], () => {
  $emit('changeMidiChannel', switchMidi.value)
  localStorage.setItem('midiChannel', switchMidi.value)
})
</script>

<template>
  <label for="switchMidi">MIDI:</label>
  <select id="switchMidi" name="switchMidi" v-model="switchMidi" @change="handleSelectChange">
    <option value="0">General MIDI Sounds</option>
    <option value="9">General MIDI Percussion (B1-A5)</option>
  </select>
</template>

<style></style>
