<script setup lang="ts">
import { ref, watch } from 'vue'
import { JZZ } from 'jzz'

const localMidiOut = localStorage.getItem('midiOut')
const midiOut = ref<string>(localMidiOut ? localMidiOut : '')
const midiOutArr = ref<
  {
    id: string
    name: string
    engine: string
    manufacturer: string
    version: string
  }[]
>([])

JZZ()
  .and(() => {
    midiOutArr.value = JZZ().info().outputs
  })
  .or((err: any) => {
    console.error('Failed to initialize JZZ:', err)
  })
  .onChange(() => {
    setMidiOut()
  })

const setMidiOut = () => {
  midiOutArr.value = JZZ().info().outputs

  if (midiOut.value === '' || !midiOutArr.value.some((e) => e.name === midiOut.value)) {
    midiOut.value = JZZ().openMidiOut().name()
  }
}

const $emit = defineEmits(['changeMidiOut'])

watch(midiOut, () => {
  $emit('changeMidiOut', midiOut.value)
  localStorage.setItem('midiOut', midiOut.value)
})

setMidiOut()
</script>

<template>
  <label for="midiOutButton">Midi Out:</label>
  <select id="midiIOutButton" name="midiOutButton" v-model="midiOut">
    <option v-for="label in midiOutArr" :key="label.id" :value="label.id">
      {{ label.id }}
    </option>
  </select>
</template>

<style></style>
