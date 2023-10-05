<script setup lang="ts">
import { watch } from 'vue'

import { JZZ } from 'jzz'
import { Tiny } from 'jzz-synth-tiny'
import { SMF } from 'jzz-midi-smf'
Tiny(JZZ)
SMF(JZZ)

const props = defineProps<{
  isPlaying: string
  isLooping: boolean
}>()

const $emit = defineEmits(['changeIsPlaying'])

let synth = JZZ.synth.Tiny()
let player: any

const loadPlayer = (data: string) => {
  player = JZZ.MIDI.SMF(data).player()
  player.connect(synth)
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
        player.stop()
        break
      case 'pause':
        player.pause()
        break
      case 'resume':
        player.resume()
        break
      case 'true':
        player.play()
        player.onEnd = function () {
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
    player.loop(props.isLooping)
  }
)
</script>

<template>
  <input @change="loadMidi" type="file" accept=".mid" />
</template>

<style></style>
