<template>
  <div class="config-component-vue combobox-config-vue" :class="{ 'disabled': disabled, 'hovered': isHovered }">
    <div class="config-label-vue" @mouseenter="isHovered = true" @mouseleave="isHovered = false">
      {{ componentLabel }}
    </div>
    <div class="config-actuator-vue combobox-actuator-vue" @mouseenter="isHovered = true" @mouseleave="isHovered = false">
      <div class="combobox-wrapper-vue">
        <select
          :id="id"
          class="combobox-select-vue"
          :value="modelValue"
          @change="handleChange"
          :disabled="disabled"
        >
          <option
            v-for="(item, index) in items"
            :key="index"
            :value="item.payload"
            :id="`${id}-${index}`"
            :disabled="item.disabled"
          >
            {{ item.displayText || (item.displayLocKey ? LOC(item.displayLocKey) : item.payload) }}
          </option>
        </select>
        <div class="combobox-arrow-vue" v-html="arrowIconSVG">
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, PropType } from 'vue';
import { LOC, TLocalisedKey } from '../../localiser';
import { AppIcons } from '../icons'; // Assuming path for AppIcons
import { ComboboxItem } from '../types'; // Import from new types file

let comboboxCounter = 0;

export default defineComponent({
  name: 'Combobox',
  props: {
    modelValue: { // for v-model
      type: [String, Number, Boolean, Object, Array] as PropType<any>,
      required: true,
    },
    label: { // The main label for the config component
      type: String as PropType<TLocalisedKey | string>,
      required: true,
    },
    items: {
      type: Array as PropType<ComboboxItem[]>,
      default: () => [],
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
    const isHovered = ref(false);
    const uniqueId = props.externalId || `ots-vue-combobox-${comboboxCounter++}`;
    const id = computed(() => uniqueId);

    const componentLabel = computed(() => {
      return LOC(props.label as TLocalisedKey) || props.label;
    });

    const handleChange = (event: Event) => {
      const selectedValue = (event.target as HTMLSelectElement).value;
      // Find the original payload type, as select values are always strings
      const selectedItem = props.items.find(item => String(item.payload) === selectedValue);
      if (selectedItem) {
        emit('update:modelValue', selectedItem.payload);
      } else {
        // Fallback for safety, though ideally items always match
        emit('update:modelValue', selectedValue);
      }
    };

    // Directly use the SVG string from AppIcons
    const arrowIconSVG = computed(() => AppIcons.ARROW_DOWN);

    return {
      id,
      isHovered,
      componentLabel,
      handleChange,
      arrowIconSVG,
      LOC, // Make LOC available in template if needed for items directly
    };
  },
});
</script>

<style scoped>
.combobox-config-vue {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
  user-select: none;
}

.config-label-vue {
  flex-grow: 1;
  padding-right: 10px;
  cursor: default;
}

.combobox-actuator-vue {
  position: relative;
  min-width: 150px; /* Example: adjust as needed */
}

.combobox-wrapper-vue {
    position: relative;
    width: 100%;
}

.combobox-select-vue {
  width: 100%;
  padding: 6px 28px 6px 8px; /* Space for arrow */
  border: 1px solid #ccc; /* Example */
  border-radius: 3px; /* Example */
  background-color: #fff; /* Example */
  cursor: pointer;
  appearance: none; /* Remove default system appearance */
  -webkit-appearance: none;
  -moz-appearance: none;
  font-size: inherit; /* Inherit font from parent */
  line-height: inherit; /* Inherit line height */
}

.combobox-select-vue:disabled {
  background-color: #e9e9e9;
  color: #a0a0a0;
  cursor: not-allowed;
  border-color: #c0c0c0;
}

.combobox-arrow-vue {
  position: absolute;
  top: 50%;
  right: 8px;
  transform: translateY(-50%);
  pointer-events: none; /* So it doesn't interfere with select click */
  width: 16px; /* Adjust based on icon size */
  height: 16px; /* Adjust based on icon size */
  fill: #333; /* SVG fill color */
}

.combobox-config-vue.disabled .combobox-arrow-vue {
    fill: #a0a0a0;
}

.combobox-config-vue.hovered:not(.disabled) .combobox-select-vue {
  border-color: #888; /* Example hover */
}

.combobox-config-vue.hovered:not(.disabled) .combobox-arrow-vue {
  fill: #000; /* Example hover arrow */
}

.combobox-config-vue.disabled .config-label-vue {
  color: #aaa;
}
</style>
