<script setup lang="ts">
import { ref, watch } from 'vue'
import { JZZ } from 'jzz'

const localMidiIn = localStorage.getItem('midiIn')
const midiIn = ref<string>(localMidiIn ? localMidiIn : '')
const midiInArr = ref<
  {
    id: string
    name: string
    engine: string
    manufacturer: string
    version: string
  }[]
>([])

JZZ()
  .refresh()
  .and(() => {
    midiInArr.value = JZZ().info().inputs
  })
  .or((err: any) => {
    console.error('Failed to initialize JZZ:', err)
  })
  .onChange(() => {
    setMidiIn()
  })

const setMidiIn = () => {
  midiInArr.value = JZZ().info().inputs

  if (midiIn.value === '' || !midiInArr.value.some((e) => e.name === midiIn.value)) {
    midiIn.value = JZZ().openMidiIn().name()
  }
}

const $emit = defineEmits(['changeMidiIn'])

watch(midiIn, () => {
  console.log(midiIn.value)
  $emit('changeMidiIn', midiIn.value)
  localStorage.setItem('midiIn', midiIn.value)
})

setMidiIn()
</script>

<template>
  <label for="midiInButton">Midi In:</label>
  <select id="midiInButton" name="midiInButton" v-model="midiIn">
    <option v-for="label in midiInArr" :key="label.id" :value="label.id">
      {{ label.id }}
    </option>
  </select>
</template>

<style></style>
