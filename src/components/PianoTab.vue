<script setup lang="ts">
import { onMounted, watch, ref, onUnmounted } from 'vue'
import { JZZ } from 'jzz'
import { Tiny } from 'jzz-synth-tiny'
import { Kbd } from 'jzz-input-kbd'
import { isBlackKey, toFormattedPrimeFormArray, toMidiNote } from '@/functions/helpers'
Tiny(JZZ)
Kbd(JZZ)

const props = defineProps<{
  selectedSets: string[]
  textFieldFocused: boolean
}>()

const synth = JZZ.synth.Tiny()

const piano = ref<null | any>(null)
const ascii = ref<null | any>(null)
const filter = ref<any>(JZZ.Widget())
const pianoRef = ref<null | HTMLDivElement>(null)
const currOctave = ref<number>(5)

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
  setPiano()
  setAscii()

  ascii.value.connect(filter.value)
  filter.value.connect(piano.value)

  piano.value.connect(synth)
}

const setPiano = () => {
  piano.value = JZZ.input.Kbd({
    at: pianoRef.value,
    from: toMidiNote('0', currOctave.value),
    to:
      currOctave.value !== 10
        ? toMidiNote('11', currOctave.value)
        : toMidiNote('7', currOctave.value),
    onCreate: function () {
      this.getBlackKeys().setStyle({ color: 'var(--offwhite)' })
      this.getWhiteKeys().setStyle({ color: 'var(--offblack)' })

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

const setAscii = () => {
  const keys: { [key: string]: string | null | HTMLDivElement } = { at: pianoRef.value }

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

const enableKeypress = () => {
  ascii.value.disconnect(filter.value)
  filter.value.disconnect(piano.value)
  setAscii()
  filter.value = JZZ.Widget()
  ascii.value.connect(filter.value)
  filter.value.connect(piano.value)
  if (props.selectedSets.length) {
    const notes: string[] = toFormattedPrimeFormArray(props.selectedSets[0]).map((n) =>
      toMidiNote(n, currOctave.value)
    )
    changeFilter(notes)
  }
}

const disableKeypress = () => {
  ascii.value.disconnect(filter.value)
  filter.value.disconnect(piano.value)
  ascii.value = JZZ.input.ASCII()
  filter.value = JZZ.Widget()
  ascii.value.connect(filter.value)
  filter.value.connect(piano.value)
}

const changeFilter = (midiNoteArr: string[]) => {
  ascii.value.disconnect(filter.value)
  filter.value.disconnect(piano.value)
  filter.value = JZZ.Widget({
    _receive: function (msg: any) {
      // emit if note in array
      if (midiNoteArr.includes(msg[1].toString())) {
        this.emit(msg)
      }
    }
  })
  ascii.value.connect(filter.value)
  filter.value.connect(piano.value)
}

const changeOctave = (octave: number) => {
  piano.value.disconnect(synth)
  filter.value.disconnect(piano.value)
  ascii.value.disconnect(filter.value)

  currOctave.value = octave

  setPiano()
  setAscii()

  ascii.value.connect(filter.value)
  filter.value.connect(piano.value)
  piano.value.connect(synth)

  limitNotes()
}

const limitNotes = () => {
  if (!props.selectedSets.length) return

  const fullset: string[] = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11']
  const notes: string[] = toFormattedPrimeFormArray(props.selectedSets[0]).map((n) =>
    toMidiNote(n, currOctave.value)
  )
  const complement: string[] = fullset
    .map((n) => toMidiNote(n, currOctave.value))
    .filter((e) => !notes.includes(e))

  // change filter to prevent keydown events
  changeFilter(notes)

  const styles = {
    disableKey: { backgroundColor: 'red', transition: 'background-color .5s ease-in-out' },
    enableBlackKey: { backgroundColor: '#303030', transition: 'none' },
    enableBlackKeyPressed: { backgroundColor: '#888', transition: 'none' },
    enableWhiteKey: { backgroundColor: '#fffff2', transition: 'none' },
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

  for (const n of complement) {
    setKeys(n, false, styles.disableKey, styles.disableKey)
  }

  for (const n of notes) {
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

onMounted(() => {
  initPiano()
  window.addEventListener('keydown', keydownHandler)

  watch(
    () => props.selectedSets,
    () => limitNotes()
  )

  watch(
    () => props.textFieldFocused,
    () => (props.textFieldFocused ? disableKeypress() : enableKeypress())
  )
})

onUnmounted(() => {
  window.removeEventListener('keydown', keydownHandler)
})
</script>

<template>
  <div class="piano-container">
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
</template>

<style>
.piano-container {
  display: grid;
  justify-content: center;
  align-items: center;
  grid-template-columns: min-content;
  grid-template-rows: 1fr;
  gap: 5%;
}
.piano {
  min-width: 295px;
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
