<template>
  <div class="config-component-vue colour-picker-config-vue" :class="{ 'disabled': disabled }">
    <div class="config-label-vue">
      {{ componentLabel }}
    </div>
    <div class="config-actuator-vue">
      <input
        type="color"
        class="colour-swatch-vue"
        :id="id"
        :value="hexColor"
        @input="updateColorFromPicker"
        :disabled="disabled"
      />
      <input
        type="text"
        class="hex-input-vue"
        :value="hexColor.toUpperCase()"
        @change="updateColorFromHexInput"
        :disabled="disabled"
        maxlength="7"
        pattern="#[0-9a-fA-F]{6}"
        placeholder="#RRGGBB"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue';
import { RGBA, RGBAUtil } from '../../colour'; // Assuming path
import { LOC, TLocalisedKey } from '../../localiser';

let colourPickerCounter = 0;

export default defineComponent({
  name: 'ColourPicker',
  props: {
    modelValue: { // RGBA object for v-model
      type: Object as PropType<RGBA>,
      required: true,
    },
    label: {
      type: String as PropType<TLocalisedKey | string>,
      required: true,
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
    const uniqueId = props.externalId || `ots-vue-colourpicker-${colourPickerCounter++}`;
    const id = computed(() => uniqueId);

    const componentLabel = computed(() => LOC(props.label as TLocalisedKey) || props.label);

    const hexColor = computed(() => RGBAUtil.toHexString(props.modelValue).substring(0, 7)); // Keep only #RRGGBB for picker

    const updateColorFromPicker = (event: Event) => {
      if (props.disabled) return;
      const newHex = (event.target as HTMLInputElement).value;
      const parsedColour = RGBAUtil.fromHexString(newHex); // Gets {r,g,b, a:1.0}
      // Preserve original alpha
      const finalColour: RGBA = { ...parsedColour, a: props.modelValue.a };
      emit('update:modelValue', finalColour);
    };

    const updateColorFromHexInput = (event: Event) => {
        if (props.disabled) return;
        let newHex = (event.target as HTMLInputElement).value;
        if (!newHex.startsWith('#')) {
            newHex = '#' + newHex;
        }
        if (/^#[0-9a-fA-F]{6}$/.test(newHex)) {
            const parsedColour = RGBAUtil.fromHexString(newHex);
            // Preserve original alpha
            const finalColour: RGBA = { ...parsedColour, a: props.modelValue.a };
            emit('update:modelValue', finalColour);
        } else {
            // Reset input to current valid color if invalid
            (event.target as HTMLInputElement).value = hexColor.value.toUpperCase();
        }
    };

    return {
      id,
      componentLabel,
      hexColor,
      updateColorFromPicker,
      updateColorFromHexInput,
    };
  },
});
</script>

<style scoped>
.colour-picker-config-vue {
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

.config-actuator-vue {
  display: flex;
  align-items: center;
  gap: 8px; /* Space between color swatch and hex input */
}

.colour-swatch-vue {
  width: 36px; /* Adjust as needed */
  height: 24px; /* Adjust as needed */
  border: 1px solid #ccc;
  border-radius: 3px;
  cursor: pointer;
  padding: 0; /* Remove default padding for color input */
}
.colour-swatch-vue::-webkit-color-swatch-wrapper {
    padding: 0;
}
.colour-swatch-vue::-webkit-color-swatch {
    border: none;
    border-radius: 2px; /* Slightly smaller radius for swatch itself */
}
/* For Firefox */
.colour-swatch-vue::-moz-color-swatch {
    border: none;
    border-radius: 2px;
}


.colour-swatch-vue:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.hex-input-vue {
    font-family: monospace;
    width: 70px; /* #RRGGBB */
    padding: 4px 6px;
    border: 1px solid #ccc;
    border-radius: 3px;
}

.hex-input-vue:disabled {
    background-color: #e9e9e9;
    color: #a0a0a0;
    cursor: not-allowed;
}

.colour-picker-config-vue.disabled .config-label-vue {
  color: #aaa;
}
</style>
