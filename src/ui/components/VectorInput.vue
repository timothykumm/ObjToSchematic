<template>
  <div class="config-component-vue vector-input-config-vue" :class="{ 'disabled': disabled }">
    <div class="config-label-vue">
      {{ componentLabel }}
    </div>
    <div class="config-actuator-vue vector-actuator-vue">
      <div class="spinbox-main-container-vue">
        <div class="spinbox-element-container-vue">
          <div
            :id="id + '-kx'"
            class="spinbox-key-vue"
            :class="{ 'hovered': hoveredAxis === 'x' && !disabled }"
            @mouseenter="onAxisEnter('x')"
            @mouseleave="onAxisLeave('x')"
          >X</div>
          <input
            type="number"
            class="spinbox-value-vue struct-prop-vue"
            :min="min"
            :max="max"
            :step="step"
            :value="modelValue.x"
            @change="updateValue('x', $event)"
            @mouseenter="onAxisEnter('x')"
            @mouseleave="onAxisLeave('x')"
            :disabled="disabled"
            :id="id + '-vx'"
          />
        </div>
        <div v-if="showY" class="spinbox-element-container-vue">
          <div
            :id="id + '-ky'"
            class="spinbox-key-vue"
            :class="{ 'hovered': hoveredAxis === 'y' && !disabled }"
            @mouseenter="onAxisEnter('y')"
            @mouseleave="onAxisLeave('y')"
          >Y</div>
          <input
            type="number"
            class="spinbox-value-vue struct-prop-vue"
            :min="min"
            :max="max"
            :step="step"
            :value="modelValue.y"
            @change="updateValue('y', $event)"
            @mouseenter="onAxisEnter('y')"
            @mouseleave="onAxisLeave('y')"
            :disabled="disabled"
            :id="id + '-vy'"
          />
        </div>
        <div class="spinbox-element-container-vue">
          <div
            :id="id + '-kz'"
            class="spinbox-key-vue"
            :class="{ 'hovered': hoveredAxis === 'z' && !disabled }"
            @mouseenter="onAxisEnter('z')"
            @mouseleave="onAxisLeave('z')"
          >Z</div>
          <input
            type="number"
            class="spinbox-value-vue struct-prop-vue"
            :min="min"
            :max="max"
            :step="step"
            :value="modelValue.z"
            @change="updateValue('z', $event)"
            @mouseenter="onAxisEnter('z')"
            @mouseleave="onAxisLeave('z')"
            :disabled="disabled"
            :id="id + '-vz'"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, PropType } from 'vue';
import { LOC, TLocalisedKey } from '../../localiser';
import { TAxis } from '../../util/type_util'; // Assuming path
import { Vector3Value } from '../types'; // Import from new types file

let vectorInputCounter = 0;

export default defineComponent({
  name: 'VectorInput',
  props: {
    modelValue: {
      type: Object as PropType<Vector3Value>,
      required: true,
      default: () => ({ x: 0, y: 0, z: 0 }) // Default if not provided by parent
    },
    label: {
      type: String as PropType<TLocalisedKey | string>,
      required: true,
    },
    showY: {
      type: Boolean,
      default: true,
    },
    min: {
      type: Number,
      default: -360, // Default from original
    },
    max: {
      type: Number,
      default: 360, // Default from original
    },
    step: { // Step for number inputs
      type: Number,
      default: 1,
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
  emits: ['update:modelValue', 'axisHover'], // axisHover emits { axis: TAxis, state: 'enter' | 'exit' }
  setup(props, { emit }) {
    const uniqueId = props.externalId || `ots-vue-vectorinput-${vectorInputCounter++}`;
    const id = computed(() => uniqueId);
    const hoveredAxis = ref<TAxis | null>(null);

    const componentLabel = computed(() => LOC(props.label as TLocalisedKey) || props.label);

    const updateValue = (axis: TAxis, event: Event) => {
      if (props.disabled) return;
      const rawValue = (event.target as HTMLInputElement).value;
      const parsedValue = parseFloat(rawValue);
      if (!isNaN(parsedValue)) {
        const clampedValue = Math.max(props.min, Math.min(props.max, parsedValue));
        const newValue = { ...props.modelValue, [axis]: clampedValue };
        emit('update:modelValue', newValue);
      }
    };

    const onAxisEnter = (axis: TAxis) => {
        if (props.disabled) return;
        hoveredAxis.value = axis;
        emit('axisHover', { axis, state: 'enter' });
    };

    const onAxisLeave = (axis: TAxis) => {
        if (props.disabled) return;
        if (hoveredAxis.value === axis) {
            hoveredAxis.value = null;
        }
        emit('axisHover', { axis, state: 'exit' });
    };

    return {
      id,
      componentLabel,
      hoveredAxis,
      updateValue,
      onAxisEnter,
      onAxisLeave,
    };
  },
});
</script>

<style scoped>
.vector-input-config-vue {
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

.vector-actuator-vue {
  /* Container for the spinbox elements */
}

.spinbox-main-container-vue {
  display: flex;
  gap: 5px; /* Space between X, Y, Z inputs */
}

.spinbox-element-container-vue {
  display: flex;
  align-items: center;
  border: 1px solid #ccc; /* Example border around each X/Y/Z */
  border-radius: 3px;
  overflow: hidden; /* To keep key and value contained */
}

.spinbox-key-vue {
  padding: 4px 8px;
  background-color: #e9e9e9; /* Example background for X/Y/Z label */
  font-weight: bold;
  user-select: none;
  transition: background-color 0.2s;
}

.spinbox-key-vue.hovered {
    background-color: #d0d0d0; /* Example hover for X/Y/Z label */
}

.spinbox-value-vue {
  width: 50px; /* Adjust as needed */
  padding: 4px;
  border: none; /* Border is on container */
  text-align: right;
  /* Remove spinners from number input for cleaner look if desired */
  -moz-appearance: textfield;
}
.spinbox-value-vue::-webkit-outer-spin-button,
.spinbox-value-vue::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.spinbox-value-vue:disabled {
    background-color: #f8f8f8; /* Slightly different disabled background for input */
    color: #a0a0a0;
    cursor: not-allowed;
}
.spinbox-element-container-vue:has(input:disabled) .spinbox-key-vue {
    background-color: #f0f0f0;
    color: #b0b0b0;
}
.spinbox-element-container-vue:has(input:disabled) .spinbox-key-vue.hovered {
    background-color: #f0f0f0; /* No hover effect when disabled */
}


.vector-input-config-vue.disabled .config-label-vue {
  color: #aaa;
}
</style>
