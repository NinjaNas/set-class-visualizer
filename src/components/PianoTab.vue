<script setup lang="ts">
import { onMounted, watch, ref, onUnmounted } from 'vue'
import { JZZ } from 'jzz'
import { Tiny } from 'jzz-synth-tiny'
import { Kbd } from 'jzz-input-kbd'
import { isBlackKey, toFormattedPrimeFormArray, toMidiNote, transpose } from '@/functions/helpers'
import PianoProgramButton from './PianoProgramButton.vue'
import SwitchMidiButton from './SwitchMidiButton.vue'
import PianoVelocitySlider from './PianoVelocitySlider.vue'
Tiny(JZZ)
Kbd(JZZ)

const props = defineProps<{
  selectedSets: string[]
  textFieldFocused: boolean
  transposition: number
  selectedMidiIn: string
  selectedMidiOut: string
}>()

const synth = JZZ.synth.Tiny()

const piano = ref<null | any>(null)
const ascii = ref<null | any>(null)
const portIn = ref<null | any>(null)
const portOut = ref<null | any>(null)
const localProgram = localStorage.getItem('pianoAudioProgram')
const localProgramNum = localProgram ? parseInt(localProgram) : 0 // even if localProgram == 0 returns false, it will still return 0
const program = ref<number>(localProgramNum)
const localVel = localStorage.getItem('pianoVelocity')
const localVelNum = localVel ? parseInt(localVel) : localVel === '0' ? 0 : 60
const vel = ref<number>(localVelNum)
const notes = ref<null | string[]>(null)
const complement = ref<null | string[]>(null)
const filter = ref<any>(
  JZZ.Widget({
    _receive: function (msg: any) {
      msg[2] = vel.value
      this._emit(msg)
    }
  })
)
const pianoRef = ref<null | HTMLDivElement>(null)
const currOctave = ref<number>(5)
const localMidiChannel = localStorage.getItem('midiChannel')
const localMidiChannelNum = localMidiChannel ? parseInt(localMidiChannel) : 0 // even if localMidiChannel == 0 returns false, it will still return 0
const midiChannel = ref<number>(localMidiChannelNum)

const octaveSwitchLabels = [
  '-1 (1)',
  '0 (2)',
  '1 (3)',
  '2 (4)',
  '3 (5)',
  '4 (6)',
  '5 (7)',
  '6 (8)',
  '7 (9)',
  '8 (0)',
  '9 (-)'
]

const baseKeys = ['A', 'W', 'S', 'E', 'D', 'F', 'T', 'G']
const extendedKeys = ['Y', 'H', 'U', 'J']

const initPiano = () => {
  setPiano(midiChannel.value)
  setAscii(midiChannel.value)
  const localMidiIn = localStorage.getItem('midiIn')
  const localMidiOut = localStorage.getItem('midiOut')
  setPortIn(localMidiIn ? localMidiIn : props.selectedMidiIn)
  setPortOut(localMidiOut ? localMidiOut : props.selectedMidiOut)
  connectPiano()
}

const setPiano = (chan: number = 0) => {
  piano.value = JZZ.input.Kbd({
    at: pianoRef.value,
    from: toMidiNote('0', currOctave.value),
    chan,
    to:
      currOctave.value !== 10
        ? toMidiNote('11', currOctave.value)
        : toMidiNote('7', currOctave.value),
    onCreate: function () {
      this.getBlackKeys().setStyle(
        { color: 'var(--offwhite)', backgroundColor: 'var(--offblack)' },
        { backgroundColor: '#888' }
      )
      this.getWhiteKeys().setStyle(
        { color: 'var(--offblack)', backgroundColor: 'var(--offwhite)' },
        { backgroundColor: '#aaa' }
      )

      baseKeys.forEach((key, index) => {
        this.getKey(toMidiNote(index.toString(), currOctave.value)).setInnerHTML(
          '<span class=inner>' + key + '</span>'
        )
      })

      if (currOctave.value !== 10) {
        extendedKeys.forEach((key, index) => {
          this.getKey(toMidiNote((index + 8).toString(), currOctave.value)).setInnerHTML(
            '<span class=inner>' + key + '</span>'
          )
        })
      }
    }
  })
}

const setPortIn = (s: string = '') => {
  if (s.length) {
    portIn.value = JZZ().openMidiIn(s)
  } else {
    portIn.value = JZZ().openMidiIn()
  }
}

const setPortOut = (s: string = '') => {
  if (s.length) {
    portOut.value = JZZ().openMidiOut(s)
  } else {
    portOut.value = JZZ().openMidiOut()
  }
}

const setAscii = (chan: number = 0) => {
  const keys: { [key: string]: number | string | null | HTMLDivElement } = {
    at: pianoRef.value,
    chan
  }

  baseKeys.forEach((key, index) => {
    keys[key] = toMidiNote(index.toString(), currOctave.value)
  })

  if (currOctave.value !== 10) {
    extendedKeys.forEach((key, index) => {
      keys[key] = toMidiNote((index + 8).toString(), currOctave.value)
    })
  }

  ascii.value = JZZ.input.ASCII(keys)
}

const connectPiano = () => {
  filter.value.connect(piano.value)
  piano.value.connect(portOut.value)
  synth.program(0, program.value)
  piano.value.connect(synth)
  ascii.value.connect(filter.value)
  portIn.value.connect(filter.value)
}

const disconnectPiano = () => {
  portIn.value.disconnect(filter.value)
  ascii.value.disconnect(filter.value)
  piano.value.disconnect(synth)
  synthClear()
  piano.value.disconnect(portOut.value)
  filter.value.disconnect(piano.value)
}

const synthClear = () => {
  for (let i = 0; i < 128; i++) {
    synth.noteOff(0, i)
  }
}

const enableKeypress = () => {
  disconnectPiano()
  setAscii(midiChannel.value)
  filter.value = JZZ.Widget({
    _receive: function (msg: any) {
      msg[2] = vel.value
      this._emit(msg)
    }
  })
  connectPiano()
  changeFilter()
}

const disableKeypress = () => {
  disconnectPiano()
  ascii.value = JZZ.input.ASCII()
  filter.value = JZZ.Widget()
  connectPiano()
}

const changeFilter = () => {
  if (!notes.value) return
  disconnectPiano()
  filter.value = JZZ.Widget({
    _receive: function (msg: any) {
      msg[2] = vel.value
      // emit if note in array
      if (notes.value!.includes(msg[1].toString())) {
        this._emit(msg)
      }
    }
  })
  connectPiano()
}

const changeOctave = (octave: number) => {
  disconnectPiano()

  currOctave.value = octave

  setPiano(midiChannel.value)
  setAscii(midiChannel.value)

  connectPiano()

  limitNotes()
}

const setNotes = () => {
  const notesArr = toFormattedPrimeFormArray(props.selectedSets[0])
  let notesRet = []
  let complementRet = []
  const standardFormArr = notesArr.map((e) => transpose(e, props.transposition))
  for (let i = 0; i <= 127; i++) {
    if (standardFormArr.includes((i % 12).toString())) {
      notesRet.push(i.toString())
    } else {
      complementRet.push(i.toString())
    }
  }

  notes.value = notesRet
  complement.value = complementRet
}

const limitNotes = () => {
  if (!props.selectedSets.length || !notes.value || !complement.value) return

  // change filter to prevent keydown events
  changeFilter()

  const styles = {
    disableKey: { backgroundColor: 'red', transition: 'background-color .5s ease-in-out' },
    enableBlackKey: { backgroundColor: 'var(--offblack)', transition: 'none' },
    enableBlackKeyPressed: { backgroundColor: '#888', transition: 'none' },
    enableWhiteKey: { backgroundColor: 'var(--offwhite)', transition: 'none' },
    enableWhiteKeyPressed: { backgroundColor: '#aaa', transition: 'none' }
  }

  const setKeys = (
    note: string,
    enable: boolean = true,
    style: { [key: string]: string } = {},
    stylePressed: { [key: string]: string } = {}
  ) => {
    const key = piano.value.getKey(note)

    enable ? key.enable() : key.disable()

    key.setStyle(style, stylePressed)
  }

  for (const n of complement.value) {
    setKeys(n, false, styles.disableKey, styles.disableKey)
  }

  for (const n of notes.value) {
    if (isBlackKey(parseInt(n))) {
      setKeys(n, true, styles.enableBlackKey, styles.enableBlackKeyPressed)
    } else {
      setKeys(n, true, styles.enableWhiteKey, styles.enableWhiteKeyPressed)
    }
  }
}

const keydownHandler = (e: KeyboardEvent) => {
  if (props.textFieldFocused) return // if a textField is focused disable custom keyboard events
  const keyToOctaveMap: { [key: string]: number } = {
    '1': 0,
    '2': 1,
    '3': 2,
    '4': 3,
    '5': 4,
    '6': 5,
    '7': 6,
    '8': 7,
    '9': 8,
    '0': 9,
    '-': 10
  }

  const octave = keyToOctaveMap[e.key]

  if (octave !== undefined) {
    changeOctave(octave)
  }

  const shiftOctave = (shift: number) => {
    if (currOctave.value + shift < 0 || currOctave.value + shift > 10) {
      return
    }
    currOctave.value += shift
    changeOctave(currOctave.value)
  }

  switch (e.key) {
    case ' ':
    case 'CapsLock':
      shiftOctave(1)
      break
    case 'Shift':
      shiftOctave(-1)
      break
  }
}

const changePianoAudioProgram = (s: string) => {
  program.value = parseInt(s)
  disconnectPiano()
  connectPiano()
}

const changeMidiChannel = (s: string) => {
  midiChannel.value = parseInt(s)
  disconnectPiano()
  setPiano(midiChannel.value)
  setAscii(midiChannel.value)
  connectPiano()
  limitNotes()
}

const changePianoVel = (s: string) => {
  vel.value = parseInt(s)
}

onMounted(() => {
  initPiano()
  window.addEventListener('keydown', keydownHandler)

  // set red notes and disable keys on update of props
  watch(
    () => [props.selectedSets, props.transposition, currOctave.value],
    () => {
      setNotes()
      limitNotes()
    }
  )

  // disable all keys when in a text field
  watch(
    () => props.textFieldFocused,
    () => (props.textFieldFocused ? disableKeypress() : enableKeypress())
  )

  watch(
    () => props.selectedMidiIn,
    () => {
      disconnectPiano()
      portIn.value.close()
      setPortIn(props.selectedMidiIn)
      connectPiano()
    }
  )

  watch(
    () => props.selectedMidiOut,
    () => {
      disconnectPiano()
      portOut.value.close()
      setPortOut(props.selectedMidiOut)
      connectPiano()
    }
  )
})

onUnmounted(() => {
  disconnectPiano()
  window.removeEventListener('keydown', keydownHandler)
})
</script>

<template>
  <div class="piano-container">
    <div></div>
    <div class="piano-inner-grid-container">
      <ul class="octave-switches">
        <li
          v-for="(label, index) in octaveSwitchLabels"
          :key="index"
          @click="changeOctave(index)"
          :class="{ 'active-color': currOctave === index }"
        >
          {{ label }}
        </li>
      </ul>
      <div class="piano" ref="pianoRef"></div>
    </div>
    <div class="piano-inner-grid-container audio-panel">
      <h2 style="font-weight: bold; text-decoration: underline">Audio Panel</h2>
      <SwitchMidiButton @changeMidiChannel="changeMidiChannel"></SwitchMidiButton>
      <PianoProgramButton
        v-if="midiChannel === 0"
        @changePianoAudioProgram="changePianoAudioProgram"
      ></PianoProgramButton>
      <PianoVelocitySlider @changePianoVel="changePianoVel"></PianoVelocitySlider>
    </div>
  </div>
</template>

<style>
.piano-container {
  display: grid;
  justify-content: center;
  align-items: start;
  grid-template-columns: min-content;
  grid-template-rows: 1fr;
  gap: 1%;
}

.piano {
  min-width: 295px;
}

.piano-inner-grid-container {
  display: grid;
  justify-content: center;
  align-items: center;
  grid-template-rows: 1fr;
  gap: 2%;
}

.audio-panel {
  margin: 0 min-content 0 min-content;
  padding: 2em;
  border-radius: 10px;
  border: 1px solid var(--color-accent);
}

@media only screen and (min-width: 1024px) {
  .piano-container {
    grid-template-columns: 1fr min-content 1fr;
    grid-template-rows: 1fr;
  }
  .audio-panel {
    margin: 0 30% 0 30%;
    padding: 2em;
  }
}

.octave-switches {
  display: grid;
  grid-template-columns: repeat(11, 1fr);
  padding: 1% 0 0 1%;
}

ul.octave-switches li {
  list-style: none;
  cursor: pointer;
  text-align: center;
  border: 1px;
  border-style: solid;
  border-radius: 5px;
  padding: 8% 2% 8% 2%;
}

ul.octave-switches li:hover {
  background-color: var(--color-hover);
}
</style>
