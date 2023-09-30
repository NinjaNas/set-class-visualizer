<script setup lang="ts"></script>

<template>
  <a @click="$emit('openModal')" class="hamburger-button"></a>
</template>

<style>
.hamburger-button:before {
  content: '🎹';
  position: absolute;
  bottom: 10px;
  left: 10px;
  font-size: 1em;
  padding: 4px;
  border: 1px solid var(--color-accent);
  border-radius: 5px;
  background-color: transparent;
  text-align: center;
  cursor: pointer;
}

.hamburger-button:hover:before {
  background-color: var(--color-hover);
}
</style>
