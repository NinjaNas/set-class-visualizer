<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import PianoTab from '../components/PianoTab.vue'
import OptionsTab from '../components/OptionsTab.vue'
import ProgramInput from './ProgramInput.vue'
import { JZZ } from 'jzz'

const props = defineProps<{
  isHorizontalPanelOpen: boolean
  selectedSets: string[]
  textFieldFocused: boolean
  transposition: number
  hashData: { [key: string]: string }
  hashVecData: { [key: string]: string }
  parsedProgram: null | { forte: string; transposition: string; timestamp: string; score: string }[]
  firstInteraction: boolean
}>()

type ParsedProgram = {
  forte: string
  transposition: string
  timestamp: string
}

const $emit = defineEmits([
  'focusHorizontal',
  'closeModal',
  'changeParsedProgram',
  'changeGraphText',
  'changeSelectedSet',
  'changeVerticalPanelToggle',
  'fetchAndCreateDag',
  'changeGraphAudioType',
  'changeGraphAudioProgram',
  'changeGraphVel',
  'changeHighlightProgram',
  'changeTranspositionTextProgram'
])

let synth: null | any = null

const activeTab = ref<string>('piano')
const selectedMidiIn = ref<string>('')
const selectedMidiOut = ref<string>('')
const container = ref<null | HTMLDivElement>(null)
const containerHeight = ref<null | number>(null)
const isMidiLoaded = ref<boolean>(false)
const isPlaying = ref<string>('false')
const isLooping = ref<boolean>(false)
const currIndexProgram = ref<number>(0)
const positionId = ref<number[]>([]) // for debouncing
const position = ref<number>(0)
const duration = ref<number>(0)
const player = ref<null | any>(null)
const positionDebounce = ref<number>(100)
const score = ref<{ curr: string; next: string }>({ curr: '', next: '' })
const isSliderInput = ref<boolean>(false)

const changeMidiIn = (s: string) => {
  selectedMidiIn.value = s ? s : ''
}

const changeMidiOut = (s: string) => {
  selectedMidiOut.value = s ? s : ''
}

const changeIsPlaying = (s: string) => {
  isPlaying.value = s
}

const changeIsLooping = (b: boolean) => {
  isLooping.value = b
}

const setIsLooping = (b: boolean) => {
  player.value.loop(b)
}

const changeMidiLoaded = (b: boolean) => {
  isMidiLoaded.value = b
}

const changePlayer = (a: any) => {
  player.value = a
  player.value.connect(synth)
  position.value = player.value.positionMS()
  duration.value = player.value.durationMS()
}

const changePosition = () => {
  positionId.value.push(
    setInterval(() => {
      position.value = player.value.positionMS()
    }, positionDebounce.value)
  )
  duration.value = player.value.durationMS()
  player.value.onEnd = function () {
    if (!isLooping.value) {
      changeIsPlaying('false')
    }
  }
}

const changeStopPosition = () => {
  position.value = player.value.positionMS()
  if (positionId.value.length) {
    positionId.value.forEach((e: number) => {
      clearInterval(e)
    })
    positionId.value = []
  }
}

const jumpPosition = (n: number) => {
  player.value.jump(player.value.ms2tick(n))
  position.value = n
}

const changePositionText = (n: number) => {
  position.value = n
}

const changeTempo = (s: string) => {
  player.value.speed(s)
}

const resizeHandler = (event: PointerEvent) => {
  if (!container.value) return
  if (!containerHeight.value) {
    containerHeight.value = container.value.clientHeight
  }

  const startY = event.clientY
  const initialHeight = containerHeight.value
  const handleMove = (event: PointerEvent) => {
    if (event.clientY > 10 && event.clientY < window.innerHeight - 10) {
      const deltaY = event.clientY - startY
      containerHeight.value = initialHeight - deltaY
    }
  }

  const stopResizing = () => {
    document.removeEventListener('pointermove', handleMove)
    document.removeEventListener('pointerup', stopResizing)
  }

  document.addEventListener('pointermove', handleMove)
  document.addEventListener('pointerup', stopResizing)
}

watch(isPlaying, () => {
  switch (isPlaying.value) {
    case 'false':
      player.value.stop()
      changeStopPosition()
      break
    case 'pause':
      player.value.pause()
      changeStopPosition()
      break
    case 'resume':
      player.value.resume()
      changePosition()
      break
    case 'true':
      player.value.resume()
      changePosition()
      break
  }
})

watch(isLooping, () => {
  player.value.loop(isLooping.value)
})

const getCurrParsedObj = () => {
  if (!props.parsedProgram || !props.parsedProgram.length) return
  const res =
    props.hashData[props.parsedProgram[currIndexProgram.value].forte]
      .replace(/10/, 'T')
      .replace(/11/, 'E') +
    '|' +
    props.parsedProgram[currIndexProgram.value].forte +
    '|' +
    props.hashVecData[props.parsedProgram[currIndexProgram.value].forte].replace(/[<,>]/g, '')

  if (currIndexProgram.value + 1 < props.parsedProgram.length) {
    score.value = {
      curr: props.parsedProgram[currIndexProgram.value].score ?? '',
      next: props.parsedProgram[currIndexProgram.value + 1].score ?? ''
    }
  } else {
    score.value = {
      curr: props.parsedProgram[currIndexProgram.value].score ?? '',
      next: ''
    }
  }

  $emit(
    'changeSelectedSet',
    res,
    parseInt(props.parsedProgram[currIndexProgram.value].transposition)
  )
}

// users can move the slider so a check is needed to find the correct index
const findCurrIndex = () => {
  if (!props.parsedProgram) return

  // binary search
  let low = 0
  let high = props.parsedProgram.length - 1

  while (low <= high) {
    const mid = Math.floor((low + high) / 2)

    if (parseInt(props.parsedProgram[mid].timestamp) > position.value) {
      high = mid - 1
    } else if (parseInt(props.parsedProgram[mid].timestamp) < position.value) {
      // find the first timestamp less than the current position
      if (mid + 1 < props.parsedProgram.length) {
        if (parseInt(props.parsedProgram[mid + 1].timestamp) > position.value) {
          currIndexProgram.value = mid
          return
        } else if (parseInt(props.parsedProgram[mid + 1].timestamp) < position.value) {
          low = mid + 1
          continue
        } else {
          currIndexProgram.value = mid + 1
          return
        }
      } else {
        // at end of the program
        currIndexProgram.value = mid
        return
      }
    } else {
      currIndexProgram.value = mid
      return
    }
  }
}

const changePositionDebounce = (s: string) => {
  positionDebounce.value = parseInt(s)
  isPlaying.value = 'false' // stop player because positionDebounce needs a reset to work
}

const changeIsSliderInput = (b: boolean) => {
  isSliderInput.value = b
}

watch(
  [currIndexProgram, isPlaying, position, isSliderInput],
  (
    [newCurrIndex, newIsPlaying, newPosition, newIsSliderInput],
    [oldCurrIndex, oldIsPlaying, oldPosition, oldIsSliderInput]
  ) => {
    if (!props.parsedProgram || !props.parsedProgram.length) return

    if (currIndexProgram.value >= props.parsedProgram.length) {
      return
    }

    switch (isPlaying.value) {
      case 'false':
        if (isSliderInput.value) {
          // need to check on every position change because user can use the slider
          findCurrIndex()
        } else if (newIsSliderInput === oldIsSliderInput) {
          // set to 0, isSliderInput is false and has been false
          currIndexProgram.value = 0
        }
        // get the correct transposed set as a string, reformatted for d3dag
        getCurrParsedObj()
        break
      case 'pause':
        findCurrIndex()
        getCurrParsedObj()
        break
      case 'resume':
      case 'true':
        if (isSliderInput.value || newPosition < oldPosition) {
          // if slider input or repeat loop
          findCurrIndex()
        } else if (
          props.parsedProgram.length > currIndexProgram.value + 1 &&
          newPosition >= parseInt(props.parsedProgram[currIndexProgram.value + 1].timestamp)
        ) {
          // increment by 1 if the next position is greater than or equal to the timestamp for the next token
          currIndexProgram.value += 1
        }

        // only run when needed
        if (newCurrIndex !== oldCurrIndex || newIsPlaying !== oldIsPlaying) {
          getCurrParsedObj()
        }
        break
      default:
        break
    }
  }
)

const resizeBasedOnOrientation = () => {
  screen.orientation.addEventListener('change', () => {
    if (containerHeight.value && containerHeight.value > window.innerHeight) {
      containerHeight.value = window.innerHeight - 10
    }
  })
}

watch(
  () => props.firstInteraction,
  () => {
    synth = JZZ.synth.Tiny()
  }
)

onMounted(() => {
  watch(
    () => props.isHorizontalPanelOpen,
    async (isHorizontalPanelOpen) => {
      if (isHorizontalPanelOpen) {
        await nextTick() // wait for dom update because of v-show component will not be loaded
        if (container.value) {
          containerHeight.value = container.value.clientHeight
        }
      }
    }
  )
  resizeBasedOnOrientation()
})
</script>

<template>
  <transition name="fadeup">
    <div
      v-show="isHorizontalPanelOpen"
      class="horizontal-container"
      @click="$emit('focusHorizontal')"
      :style="{ height: containerHeight + 'px' }"
      ref="container"
    >
      <div class="horizontal-container-resize" @pointerdown="resizeHandler"></div>
      <div class="overflow-y-wrapper">
        <a @click="$emit('closeModal')" class="menuCloseHorizontal"></a>
        <ul class="tabs">
          <li @click="activeTab = 'piano'" :class="{ 'active-color': activeTab === 'piano' }">
            Piano
          </li>
          <li @click="activeTab = 'program'" :class="{ 'active-color': activeTab === 'program' }">
            Program
          </li>
          <li @click="activeTab = 'options'" :class="{ 'active-color': activeTab === 'options' }">
            Options
          </li>
        </ul>
        <PianoTab
          v-show="activeTab === 'piano'"
          :selectedSets="props.selectedSets"
          :textFieldFocused="textFieldFocused"
          :transposition="transposition"
          :selectedMidiIn="selectedMidiIn"
          :selectedMidiOut="selectedMidiOut"
          :isPlaying="isPlaying"
          :isLooping="isLooping"
          :position="position"
          :duration="duration"
          :isMidiLoaded="isMidiLoaded"
          :activeTab="activeTab"
          :parsedProgram="parsedProgram"
          :firstInteraction="firstInteraction"
          :score="score"
          @changeIsPlaying="changeIsPlaying"
          @changeIsLooping="changeIsLooping"
          @jumpPosition="jumpPosition"
          @changePositionText="changePositionText"
          @changeTempo="changeTempo"
          @changeIsSliderInput="changeIsSliderInput"
        ></PianoTab>
        <ProgramInput
          v-show="activeTab === 'program'"
          :isPlaying="isPlaying"
          :isLooping="isLooping"
          :isMidiLoaded="isMidiLoaded"
          :position="position"
          :duration="duration"
          :selectedSets="selectedSets"
          :transposition="transposition"
          :activeTab="activeTab"
          :player="player"
          :hashData="hashData"
          :firstInteraction="firstInteraction"
          @changeIsPlaying="changeIsPlaying"
          @changeMidiLoaded="changeMidiLoaded"
          @changePosition="changePosition"
          @changeStopPosition="changeStopPosition"
          @changePlayer="changePlayer"
          @changeIsLooping="changeIsLooping"
          @jumpPosition="jumpPosition"
          @changePositionText="changePositionText"
          @changeParsedProgram="(d: ParsedProgram[]) => $emit('changeParsedProgram', d)"
          @setIsLooping="setIsLooping"
          @changeTempo="changeTempo"
          @changeIsSliderInput="changeIsSliderInput"
        ></ProgramInput>
        <OptionsTab
          v-show="activeTab === 'options'"
          :firstInteraction="firstInteraction"
          @changeGraphText="(d: string) => $emit('changeGraphText', d)"
          @changeVerticalPanelToggle="(d: boolean) => $emit('changeVerticalPanelToggle', d)"
          @fetchAndCreateDag="(d: string) => $emit('fetchAndCreateDag', d)"
          @changeGraphAudioType="(d: string) => $emit('changeGraphAudioType', d)"
          @changeGraphAudioProgram="(d: string) => $emit('changeGraphAudioProgram', d)"
          @changeGraphVel="(d: string) => $emit('changeGraphVel', d)"
          @changeHighlightProgram="(d: boolean) => $emit('changeHighlightProgram', d)"
          @changeTranspositionTextProgram="
            (d: boolean) => $emit('changeTranspositionTextProgram', d)
          "
          @changePositionDebounce="changePositionDebounce"
          @changeMidiIn="changeMidiIn"
          @changeMidiOut="changeMidiOut"
        ></OptionsTab>
      </div>
    </div>
  </transition>
</template>

<style>
.tabs {
  display: grid;
  grid-template-columns: repeat(3, min-content);
  justify-content: center;
  padding: 1% 0 0 0;
  gap: 1%;
}

.horizontal-container {
  position: absolute;
  bottom: 0px;
  left: 0px;
  width: 100%;
  height: 30%;
  background: var(--color-background);
  color: var(--color-text);
  border: 2px;
  border-style: dashed none none none;
  border-color: var(--color-text);
}

/* so the resize can clip outside of the container */
.overflow-y-wrapper {
  overflow-y: auto;
  height: 100%;
}

.horizontal-container-resize {
  content: '';
  position: absolute;
  top: -6px;
  left: 0px;
  width: 100%;
  height: 10px;
  cursor: n-resize;
  touch-action: none;
}

span.inner {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  text-align: center;
}

ul.tabs li {
  list-style: none;
  cursor: pointer;
  text-align: center;
  border: 1px;
  border-style: solid;
  border-radius: 5px;
  padding: 8% 2% 8% 2%;
  min-width: 79.5px;
}

ul.tabs li:hover {
  background-color: var(--color-hover);
}

.menuCloseHorizontal:before {
  display: flex;
  align-items: center;
  justify-content: end;
  position: absolute;
  top: 0;
  right: 0;
  content: '\00d7';
  font-size: 1.5em;
  padding-right: 0.5em;
}

@media only screen and (min-width: 480px) {
  .menuCloseHorizontal:before {
    font-size: 2.5em;
  }
  .horizontal-container {
    height: 400px;
  }
}

@media only screen and (min-width: 1280px) {
  .tabs {
    padding: 1% 0 0 1%;
    justify-content: initial;
  }
  ul.tabs li {
    min-width: 100px;
  }
}

.fadeup-enter-active,
.fadeup-leave-active {
  transition: all 0.3s ease-out;
}
.fadeup-enter-from,
.fadeup-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
