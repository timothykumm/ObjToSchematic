<template>
  <router-view />
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'App'
});
</script>

<style>
/* Global styles that were in template.html or styles.css can go here */
/* Or be imported from an external CSS file */
body {
  margin: 0;
  font-family: sans-serif; /* Example font */
  height: 100vh;
  width: 100vw;
  overflow: hidden; /* Prevent body scrolling, layout panes handle their own */
}

/* Ensure #app div takes full screen if it's the mount point */
#app {
  height: 100%;
  width: 100%;
}

/* Add any other critical global styles from the original project */
/* For example, box-sizing: border-box; if it was used */
*, *::before, *::after {
  box-sizing: border-box;
}
</style>
