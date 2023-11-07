<script setup lang="ts"></script>

<template>
  <footer class="footer-container">
    <p style="font-size: 0.7em">Made with ❤️ by Khang Tran</p>
  </footer>
</template>

<style>
.footer-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
  position: absolute;
  bottom: 1em;
  margin: 0 auto;
  width: 100%;
  height: min-content;
  pointer-events: none;
}

.img-github {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 0.9em;
  width: auto;
  pointer-events: initial;
  cursor: pointer;
}
</style>
