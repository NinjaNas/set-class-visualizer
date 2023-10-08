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

const parse = () => {}

const textAreaChangeHandler = (additionalLines = 0) => {
  if (!textAreaRef.value) return
  textAreaRef.value.style.height = '0px'
  textAreaRef.value.style.height = `${Math.max(
    textAreaRef.value.scrollHeight + 4 + additionalLines * 15,
    100
  )}px`
}
</script>

<template>
  <div class="program-container">
    <div class="piano-inner-grid-container program-panel">
      <h2 style="font-weight: bold; text-decoration: underline; padding: 0">Program Panel</h2>
      <div>
        <label for="load-midi">Load Midi:</label>
        <input
          id="load-midi"
          style="max-width: 230px"
          @change="loadMidi"
          type="file"
          accept=".mid"
        />
      </div>
      <label for="programInput">Program Input:</label>
      <div id="programInput" class="program-buttons">
        <button @click="addCurrentSelection" :disabled="!isMidiLoaded">Add Set @ Time</button>
        <button @click="parse" :disabled="!isMidiLoaded">Parse Program</button>
      </div>
    </div>
    <div class="import-program-panel">
      <h2 style="font-weight: bold; text-decoration: underline; padding: 0">Import Program</h2>
      <textarea
        ref="textAreaRef"
        class="piano-inner-grid-container input-text"
        type="text"
        v-model="textInput"
        @input="textAreaChangeHandler()"
      ></textarea>
    </div>
    <div v-if="activeTab === 'program'" class="piano-inner-grid-container audio-panel-program-tab">
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
.program-container {
  width: min-content;
  margin: 0 auto;
  display: grid;
  justify-content: center;
  align-items: start;
  grid-template-columns: 1fr;
  grid-template-areas:
    'c'
    'a'
    'b';
  padding: 2em;
  gap: 5px;
}

.input-text {
  min-height: 100px;
  width: 100%;
}

.program-buttons {
  display: grid;
  justify-content: center;
  align-items: start;
  grid-template-columns: 1fr 1fr;
}

.import-program-panel {
  margin: 0 min-content 0 min-content;
  padding: 1em;
  border-radius: 10px;
  border: 1px solid var(--color-accent);
  grid-column: span 2;
  grid-area: b;
  min-height: 171px;
}

.program-panel {
  grid-area: a;
  margin: 0 auto 0 auto;
  width: 250px;
  padding: 1em;
  border-radius: 10px;
  border: 1px solid var(--color-accent);
  min-height: 171px;
}

.audio-panel-program-tab {
  margin: 0 auto 0 auto;
  min-width: 250px;
  padding: 1em;
  border-radius: 10px;
  border: 1px solid var(--color-accent);
  grid-area: c;
  min-height: 171px;
}

@media only screen and (min-width: 720px) {
  .program-container {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    grid-template-areas:
      'a c'
      'b b';
  }
}

@media only screen and (min-width: 1440px) {
  .program-container {
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: 1fr;
    grid-template-areas: none;
    width: auto;
  }
  .program-panel {
    grid-area: auto;
  }
  .import-program-panel {
    grid-column: span 1;
    grid-area: auto;
  }
  .audio-panel-program-tab {
    grid-area: auto;
  }
}
</style>
