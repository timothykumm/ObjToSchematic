<template>
  <div class="placeholder-info-vue">
    <i>{{ displayText }}</i>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue';
import { LOC, TLocalisedKey } from '../../localiser'; // Assuming path

export default defineComponent({
  name: 'PlaceholderInfo',
  props: {
    textKey: { // Localization key
      type: String as PropType<TLocalisedKey>,
      default: '',
    },
    text: { // Direct unlocalised text
      type: String,
      default: '',
    },
  },
  setup(props) {
    const displayText = computed(() => {
      if (props.textKey) {
        return LOC(props.textKey);
      }
      return props.text;
    });

    return {
      displayText,
    };
  },
});
</script>

<style scoped>
.placeholder-info-vue {
  /* Based on .property with justify-content: center */
  display: flex;
  justify-content: center;
  align-items: center; /* Vertically center if height is defined by parent */
  padding: 8px 0; /* var(--property-height) was mentioned, assuming padding for now */
  color: #6c757d; /* text-dark equivalent */
  font-style: italic; /* As per <i> tag in original */
  text-align: center; /* Ensure text is centered if it wraps */
  width: 100%; /* Take full width of its container */
}
</style>
