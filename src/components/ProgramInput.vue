<script setup lang="ts">
import { ref, watch } from 'vue'
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
  hashData: { [key: string]: string }
  firstInteraction: boolean
}>()

const $emit = defineEmits([
  'changeIsPlaying',
  'changeMidiLoaded',
  'changePosition',
  'changeStopPosition',
  'changePlayer',
  'changeIsLooping',
  'jumpPosition',
  'changePositionText',
  'changeParsedProgram'
])

type ParsedProgram = {
  forte: string
  transposition: string
  timestamp: string
}

const textInput = ref<string>('')
const oldTextInput = ref<string>('')
const textAreaRef = ref<null | HTMLTextAreaElement>(null)
const midiFileInput = ref<null | HTMLInputElement>(null)
const errorMessages = ref<null | string[]>(null)
const isValidProgram = ref<boolean>(false)
const isModified = ref<boolean>(false)
const localProgramSelect = localStorage.getItem('programSelect')
const programSelect = ref<string>(
  localProgramSelect ? localProgramSelect : '/data/blue-bossa-modal'
)
const isCustom = ref<boolean>(false)

const loadPlayer = (data: string) => {
  errorMessages.value = null
  isValidProgram.value = false
  const playerInit = JZZ.MIDI.SMF(data).player()
  $emit('changeMidiLoaded', true)
  $emit('changePlayer', playerInit)
}

const preloadMidi = async (url: string) => {
  if (props.player) {
    $emit('changeMidiLoaded', false)
    $emit('changeIsPlaying', 'false')
    props.player.close()
  }
  if (url === 'custom') {
    isValidProgram.value = false
    isCustom.value = true
    if (midiFileInput.value) {
      midiFileInput.value.value = ''
    }
    return
  } else {
    isCustom.value = false
    textInput.value = 'Loading...'
    oldTextInput.value = 'Loading...'
  }
  try {
    const resMidi = await fetch(url + '.mid')
    if (resMidi.ok) {
      const buffer = await resMidi.arrayBuffer()
      let data = ''
      const bytes = new Uint8Array(buffer)
      for (let i = 0; i < bytes.length; i++) {
        data += String.fromCharCode(bytes[i])
      }
      loadPlayer(data)
    } else {
      console.log('Not 200', resMidi)
    }

    const resTxt = await fetch(url + '.txt')
    if (resTxt.ok) {
      const text = await resTxt.text()
      textInput.value = text
      oldTextInput.value = text
      parse()
    } else {
      console.log('Not 200', resTxt)
    }
  } catch (error) {
    console.log(error)
  }
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
    '\n'
  textAreaChangeHandler(1) // add extra newline of height
}

const parse = () => {
  const testWhiteSpace = (c: string | undefined) => {
    if (c === undefined) return
    if (/\s/g.test(c)) {
      return ' '
    } else {
      return c
    }
  }
  const changeLocation = (s: string | undefined) => {
    if (s === undefined) return // undefined means end of array
    if (s === '\n') {
      location.lineNumber++
      location.charNumber = 0
    } else {
      // add length of the token, whitespace have a length of one
      location.charNumber += s.length
    }
  }

  const incrementCurrDelimiter = () => {
    currDelimiter = (currDelimiter + 1) % delimiters.length
  }

  const parseDelimiters = (
    delimiter: string,
    arr: string[],
    validateToken: (token: string, errorStack: string[]) => void
  ): void => {
    let token = ''
    let char: string | undefined = ''

    if (delimiters[currDelimiter] !== delimiter) {
      const error = `[${location.lineNumber}:${location.charNumber}] Unexpected delimiter '${delimiter}', expected '${delimiters[currDelimiter]}'`
      errorStack.push(error)
    } else {
      incrementCurrDelimiter() // move delimiter to next expected value
    }

    changeLocation(delimiter) // add the length of the delimiter, after parsing delimiter error

    // read until next delimiter or whitespace
    while (src[0] && !delimiters.includes(src[0]) && testWhiteSpace(src[0]) !== ' ') {
      char = src.shift()
      token += char
    }

    validateToken(token, errorStack) // validate after full token is read
    arr.push(token) // push token, even on error
    changeLocation(token) // add the length of the token after validating the token

    // read whitespace until next delimiter
    while (src[0] && !delimiters.includes(src[0])) {
      char = src.shift()
      changeLocation(char) // add the length of the whitespace
    }

    if (!firstDelimiterRead) firstDelimiterRead = true
  }

  const forteValidation = (token: string, errorStack: string[]): void => {
    if (!token.length) {
      const error = `[${location.lineNumber}:${location.charNumber}] Missing forte value`
      errorStack.push(error)
      return
    }

    if (!/^\d{1,2}-z?\d{1,2}[A,B]?$/g.test(token)) {
      const error = `[${location.lineNumber}:${location.charNumber}] Incorrect format of forte token '${token}', must be in the regex format ^\\d{1,2}-z?\\d{1,2}[A,B]?$`
      errorStack.push(error)
      return
    }

    if (!(token in props.hashData)) {
      const error = `[${location.lineNumber}:${location.charNumber}] Nonexistent forte token '${token}'`
      errorStack.push(error)
      return
    }
  }

  const transpositionValidation = (token: string, errorStack: string[]): void => {
    if (!token.length) {
      const error = `[${location.lineNumber}:${location.charNumber}] Missing transposition value`
      errorStack.push(error)
      return
    }

    if (!/^\d+$/g.test(token)) {
      const error = `[${location.lineNumber}:${location.charNumber}] Incorrect format of transposition token '${token}', must be a non-negative integer`
      errorStack.push(error)
      return
    }

    const tokenInt = parseInt(token, 10)

    if (tokenInt > 11) {
      const error = `[${location.lineNumber}:${location.charNumber}] Transposition token '${tokenInt}' is greater than 11`
      errorStack.push(error)
      return
    }
  }

  const timestampValidation = (token: string, errorStack: string[]): void => {
    if (!token.length) {
      const error = `[${location.lineNumber}:${location.charNumber}] Missing timestamp value`
      errorStack.push(error)
      return
    }

    if (!/^\d+$/g.test(token)) {
      const error = `[${location.lineNumber}:${location.charNumber}] Incorrect format of timestamp token '${token}', must be a non-negative integer`
      errorStack.push(error)
      return
    }

    const tokenInt = parseInt(token, 10)

    if (tokenInt > Math.floor(props.duration)) {
      const error = `[${location.lineNumber}:${
        location.charNumber
      }] Timestamp token '${tokenInt}' is greater than the duration (${Math.floor(
        props.duration
      )}) of the MIDI file`
      errorStack.push(error)
      return
    }

    // duplicate validation
    if (seen.has(tokenInt)) {
      duplicates.add(tokenInt)
    } else {
      seen.add(tokenInt)
    }

    if (duplicates.size) {
      const error = `[${location.lineNumber}:${location.charNumber}] Duplicate timestamp '${tokenInt}'`
      errorStack.push(error)
      duplicates.clear()
      return
    }
  }

  const src = textInput.value.split('')

  const errorStack: string[] = []

  const location = { lineNumber: 1, charNumber: 0 }

  const forteArr: string[] = []
  const transpositionArr: string[] = []
  const timestampArr: string[] = []

  const delimiters = ['F', 'T', '@']
  let currDelimiter = 0
  let firstDelimiterRead = false

  // used to prevent duplicate timestamps
  const seen = new Set()
  const duplicates = new Set()

  while (src.length > 0) {
    const nextChar = src.shift()
    switch (nextChar) {
      case 'F':
        parseDelimiters('F', forteArr, forteValidation)
        break
      case 'T':
        parseDelimiters('T', transpositionArr, transpositionValidation)
        break
      case '@':
        parseDelimiters('@', timestampArr, timestampValidation)
        break
      default:
        break
    }
  }

  if (!firstDelimiterRead) {
    const error = `[${location.lineNumber}:${location.charNumber}] Not a valid program, mising delimiters 'F', 'T', and '@'`
    errorStack.push(error)
  } else if (currDelimiter === 1) {
    const error = `[${location.lineNumber}:${location.charNumber}] Incomplete program, missing delimiters 'T' and '@'`
    errorStack.push(error)
  } else if (currDelimiter === 2) {
    const error = `[${location.lineNumber}:${location.charNumber}] Incomplete program, missing delimiter '@'`
    errorStack.push(error)
  }

  function compareByTimestamp(a: ParsedProgram, b: ParsedProgram) {
    return parseInt(a.timestamp) - parseInt(b.timestamp)
  }

  if (errorStack.length) {
    errorMessages.value = errorStack
    isValidProgram.value = false
  } else {
    const res: { forte: string; transposition: string; timestamp: string }[] = []
    for (let i = 0; i < forteArr.length; i++) {
      res.push({
        forte: forteArr[i],
        transposition: transpositionArr[i],
        timestamp: timestampArr[i]
      })
    }

    res.sort(compareByTimestamp) // sort by increasing timestamp

    errorMessages.value = null
    isValidProgram.value = true
    $emit('changeParsedProgram', res)
  }
}

const textAreaChangeHandler = (additionalLines = 0) => {
  if (!textAreaRef.value) return
  textAreaRef.value.style.height = '0px'
  textAreaRef.value.style.height = `${Math.max(
    textAreaRef.value.scrollHeight + 4 + additionalLines * 15,
    100
  )}px`
}

const saveOldTextInput = () => {
  oldTextInput.value = textInput.value
}

const handleProgramInput = () => {
  parse()
  saveOldTextInput()
  isModified.value = false
}

const onHashDataChange = () => {
  if (Object.keys(props.hashData).length) {
    preloadMidi(programSelect.value)
  }
}

watch(textInput, (newTextInput) => {
  if (newTextInput === oldTextInput.value) {
    isModified.value = false
  } else if (isCustom.value) {
    localStorage.setItem('textInput', newTextInput)
    isModified.value = true
  }
})

watch(isCustom, () => {
  if (isCustom.value) {
    const localTextInput = localStorage.getItem('textInput')
    textInput.value = localTextInput ? localTextInput : ''
    oldTextInput.value = localTextInput ? localTextInput : ''
  }
})

watch(() => props.hashData, onHashDataChange, { immediate: true }) // when hashData is fetched run programSelect

watch([programSelect, () => props.firstInteraction], () => {
  onHashDataChange()
})
</script>

<template>
  <div class="program-container">
    <div class="piano-inner-grid-container program-panel">
      <h2 style="font-weight: bold; text-decoration: underline; padding: 0">Program Panel</h2>
      <div>
        <label for="programSelect">Program Select:</label>
        <select id="programSelect" name="programSelect" v-model="programSelect">
          <option value="/data/blue-bossa-modal">Blue Bossa (Modal)</option>
          <option value="custom">Custom</option>
        </select>
      </div>
      <div :style="{ visibility: isCustom ? 'visible' : 'hidden' }">
        <label for="load-midi">Load Midi:</label>
        <input
          ref="midiFileInput"
          id="load-midi"
          style="max-width: 230px"
          @change="loadMidi"
          type="file"
          accept=".mid"
        />
      </div>
      <label :style="{ visibility: isCustom ? 'visible' : 'hidden' }" for="programInput"
        >Program Input:</label
      >
      <div
        :style="{ visibility: isCustom ? 'visible' : 'hidden' }"
        id="programInput"
        class="program-buttons"
      >
        <button @click="addCurrentSelection" :disabled="!isMidiLoaded">Add Set @ Time</button>
        <button @click="handleProgramInput" :disabled="!isMidiLoaded">Parse Program</button>
      </div>
    </div>
    <div class="import-program-panel">
      <h2 style="font-weight: bold; text-decoration: underline; padding: 0">Import Program</h2>
      <textarea
        :disabled="!isCustom || !isMidiLoaded"
        ref="textAreaRef"
        class="piano-inner-grid-container input-text"
        type="text"
        v-model="textInput"
        @input="textAreaChangeHandler()"
      ></textarea>
      <h2 style="font-weight: bold; text-decoration: underline; padding: 0">Output</h2>
      <div v-if="isModified" style="font-weight: bold">*Current Program Modified</div>
      <div v-if="isValidProgram">Program parsed successfully!</div>
      <div v-for="error in errorMessages" :key="error">
        {{ error }}
      </div>
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
  white-space: pre;
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
    grid-template-rows: min-content min-content;
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
