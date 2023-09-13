<script setup lang="ts">
import { onMounted, watch, ref } from 'vue'
import { JZZ } from 'jzz'
import { Tiny } from 'jzz-synth-tiny'
import { Kbd } from 'jzz-input-kbd'
import { isBlackKey, toFormattedPrimeFormArray, toMidiNote } from '@/functions/helpers'
Tiny(JZZ)
Kbd(JZZ)

const props = defineProps<{
  selectedSets: string[]
}>()

const synth = JZZ.synth.Tiny()

const piano = ref<null | any>(null)
const pianoRef = ref<null | HTMLDivElement>(null)
const activeTab = ref<string>('piano')

const makePiano = () => {
  piano.value = JZZ.input.Kbd({
    at: pianoRef.value,
    from: 'C5',
    to: 'B5',
    onCreate: function () {
      this.getBlackKeys().setStyle({ color: 'var(--offwhite)' })
      this.getWhiteKeys().setStyle({ color: 'var(--offblack)' })
      this.getKey('C5').setInnerHTML('<span class=inner>Z</span>')
      this.getKey('C#5').setInnerHTML('<span class=inner>S</span>')
      this.getKey('D5').setInnerHTML('<span class=inner>X</span>')
      this.getKey('D#5').setInnerHTML('<span class=inner>D</span>')
      this.getKey('E5').setInnerHTML('<span class=inner>C</span>')
      this.getKey('F5').setInnerHTML('<span class=inner>V</span>')
      this.getKey('F#5').setInnerHTML('<span class=inner>G</span>')
      this.getKey('G5').setInnerHTML('<span class=inner>B</span>')
      this.getKey('G#5').setInnerHTML('<span class=inner>H</span>')
      this.getKey('A5').setInnerHTML('<span class=inner>N</span>')
      this.getKey('A#5').setInnerHTML('<span class=inner>J</span>')
      this.getKey('B5').setInnerHTML('<span class=inner>M</span>')
    }
  })

  const ascii = JZZ.input.ASCII({
    Z: '60',
    S: '61',
    X: '62',
    D: '63',
    C: '64',
    V: '65',
    G: '66',
    B: '67',
    H: '68',
    N: '69',
    J: '70',
    M: '71'
  })

  ascii.connect(piano.value)

  if (piano.value) {
    piano.value.connect(synth)
  }
}

const limitNotes = () => {
  // refactor later when you have the complement data
  const { selectedSets } = props
  if (selectedSets.length) {
    const fullset: string[] = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11']
    const notes: string[] = toFormattedPrimeFormArray(selectedSets[0])
    const complement: string[] = fullset.filter((e) => !notes.includes(e))

    for (const n of complement) {
      piano.value
        .getKey(toMidiNote(n))
        .setStyle(
          { backgroundColor: 'red', 'pointer-events': 'none' },
          { backgroundColor: 'red', 'pointer-events': 'none' }
        )
    }

    for (const n of notes) {
      if (isBlackKey(parseInt(n))) {
        piano.value
          .getKey(toMidiNote(n))
          .setStyle(
            { backgroundColor: '#303030', 'pointer-events': 'auto' },
            { backgroundColor: '#888', 'pointer-events': 'auto' }
          )
      } else {
        piano.value
          .getKey(toMidiNote(n))
          .setStyle(
            { backgroundColor: '#fffff2', 'pointer-events': 'auto' },
            { backgroundColor: '#aaa', 'pointer-events': 'auto' }
          )
      }
    }
  }
}

onMounted(() => {
  makePiano()

  watch(
    () => props.selectedSets,
    () => limitNotes()
  )
})
</script>

<template>
  <div class="container" @click="$emit('focusHorizontal')">
    <ul class="tabs">
      <li @click="activeTab = 'piano'">Piano</li>
      <li @click="activeTab = 'compose'">Compose</li>
      <li @click="activeTab = 'options'">Options</li>
    </ul>
    <div class="content">
      <div v-show="activeTab === 'piano'" ref="pianoRef"></div>
    </div>
  </div>
</template>

<style>
.tabs {
  display: grid;
  /* align-items: center; */
  /* justify-content: space-between; */
  grid-template-columns: repeat(3, 6%);
  /* padding: 0 50em 0 50em; */
  padding: 1% 0 0 1%;
  gap: 1%;
}

.content {
  display: grid;
  align-items: center;
  justify-content: center;
}

.container {
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

  /* display: grid;
  align-items: center;
  justify-content: center;
  gap: 20px; */

  /* display: grid;
  grid-template-rows: auto 1fr;
  align-items: center;
  justify-content: center; */
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
}
</style>
