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

const setMidiIn = () => {
  JZZ()
    .and(() => {
      midiInArr.value = JZZ().info().inputs
    })
    .or((err: any) => {
      console.error('Failed to initialize JZZ:', err)
    })
}

setMidiIn()

if (midiIn.value === '' || !midiInArr.value.some((e) => e.name === midiIn.value)) {
  JZZ()
    .openMidiIn()
    .and(function (this: any) {
      midiIn.value = this.name()
    })
}

const $emit = defineEmits(['changeMidiIn'])

watch(midiIn, () => {
  $emit('changeMidiIn', midiIn.value)
  localStorage.setItem('midiIn', midiIn.value)
})
</script>

<template>
  <label for="midiInButton">Midi In:</label>
  <select id="midiInButton" name="midiInButton" v-model="midiIn" @click="setMidiIn">
    <option v-for="label in midiInArr" :key="label.id" :value="label.id">
      {{ label.id }}
    </option>
  </select>
</template>

<style></style>
