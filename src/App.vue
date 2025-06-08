<template>
  <router-view v-slot="{ Component }: { Component: import('vue').Component }">
    <component :is="Component" :appContext="appContext" />
  </router-view>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'; // Removed 'Component as VueComponent'
// Layout is no longer directly used here, router handles it.
// import Layout from './ui/components/Layout.vue';
import { AppContext } from './app_context'; // For appContext prop type

export default defineComponent({
  name: 'App',
  components: {
    // Layout, // No longer a direct component
  },
  props: {
    appContext: {
      type: Object as PropType<AppContext>,
      required: true,
    }
  }
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
