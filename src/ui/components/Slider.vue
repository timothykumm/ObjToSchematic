<template>
  <div class="config-component-vue slider-config-vue" :class="{ 'disabled': disabled }">
    <div class="config-label-vue">
      {{ componentLabel }}
    </div>
    <div class="config-actuator-vue slider-actuator-vue">
      <input
        :id="id + '-value'"
        class="slider-value-input-vue"
        type="number"
        :min="min"
        :max="max"
        :step="step"
        :value="currentValue"
        @change="handleTextInput"
        :disabled="disabled"
      />
      <div class="slider-bar-container-vue"
        @mousedown="handleMouseDown"
        @wheel.prevent="handleWheelScroll"
        ref="sliderBarContainerRef"
      >
        <div
          :id="id + '-bar'"
          class="slider-bar-inner-vue"
          :style="{ width: barWidthPercentage + '%' }"
        ></div>
         <div
            class="slider-thumb-vue"
            :style="{ left: barWidthPercentage + '%' }"
         ></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, onMounted, onBeforeUnmount, PropType } from 'vue';
import { LOC, TLocalisedKey } from '../../localiser';
import { clamp, mapRange, roundToNearest } from '../../math'; // Assuming roundToNearest exists or can be added

let sliderCounter = 0;

export default defineComponent({
  name: 'Slider',
  props: {
    modelValue: { // for v-model
      type: Number,
      required: true,
    },
    label: {
      type: String as PropType<TLocalisedKey | string>,
      required: true,
    },
    min: {
      type: Number,
      default: 0,
    },
    max: {
      type: Number,
      default: 100,
    },
    step: {
      type: Number,
      default: 1,
    },
    decimals: { // Number of decimal places for display and rounding
      type: Number,
      default: 0,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    externalId: {
        type: String,
        default: '',
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const uniqueId = props.externalId || `ots-vue-slider-${sliderCounter++}`;
    const id = computed(() => uniqueId);
    const sliderBarContainerRef = ref<HTMLDivElement | null>(null);
    const isDragging = ref(false);

    // Internal value to allow for intermediate drag/scroll states if needed,
    // though direct emit might be fine for simpler cases.
    const currentValue = ref(props.modelValue);

    const componentLabel = computed(() => LOC(props.label as TLocalisedKey) || props.label);

    const barWidthPercentage = computed(() => {
      const range = props.max - props.min;
      if (range === 0) return 0;
      return ((currentValue.value - props.min) / range) * 100;
    });

    const formatValue = (val: number): number => {
        const factor = Math.pow(10, props.decimals);
        let roundedVal = Math.round(val * factor) / factor;
        // Ensure value is a multiple of step, after decimal rounding
        if (props.step !== 0) {
             // Adjust for floating point inaccuracies with modulo on decimals
            const stepFactor = Math.pow(10, props.decimals);
            const scaledStep = props.step * stepFactor;
            const scaledVal = Math.round(roundedVal * stepFactor); // Use Math.round to avoid float issues
            roundedVal = (Math.round(scaledVal / scaledStep) * scaledStep) / stepFactor;
        }
        return clamp(roundedVal, props.min, props.max);
    };

    watch(() => props.modelValue, (newVal) => {
      currentValue.value = formatValue(newVal);
    }, { immediate: true });

    const updateValue = (newValue: number) => {
      const formatted = formatValue(newValue);
      if (currentValue.value !== formatted) {
        currentValue.value = formatted;
        emit('update:modelValue', formatted);
      }
    };

    const handleTextInput = (event: Event) => {
      const inputVal = parseFloat((event.target as HTMLInputElement).value);
      updateValue(inputVal);
    };

    const updateValueFromMouseEvent = (event: MouseEvent) => {
        if (!sliderBarContainerRef.value || props.disabled) return;
        const rect = sliderBarContainerRef.value.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const width = rect.width;
        const rawValue = mapRange(x, 0, width, props.min, props.max);
        updateValue(rawValue);
    };

    const handleMouseDown = (event: MouseEvent) => {
        if (props.disabled) return;
        isDragging.value = true;
        updateValueFromMouseEvent(event);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (event: MouseEvent) => {
        if (!isDragging.value || props.disabled) return;
        updateValueFromMouseEvent(event);
    };

    const handleMouseUp = () => {
        isDragging.value = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };

    const handleWheelScroll = (event: WheelEvent) => {
        if (props.disabled || !sliderBarContainerRef.value?.contains(event.target as Node)) return;
        const delta = -event.deltaY; // Standardize scroll direction
        const scrollAmount = (delta > 0 ? 1 : -1) * props.step;
        updateValue(currentValue.value + scrollAmount);
    };

    onMounted(() => {
        currentValue.value = formatValue(props.modelValue);
    });

    onBeforeUnmount(() => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    });

    return {
      id,
      componentLabel,
      currentValue, // Use this for display in number input
      barWidthPercentage,
      handleTextInput,
      sliderBarContainerRef,
      handleMouseDown,
      handleWheelScroll,
    };
  },
});
</script>

<style scoped>
.slider-config-vue {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
}

.config-label-vue {
  flex-grow: 1;
  padding-right: 10px;
  user-select: none;
}

.slider-actuator-vue {
  display: flex;
  align-items: center;
  width: 60%; /* Adjust as needed */
  max-width: 250px; /* Adjust as needed */
}

.slider-value-input-vue {
  width: 60px; /* Adjust as needed */
  margin-right: 10px;
  padding: 4px;
  border: 1px solid #ccc;
  border-radius: 3px;
  text-align: right;
}

.slider-value-input-vue:disabled {
    background-color: #e9e9e9;
    color: #a0a0a0;
    cursor: not-allowed;
}

.slider-bar-container-vue {
  flex-grow: 1;
  height: 10px; /* Height of the track */
  background-color: #ddd; /* Track color */
  border-radius: 5px;
  position: relative;
  cursor: pointer;
}

.slider-bar-inner-vue {
  height: 100%;
  background-color: #76a8ce; /* Active part of track color */
  border-radius: 5px;
  position: absolute;
  left:0;
  top:0;
}

.slider-thumb-vue {
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 16px; /* Thumb size */
    height: 16px; /* Thumb size */
    background-color: #5a8db3; /* Thumb color */
    border-radius: 50%;
    border: 2px solid white;
    box-shadow: 0 1px 2px rgba(0,0,0,0.3);
    pointer-events: none; /* So it doesn't interfere with bar clicks */
}

.slider-config-vue.disabled .config-label-vue {
  color: #aaa;
}

.slider-config-vue.disabled .slider-bar-container-vue {
  background-color: #e9e9e9;
  cursor: not-allowed;
}

.slider-config-vue.disabled .slider-bar-inner-vue {
  background-color: #c0c0c0;
}
.slider-config-vue.disabled .slider-thumb-vue {
  background-color: #b0b0b0;
}
</style>
