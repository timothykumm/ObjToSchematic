<template>
  <div class="container-button-vue">
    <div
      :id="id"
      class="struct-prop button-vue"
      :class="{
        'button-loading': isLoading,
        'disabled': disabled,
      }"
      @click="handleClick"
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false"
      :aria-disabled="disabled"
      role="button"
      tabindex="0"
    >
      <div :id="labelId" class="button-label-vue">{{ currentLabel }}</div>
      <div :id="progressId" class="button-progress-vue" :style="{ width: progress + '%' }"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, toRefs, watch, PropType } from 'vue'; // Added PropType
import { TLocalisedString, LOC, TLocalisedKey } from '../../localiser'; // Assuming path, Added LOC, TLocalisedKey
import { UIUtil } from '../../util/ui_util'; // For generating unique IDs, if needed

let buttonCounter = 0;

export default defineComponent({
  name: 'Button',
  props: {
    label: {
      type: String as PropType<TLocalisedString | string>, // Corrected type
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
    progress: {
      type: Number,
      default: 0,
    },
    externalId: {
        type: String,
        default: '',
    }
  },
  emits: ['click'],
  setup(props, { emit }) {
    const { label: rawLabel, disabled, isLoading, progress, externalId } = toRefs(props);

    const uniqueId = externalId.value || `ots-vue-button-${buttonCounter++}`;
    const id = computed(() => uniqueId);
    const labelId = computed(() => `${uniqueId}-button-label`);
    const progressId = computed(() => `${uniqueId}-button-progress`);

    const isHovered = ref(false);

    const currentLabel = computed(() => {
        // Check if rawLabel.value is potentially a TLocalisedKey
        // This simple check assumes keys contain '.' and non-keys don't,
        // or relies on LOC to return the key itself if not found.
        return LOC(rawLabel.value as TLocalisedKey) || rawLabel.value;
    });

    const handleClick = () => {
      if (!disabled.value && !isLoading.value) {
        emit('click');
      }
    };

    return {
      id,
      labelId,
      progressId,
      isHovered,
      currentLabel,
      handleClick,
    };
  },
});
</script>

<style scoped>
.container-button-vue {
  padding: 5px 0px;
}

.button-vue {
  position: relative;
  background-color: #d1d1d1;
  border: 1px solid #b0b0b0;
  padding: 8px 12px;
  text-align: center;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s ease;
  border-radius: 3px;
}

.button-vue:hover {
  background-color: #e0e0e0;
}

.button-vue.disabled {
  background-color: #e9e9e9;
  color: #a0a0a0;
  cursor: not-allowed;
  border-color: #c0c0c0;
}

.button-vue.disabled:hover {
  background-color: #e9e9e9;
}

.button-label-vue {
  /* Styles for button label */
}

.button-progress-vue {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  background-color: #76a8ce;
  transition: width 0.1s linear;
  z-index: 1;
  opacity: 0.5;
}

.button-vue.button-loading .button-label-vue {
   color: transparent;
}

.button-vue.button-loading .button-progress-vue {
  opacity: 1;
}

.button-label-vue {
    position: relative;
    z-index: 2;
}
</style>
