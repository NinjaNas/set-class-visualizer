<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  firstInteraction: boolean
}>()

const localAudioProgram = localStorage.getItem('pianoAudioProgram')
const pianoAudioProgram = ref<string>(localAudioProgram ? localAudioProgram : '0')

const $emit = defineEmits(['changePianoAudioProgram'])

const handleSelectChange = (e: Event) => {
  const target = e.target as HTMLSelectElement
  target.blur()
}

watch([pianoAudioProgram, () => props.firstInteraction], () => {
  $emit('changePianoAudioProgram', pianoAudioProgram.value)
  localStorage.setItem('pianoAudioProgram', pianoAudioProgram.value)
})
</script>

<template>
  <label for="pianoAudioProgram">Patch:</label>
  <select
    id="pianoAudioProgram"
    name="pianoAudioProgram"
    v-model="pianoAudioProgram"
    @change="handleSelectChange"
  >
    <option disabled>Piano</option>
    <option value="0">Acoustic Grand Piano</option>
    <option value="1">Bright Acoustic Piano</option>
    <option value="2">Electric Grand Piano</option>
    <option value="3">Honky-tonk Piano</option>
    <option value="4">Electric Piano 1</option>
    <option value="5">Electric Piano 2</option>
    <option value="6">Harpsichord</option>
    <option value="7">Clavinet</option>
    <option disabled>Chromatic Percussion</option>
    <option value="8">Celesta</option>
    <option value="9">Glockenspiel</option>
    <option value="10">Music Box</option>
    <option value="11">Vibraphone</option>
    <option value="12">Marimba</option>
    <option value="13">Xylophone</option>
    <option value="14">Tubular Bells</option>
    <option value="15">Dulcimer</option>
    <option disabled>Organ</option>
    <option value="16">Drawbar Organ</option>
    <option value="17">Percussive Organ</option>
    <option value="18">Rock Organ</option>
    <option value="19">Church Organ</option>
    <option value="20">Reed Organ</option>
    <option value="21">Accordion</option>
    <option value="22">Harmonica</option>
    <option value="23">Tango Accordion</option>
    <option disabled>Guitar</option>
    <option value="24">Acoustic Guitar (nylon)</option>
    <option value="25">Acoustic Guitar (steel)</option>
    <option value="26">Electric Guitar (jazz)</option>
    <option value="27">Electric Guitar (clean)</option>
    <option value="28">Electric Guitar (muted)</option>
    <option value="29">Overdriven Guitar</option>
    <option value="30">Distortion Guitar</option>
    <option value="31">Guitar Harmonics</option>
    <option disabled>Bass</option>
    <option value="32">Acoustic Bass</option>
    <option value="33">Electric Bass (finger)</option>
    <option value="34">Electric Bass (pick)</option>
    <option value="35">Fretless Bass</option>
    <option value="36">Slap Bass 1</option>
    <option value="37">Slap Bass 2</option>
    <option value="38">Synth Bass 1</option>
    <option value="39">Synth Bass 2</option>
    <option disabled>Strings</option>
    <option value="40">Violin</option>
    <option value="41">Viola</option>
    <option value="42">Cello</option>
    <option value="43">Contrabass</option>
    <option value="44">Tremolo Strings</option>
    <option value="45">Pizzicato Strings</option>
    <option value="46">Orchestral Harp</option>
    <option value="47">Timpani</option>
    <option disabled>Ensemble</option>
    <option value="48">String Ensemble 1</option>
    <option value="49">String Ensemble 2</option>
    <option value="50">Synth Strings 1</option>
    <option value="51">Synth String 2</option>
    <option value="52">Choir Aahs</option>
    <option value="53">Voice Oohs</option>
    <option value="54">Synth Choir</option>
    <option value="55">Orchestra Hit</option>
    <option disabled>Brass</option>
    <option value="56">Trumpet</option>
    <option value="57">Trombone</option>
    <option value="58">Tuba</option>
    <option value="59">Muted Trumpet</option>
    <option value="60">French Horn</option>
    <option value="61">Brass Section</option>
    <option value="62">Synth Brass 1</option>
    <option value="63">Synth Brass 2</option>
    <option disabled>Reed</option>
    <option value="64">Soprano Sax</option>
    <option value="65">Alto Sax</option>
    <option value="66">Tenor Sax</option>
    <option value="67">Baritone Sax</option>
    <option value="68">Oboe</option>
    <option value="69">English Horn</option>
    <option value="70">Bassoon</option>
    <option value="71">Clarinet</option>
    <option disabled>Pipe</option>
    <option value="72">Piccolo</option>
    <option value="73">Flute</option>
    <option value="74">Recorder</option>
    <option value="75">Pan Flute</option>
    <option value="76">Blown Bottle</option>
    <option value="77">Shakuhachi</option>
    <option value="78">Whistle</option>
    <option value="79">Ocarina</option>
    <option disabled>Synth Lead</option>
    <option value="80">Lead 1 (square)</option>
    <option value="81">Lead 2 (sawtooth)</option>
    <option value="82">Lead 3 (calliope)</option>
    <option value="83">Lead 4 (chiff)</option>
    <option value="84">Lead 5 (charang)</option>
    <option value="85">Lead 6 (voice)</option>
    <option value="86">Lead 7 (fifths)</option>
    <option value="87">Lead 8 (bass + lead)</option>
    <option disabled>Synth Pad</option>
    <option value="88">Pad 1 (new age)</option>
    <option value="89">Pad 2 (warm)</option>
    <option value="90">Pad 3 (polysynth)</option>
    <option value="91">Pad 4 (choir)</option>
    <option value="92">Pad 5 (bowed)</option>
    <option value="93">Pad 6 (metallic)</option>
    <option value="94">Pad 7 (halo)</option>
    <option value="95">Pad 8 (sweep)</option>
    <option disabled>Synth Effects</option>
    <option value="96">FX 1 (rain)</option>
    <option value="97">FX 2 (soundtrack)</option>
    <option value="98">FX 3 (crystal)</option>
    <option value="99">FX 4 (atmosphere)</option>
    <option value="100">FX 5 (brightness)</option>
    <option value="101">FX 6 (goblins)</option>
    <option value="102">FX 7 (echoes)</option>
    <option value="103">FX 8 (sci-fi)</option>
    <option disabled>Ethnic</option>
    <option value="104">Sitar</option>
    <option value="105">Banjo</option>
    <option value="106">Shamisen</option>
    <option value="107">Koto</option>
    <option value="108">Kalimba</option>
    <option value="109">Bagpipe</option>
    <option value="110">Fiddle</option>
    <option value="111">Shanai</option>
    <option disabled>Percussive</option>
    <option value="112">Tinkle Bell</option>
    <option value="113">Agogo</option>
    <option value="114">Steel Drums</option>
    <option value="115">Woodblock</option>
    <option value="116">Taiko Drum</option>
    <option value="117">Melodic Tom</option>
    <option value="118">Synth Drum</option>
    <option value="119">Reverse Cymbal</option>
    <option disabled>Sound Effects</option>
    <option value="120">Guitar Fret Noise</option>
    <option value="121">Breath Noise</option>
    <option value="122">Seashore</option>
    <option value="123">Bird Tweet</option>
    <option value="124">Telephone Ring</option>
    <option value="125">Helicopter</option>
    <option value="126">Applause</option>
    <option value="127">Gunshot</option>
  </select>
</template>

<style>
option:disabled {
  background-color: var(--color-accent);
  color: var(--color-background);
  font-weight: bold;
}
</style>
