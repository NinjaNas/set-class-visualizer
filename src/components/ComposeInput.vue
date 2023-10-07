<script setup lang="ts">
import { ref, watch } from 'vue'
import { JZZ } from 'jzz'
import { Tiny } from 'jzz-synth-tiny'
import { SMF } from 'jzz-midi-smf'
import PlayPanel from './PlayPanel.vue'
import { formatSetToString } from '@/functions/helpers'
Tiny(JZZ)
SMF(JZZ)

const props = defineProps<{
  isPlaying: string
  isLooping: boolean
  isMidiLoaded: boolean
  position: number
  duration: number
  selectedSets: string[]
  transposition: number
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

let synth = JZZ.synth.Tiny()
const player = ref<null | any>(null)
const textInput = ref<string>('')

const loadPlayer = (data: string) => {
  player.value = JZZ.MIDI.SMF(data).player()
  player.value.connect(synth)
  $emit('changeMidiLoaded', true)
  $emit('changePlayer', player.value)
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
    player.value.positionMS().toString()
}

watch(
  () => props.isPlaying,
  () => {
    switch (props.isPlaying) {
      case 'false':
        player.value.stop()
        $emit('changeStopPosition')
        break
      case 'pause':
        player.value.pause()
        $emit('changeStopPosition')
        break
      case 'resume':
        player.value.resume()
        $emit('changePosition')
        break
      case 'true':
        player.value.resume()
        $emit('changePosition')
        player.value.onEnd = function () {
          if (!props.isLooping) {
            $emit('changeIsPlaying', 'false')
          }
        }
        break
    }
  }
)

watch(
  () => props.isLooping,
  () => {
    player.value.loop(props.isLooping)
  }
)
</script>

<template>
  <div class="compose-container">
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
    <button @click="addCurrentSelection" :disabled="!isMidiLoaded">Current Selection</button>
    <input type="text" v-model="textInput" />
    <input @change="loadMidi" type="file" accept=".mid" />
  </div>
</template>

<style>
.compose-container {
  display: grid;
  justify-content: center;
  align-items: start;
  grid-template-columns: 20em;
  grid-template-rows: 1fr;
}
</style>
