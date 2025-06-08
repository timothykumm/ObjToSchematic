<template>
  <div class="config-component-vue palette-config-vue" :class="{ 'disabled': disabled }">
    <div class="config-label-vue">
      {{ componentLabel }}
    </div>
    <div class="config-actuator-vue palette-actuator-vue">
      <div class="palette-controls-vue">
        <input
          type="text"
          class="palette-search-vue struct-prop-vue"
          :placeholder="LOC('assign.components.search')"
          v-model="searchText"
          :disabled="disabled"
        />
        <div class="palette-buttons-vue">
          <Button
            :label="LOC('assign.components.palette_import') || 'Import'"
            @click="handleImport"
            :disabled="disabled || true"
            title="Import currently disabled"
          />
          <Button
            :label="LOC('assign.components.palette_export') || 'Export'"
            @click="handleExport"
            :disabled="disabled || true"
            title="Export currently disabled"
          />
          <Button
            :label="LOC('assign.components.palette_select_all') || 'Select All'"
            @click="selectAll"
            :disabled="disabled || allSelected"
          />
          <Button
            :label="LOC('assign.components.palette_deselect_all') || 'Deselect All'"
            @click="deselectAll"
            :disabled="disabled || noneSelected"
          />
        </div>
      </div>
      <div class="palette-list-container-vue">
        <div v-for="block in filteredBlocks" :key="block" class="palette-item-vue">
          <Checkbox
            :modelValue="isSelected(block)"
            @update:modelValue="toggleBlock(block, $event)"
            :label="block"
            :checkedUnlocalisedText="block"
            :uncheckedUnlocalisedText="block"
            :disabled="disabled"
            class="palette-checkbox-vue"
          />
        </div>
         <div v-if="filteredBlocks.length === 0 && searchText.length > 0" class="no-results-vue">
            {{ LOC('assign.components.palette_no_results') || 'No blocks found.' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, PropType, watch } from 'vue';
import { PALETTE_ALL_RELEASE } from '../../../res/palettes/all'; // Path to the block list
import { LOC, TLocalisedKey } from '../../localiser';
import Checkbox from './Checkbox.vue';
import Button from './Button.vue';

export default defineComponent({
  name: 'PaletteDisplay',
  components: { Checkbox, Button },
  props: {
    modelValue: { // Array of selected block names (string[])
      type: Array as PropType<string[]>,
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
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const searchText = ref('');
    const allBlocks = ref<string[]>(PALETTE_ALL_RELEASE); // Reactive ref for the full list

    const componentLabel = computed(() => LOC(props.label as TLocalisedKey) || props.label);

    const filteredBlocks = computed(() => {
      if (!searchText.value) {
        return allBlocks.value;
      }
      const lowerSearch = searchText.value.toLowerCase();
      const spaceSearch = lowerSearch.replace(/_/g, ' ');
      return allBlocks.value.filter(block =>
        block.toLowerCase().includes(lowerSearch) ||
        block.toLowerCase().replace(/_/g, ' ').includes(spaceSearch)
      );
    });

    const isSelected = (blockName: string): boolean => {
      return props.modelValue.includes(blockName);
    };

    const toggleBlock = (blockName: string, isSelected: boolean) => {
      if (props.disabled) return;
      const currentSelection = new Set(props.modelValue);
      if (isSelected) {
        currentSelection.add(blockName);
      } else {
        currentSelection.delete(blockName);
      }
      emit('update:modelValue', Array.from(currentSelection));
    };

    const selectAll = () => {
      if (props.disabled) return;
      // Select all from the currently filtered list, or all blocks if no filter
      // For simplicity and matching original behavior, selectAll affects ALL blocks, not just filtered.
      emit('update:modelValue', [...allBlocks.value]);
    };

    const deselectAll = () => {
      if (props.disabled) return;
      emit('update:modelValue', []);
    };

    const allSelected = computed(() => props.modelValue.length === allBlocks.value.length);
    const noneSelected = computed(() => props.modelValue.length === 0);

    const handleImport = () => {
      // Deferred: Implement file reading and parsing
      alert('Import functionality is not yet implemented.');
    };

    const handleExport = () => {
      // Deferred: Implement text file generation and download
      alert('Export functionality is not yet implemented.');
    };

    return {
      searchText,
      componentLabel,
      filteredBlocks,
      isSelected,
      toggleBlock,
      selectAll,
      deselectAll,
      allSelected,
      noneSelected,
      handleImport,
      handleExport,
      LOC,
    };
  },
});
</script>

<style scoped>
.palette-config-vue {
  display: flex;
  flex-direction: column; /* Stack label and actuator vertically */
  align-items: stretch; /* Make children take full width */
  padding: 5px 0;
  user-select: none;
}

.config-label-vue {
  margin-bottom: 8px; /* Space between main label and controls */
  font-weight: bold;
  text-align: left; /* Align label to the left */
}

.palette-actuator-vue {
  /* Container for controls and list */
}

.palette-controls-vue {
  display: flex;
  flex-wrap: wrap; /* Allow controls to wrap on smaller screens */
  gap: 10px;
  margin-bottom: 8px;
  align-items: center;
}

.palette-search-vue {
  flex-grow: 1; /* Search takes available space */
  min-width: 150px; /* Minimum width for search */
  padding: 6px 8px;
  border: 1px solid #ccc;
  border-radius: 3px;
}

.palette-buttons-vue {
  display: flex;
  gap: 8px; /* Space between buttons */
  flex-wrap: nowrap; /* Keep buttons on one line if possible */
}
/* Ensure buttons don't shrink too much */
.palette-buttons-vue >>> .button-vue {
    flex-shrink: 0;
}


.palette-list-container-vue {
  max-height: 200px; /* Fixed height for scrollable list */
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 3px;
  padding: 8px;
  background-color: #fff;
}

.palette-item-vue {
  /* Individual item styling if needed, Checkbox takes care of most */
}

/* Styling for Checkbox.vue when used in palette */
.palette-checkbox-vue >>> .config-component-vue {
    padding: 2px 0; /* Compact padding */
}
.palette-checkbox-vue >>> .config-label-vue {
    font-weight: normal; /* Normal font for block names */
    flex-grow: 0; /* Don't let label take space from checkbox text */
    display: none; /* Hide the main label of the checkbox, using its status text as label */
}
.palette-checkbox-vue >>> .checkbox-text-vue {
    margin-left: 4px; /* Space between checkbox and its text */
}

.no-results-vue {
    padding: 10px;
    text-align: center;
    color: #666;
    font-style: italic;
}

.palette-config-vue.disabled .config-label-vue,
.palette-config-vue.disabled .palette-search-vue {
  color: #aaa;
}
.palette-config-vue.disabled .palette-list-container-vue {
  background-color: #f5f5f5;
  border-color: #e0e0e0;
}
</style>
