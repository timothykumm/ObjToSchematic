<template>
  <div class="config-component-vue material-type-config-vue" :class="{ 'disabled': disabled }">
    <div class="config-label-vue">
      {{ componentLabel }}
    </div>
    <div class="config-actuator-vue material-type-actuator-vue">
      <div class="toolbar-group-vue material-type-buttons">
        <Button
          :label="LOC('materials.components.solid')"
          :class="{ 'active': modelValue === MaterialType.solid }"
          :disabled="disabled"
          @click="selectType(MaterialType.solid)"
          :external-id="id + '-solid-btn'"
        >
          <!-- Slot for icon if Button.vue supports it, or use text/css background -->
          <!-- For now, text label is primary. Icon can be added to Button.vue later. -->
        </Button>
        <Button
          :label="LOC('materials.components.textured')"
          :class="{ 'active': modelValue === MaterialType.textured }"
          :disabled="disabled || !canBeTextured"
          @click="selectType(MaterialType.textured)"
          :external-id="id + '-textured-btn'"
        >
          <!-- Icon placeholder -->
        </Button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue';
import { LOC, TLocalisedKey } from '../../localiser';
import { MaterialType } from '../../mesh'; // Assuming path
import Button from './Button.vue'; // Using our Button.vue

let materialTypeSwitcherCounter = 0;

export default defineComponent({
  name: 'MaterialTypeSwitcher',
  components: { Button },
  props: {
    modelValue: { // MaterialType enum for v-model
      type: Number as PropType<MaterialType>, // Enums are numbers
      required: true,
    },
    label: {
      type: String as PropType<TLocalisedKey | string>,
      required: true,
    },
    canBeTextured: { // From original: material.canBeTextured
      type: Boolean,
      default: true, // Assume it can be textured unless specified
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
  emits: ['update:modelValue', 'changeTypeRequested'], // changeTypeRequested if parent needs to handle type change logic
  setup(props, { emit }) {
    const uniqueId = props.externalId || `ots-vue-materialtype-${materialTypeSwitcherCounter++}`;
    const id = computed(() => uniqueId);

    const componentLabel = computed(() => LOC(props.label as TLocalisedKey) || props.label);

    const selectType = (type: MaterialType) => {
      if (props.disabled) return;
      if (type === MaterialType.textured && !props.canBeTextured) return;

      if (props.modelValue !== type) {
        // Emit an event that parent (MaterialItem) can listen to,
        // to then trigger its _onChangeTypeDelegate.
        // The parent will then update the material's type and the v-model here.
        emit('changeTypeRequested', type);
      }
    };

    return {
      id,
      componentLabel,
      selectType,
      MaterialType, // Make enum available in template
      LOC,
    };
  },
});
</script>

<style scoped>
.material-type-config-vue {
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

.material-type-actuator-vue {
  /* Container for the button group */
}

.toolbar-group-vue.material-type-buttons {
  display: flex;
  gap: 0; /* No gap, buttons should look like a segmented control */
  border-radius: 3px; /* Overall radius for the group */
  overflow: hidden; /* To make children conform to border-radius */
  border: 1px solid #b0b0b0; /* Border around the group */
}

/* Styling for Button.vue when used in this segmented control context */
.toolbar-group-vue.material-type-buttons >>> .container-button-vue {
    padding: 0; /* Remove default padding from Button.vue's container */
}

.toolbar-group-vue.material-type-buttons >>> .button-vue {
  border-radius: 0; /* Remove individual button radius */
  border: none; /* Remove individual button borders, group has one */
  padding: 6px 10px; /* Adjust padding as needed */
  background-color: #e0e0e0; /* Default non-active background */
}

.toolbar-group-vue.material-type-buttons >>> .button-vue:not(:last-child) {
  border-right: 1px solid #b0b0b0; /* Separator */
}

.toolbar-group-vue.material-type-buttons >>> .button-vue.active {
  background-color: #76a8ce; /* Active background */
  color: white;
}

.toolbar-group-vue.material-type-buttons >>> .button-vue:hover:not(.active):not(.disabled) {
  background-color: #d0d0d0; /* Hover for non-active */
}

.toolbar-group-vue.material-type-buttons >>> .button-vue.disabled {
  background-color: #f0f0f0;
  color: #aaa;
}

.toolbar-group-vue.material-type-buttons >>> .button-vue.disabled.active {
  background-color: #c0c0c0; /* Disabled but active state */
}


.material-type-config-vue.disabled .config-label-vue {
  color: #aaa;
}
</style>
