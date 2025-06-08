<template>
  <div class="config-component-vue checkbox-config-vue" :class="{ 'disabled': disabled, 'hovered': isHovered }">
    <div class="config-label-vue" @click="toggleValue" @mouseenter="isHovered = true" @mouseleave="isHovered = false">
      {{ componentLabel }}
    </div>
    <div class="config-actuator-vue">
      <div
        class="checkbox-container-vue"
        :class="{ 'checked': modelValue, 'disabled': disabled }"
        @click="toggleValue"
        @mouseenter="isHovered = true"
        @mouseleave="isHovered = false"
        role="checkbox"
        :aria-checked="modelValue"
        :aria-disabled="disabled"
        tabindex="0"
      >
        <svg
          class="checkbox-pip-vue"
          :style="{ visibility: modelValue ? 'visible' : 'hidden' }"
          width="20" height="20" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
          <path d="M5 12l5 5l10 -10" />
        </svg>
      </div>
      <div class="checkbox-text-vue" @click="toggleValue" @mouseenter="isHovered = true" @mouseleave="isHovered = false">
        {{ currentStatusText }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, PropType } from 'vue';
import { LOC, TLocalisedKey } from '../../localiser';

export default defineComponent({
  name: 'Checkbox',
  props: {
    modelValue: { // for v-model
      type: Boolean,
      required: true,
    },
    label: { // The main label for the config component
      type: String as PropType<TLocalisedKey | string>,
      required: true,
    },
    checkedTextKey: { // Localization key for text when checked
      type: String as PropType<TLocalisedKey>,
      default: 'misc.on' as TLocalisedKey,
    },
    uncheckedTextKey: { // Localization key for text when unchecked
      type: String as PropType<TLocalisedKey>,
      default: 'misc.off' as TLocalisedKey,
    },
    // Allow direct unlocalised text if needed
    checkedUnlocalisedText: {
      type: String,
      default: '',
    },
    uncheckedUnlocalisedText: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const isHovered = ref(false);

    const componentLabel = computed(() => {
      // Check if label is a known TLocalisedKey, otherwise use as is.
      // This is a simplified check; a more robust one might involve checking against a list of keys.
      return LOC(props.label as TLocalisedKey) || props.label;
    });

    const currentStatusText = computed(() => {
      if (props.modelValue) {
        return props.checkedUnlocalisedText || LOC(props.checkedTextKey);
      } else {
        return props.uncheckedUnlocalisedText || LOC(props.uncheckedTextKey);
      }
    });

    const toggleValue = () => {
      if (!props.disabled) {
        emit('update:modelValue', !props.modelValue);
      }
    };

    return {
      isHovered,
      componentLabel,
      currentStatusText,
      toggleValue,
    };
  },
});
</script>

<style scoped>
/* Base styles from ConfigComponent and CheckboxComponent */
.checkbox-config-vue {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
  user-select: none;
}

.config-label-vue {
  /* Styles for the main component label */
  flex-grow: 1;
  padding-right: 10px;
  cursor: default; /* Default cursor for label, clickable parts have pointer */
}

.config-actuator-vue {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.checkbox-container-vue {
  width: 22px;
  height: 22px;
  border: 2px solid #505050; /* Example border */
  background-color: #FFF; /* Example background */
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 8px;
  border-radius: 3px; /* Example */
  transition: background-color 0.2s, border-color 0.2s;
}

.checkbox-container-vue.checked {
  background-color: #76a8ce; /* Example checked background */
  border-color: #5a8db3; /* Example checked border */
}

.checkbox-container-vue.disabled {
  background-color: #e0e0e0;
  border-color: #c0c0c0;
  cursor: not-allowed;
}

.checkbox-container-vue.disabled.checked {
  background-color: #b0b0b0; /* Darker disabled checked state */
}

.checkbox-pip-vue {
  stroke: white; /* Pip color when checked */
  visibility: hidden; /* Handled by inline style based on modelValue */
}

.checkbox-config-vue.hovered .checkbox-container-vue:not(.disabled) {
  border-color: #333; /* Example hover border */
}

.checkbox-text-vue {
  /* Styles for the checked/unchecked status text */
  color: #333; /* Example text color */
}

.checkbox-config-vue.disabled .config-label-vue,
.checkbox-config-vue.disabled .checkbox-text-vue {
  color: #aaa; /* Dim text when disabled */
}

.checkbox-config-vue.disabled .config-actuator-vue {
    cursor: not-allowed;
}
</style>
