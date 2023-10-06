<script setup lang="ts">
import { ref, watch } from 'vue'
import { JZZ } from 'jzz'
import { Tiny } from 'jzz-synth-tiny'
import { SMF } from 'jzz-midi-smf'
Tiny(JZZ)
SMF(JZZ)

const props = defineProps<{
  isPlaying: string
  isLooping: boolean
}>()

const $emit = defineEmits([
  'changeIsPlaying',
  'changeMidiLoaded',
  'changePosition',
  'changeStopPosition',
  'changePlayer'
])

let synth = JZZ.synth.Tiny()
const player = ref<null | any>(null)

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
  <input class="compose-container" @change="loadMidi" type="file" accept=".mid" />
</template>

<style>
.compose-container {
  display: grid;
  padding: 1% 0 0 1%;
}
</style>
