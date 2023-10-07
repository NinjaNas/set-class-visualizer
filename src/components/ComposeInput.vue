<script setup lang="ts">
import { ref } from 'vue'
import { JZZ } from 'jzz'
import { SMF } from 'jzz-midi-smf'
import PlayPanel from './PlayPanel.vue'
import { formatSetToString } from '@/functions/helpers'
SMF(JZZ)

const props = defineProps<{
  player: null | any
  isPlaying: string
  isLooping: boolean
  isMidiLoaded: boolean
  position: number
  duration: number
  selectedSets: string[]
  transposition: number
  activeTab: string
}>()

const $emit = defineEmits([
  'changeIsPlaying',
  'changeMidiLoaded',
  'changePosition',
  'changeStopPosition',
  'changePlayer',
  'changeIsLooping',
  'jumpPosition',
  'changePositionText'
])

const textInput = ref<string>('')
const textAreaRef = ref<null | HTMLTextAreaElement>(null)

const loadPlayer = (data: string) => {
  const playerInit = JZZ.MIDI.SMF(data).player()
  $emit('changeMidiLoaded', true)
  $emit('changePlayer', playerInit)
}

const loadMidi = (input: Event) => {
  const target = input.target as HTMLInputElement
  if (target.files) {
    const file = target.files[0]
    const reader = new FileReader()
    // runs after file is read
    reader.onload = (e) => {
      let data = ''
      const target = e.target
      if (target && target.result instanceof ArrayBuffer) {
        const bytes = new Uint8Array(target.result)
        for (let i = 0; i < bytes.length; i++) {
          data += String.fromCharCode(bytes[i])
        }
        loadPlayer(data)
      }
    }
    reader.readAsArrayBuffer(file) // read file
  }
}

const addCurrentSelection = () => {
  textInput.value +=
    'F' +
    formatSetToString(props.selectedSets[0], true) +
    'T' +
    props.transposition.toString() +
    '@' +
    props.player.positionMS().toFixed() +
    '\t'
  textAreaChangeHandler(1)
}

const textAreaChangeHandler = (additionalLines = 0) => {
  if (!textAreaRef.value) return
  textAreaRef.value.style.height = '0px'
  textAreaRef.value.style.height = `${Math.max(
    textAreaRef.value.scrollHeight + 4 + additionalLines * 15,
    55
  )}px`
}
</script>

<template>
  <div class="compose-container">
    <div class="piano-inner-grid-container midi-container">
      <input style="max-width: 230px" @change="loadMidi" type="file" accept=".mid" />
      <button style="max-width: 230px" @click="addCurrentSelection" :disabled="!isMidiLoaded">
        Current Selection
      </button>
    </div>
    <textarea
      ref="textAreaRef"
      class="piano-inner-grid-container input-text"
      type="text"
      v-model="textInput"
      style="width: 680px"
      @input="textAreaChangeHandler()"
    ></textarea>
    <div v-if="activeTab === 'compose'" class="piano-inner-grid-container audio-panel">
      <h2 style="font-weight: bold; text-decoration: underline; padding: 0">Audio Panel</h2>
      <PlayPanel
        :isPlaying="isPlaying"
        :isLooping="isLooping"
        :isMidiLoaded="isMidiLoaded"
        :position="position"
        :duration="duration"
        @changeIsPlaying="(s: string) => $emit('changeIsPlaying', s)"
        @changeIsLooping="(d: boolean) => $emit('changeIsLooping', d)"
        @jumpPosition="(n: number) => $emit('jumpPosition', n)"
        @changePositionText="(n: number) => $emit('changePositionText', n)"
      ></PlayPanel>
    </div>
  </div>
</template>

<style>
.compose-container {
  display: grid;
  justify-content: center;
  align-items: start;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr;
  padding: 2em;
}

.input-text {
  height: auto;
}
</style>
