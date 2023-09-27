<script setup lang="ts">
import { ref, watch } from 'vue'
const localDag = localStorage.getItem('dag')
const dag = ref<string>(localDag ? localDag : 'strictdagprimeforte')

const $emit = defineEmits(['useLocalOrFetchAndCreateDag'])

watch(dag, () => {
  $emit('useLocalOrFetchAndCreateDag', dag.value)
  localStorage.setItem('dag', dag.value)
})
</script>

<template>
  <label class="switch" for="switchDagButton">Graph Type: </label>
  <select id="switchDagButton" name="switchDagButton" v-model="dag">
    <option value="strictdagprimeforte">Strictly-Increasing Graph</option>
    <option value="cardinaldagprimeforte">Cardinality Growth Graph</option>
  </select>
</template>

<style></style>
