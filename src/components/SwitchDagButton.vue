<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
const localDag = localStorage.getItem('dag')
const dag = ref<string>(localDag ? localDag : 'vectororiginaldag')

const $emit = defineEmits(['fetchAndCreateDag'])

watch(dag, () => {
  $emit('fetchAndCreateDag', dag.value)
  localStorage.setItem('dag', dag.value)
})

onMounted(() => {
  $emit('fetchAndCreateDag', dag.value)
  localStorage.setItem('dag', dag.value)
})
</script>

<template>
  <label class="switch" for="switchDagButton">Graph Type: </label>
  <select id="switchDagButton" name="switchDagButton" v-model="dag">
    <option value="strictoriginaldag">Strictly-Increasing</option>
    <option value="cardinaloriginaldag">Cardinality-Increasing</option>
    <option value="vectororiginaldag">Vector-Similarity</option>
    <option value="strictinversiondag">Strictly-Increasing w/ Inversions</option>
    <option value="cardinalinversiondag">Cardinality-Increasing w/ Inversions</option>
    <option value="vectorinversiondag">Vector-Similarity w/ Inversions</option>
  </select>
</template>

<style></style>
