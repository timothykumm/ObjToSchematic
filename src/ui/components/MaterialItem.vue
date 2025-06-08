<template>
  <div class="material-item-vue config-component-vue" :class="{ 'disabled': disabled }">
    <div class="material-header-vue config-label-vue" @click="toggleExpanded">
      <span>{{ materialName }}</span>
      <span class="expander-icon-vue">{{ isExpanded ? '▼' : '►' }}</span>
    </div>

    <div v-if="isExpanded" class="material-details-vue config-actuator-vue">
      <MaterialTypeSwitcher
        label="materials.components.material_type"
        :modelValue="material.type"
        :canBeTextured="material.canBeTextured !== false"
        @changeTypeRequested="onChangeType"
        :disabled="disabled"
      />

      <!-- Solid Material Controls -->
      <template v-if="material.type === MaterialType.solid">
        <ColourPicker
          label="voxelise.components.colour"
          :modelValue="material.colour"
          @update:modelValue="updateMaterialProp('colour', $event)"
          :disabled="disabled"
        />
        <Slider
          label="materials.components.alpha"
          :modelValue="material.colour.a"
          @update:modelValue="updateAlpha($event)"
          :min="0" :max="1" :step="0.01" :decimals="2"
          :disabled="disabled"
        />
      </template>

      <!-- Textured Material Controls -->
      <template v-if="material.type === MaterialType.textured">
        <ImageInput
          label="materials.components.diffuse_map"
          :modelValue="material.diffuseMap"
          @update:modelValue="updateMaterialProp('diffuseMap', $event)"
          :disabled="disabled"
        />
        <Combobox
          label="materials.components.texture_filtering"
          :modelValue="material.interpolation"
          @update:modelValue="updateMaterialProp('interpolation', $event)"
          :items="filteringOptions"
          :disabled="disabled"
        />
        <Combobox
          label="materials.components.texture_wrap"
          :modelValue="material.extension"
          @update:modelValue="updateMaterialProp('extension', $event)"
          :items="wrapOptions"
          :disabled="disabled"
        />
        <Combobox
          label="materials.components.transparency"
          :modelValue="material.transparency.type"
          @update:modelValue="updateTransparencyType($event)"
          :items="transparencyTypeOptions"
          :disabled="disabled"
        />
        <Slider
          v-if="material.transparency.type === 'UseAlphaValue'"
          label="materials.components.alpha"
          :modelValue="material.transparency.alphaValue"
          @update:modelValue="updateTransparencyProp('alphaValue', $event)"
          :min="0" :max="1" :step="0.01" :decimals="2"
          :disabled="disabled"
        />
        <template v-if="material.transparency.type === 'UseAlphaMap'">
          <ImageInput
            label="materials.components.alpha_map"
            :modelValue="material.transparency.alphaMap"
            @update:modelValue="updateTransparencyProp('alphaMap', $event)"
            :disabled="disabled"
          />
          <Combobox
            label="materials.components.alpha_channel"
            :modelValue="material.transparency.alphaChannel"
            @update:modelValue="updateTransparencyProp('alphaChannel', $event)"
            :items="imageChannelOptions"
            :disabled="disabled"
          />
        </template>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, PropType } from 'vue';
import { LOC, TLocalisedKey } from '../../localiser'; // Added TLocalisedKey
import {
    MaterialUIData,
    RGBA, // RGBA should be available via ../types if re-exported correctly
    MaterialType,
    EImageChannel,
    TTexelInterpolation,
    TTexelExtension,
    TTransparencyTypes,
    ComboboxItem,
    SolidMaterialUIData, // For type guard
    TexturedMaterialUIData // For type guard
} from '../types';

import MaterialTypeSwitcher from './MaterialTypeSwitcher.vue';
import ColourPicker from './ColourPicker.vue';
import Slider from './Slider.vue';
import ImageInput from './ImageInput.vue'; // ImageInputValue is now part of MaterialUIData
import Combobox from './Combobox.vue';

export default defineComponent({
  name: 'MaterialItem',
  components: {
    MaterialTypeSwitcher,
    ColourPicker,
    Slider,
    ImageInput,
    Combobox,
  },
  props: {
    materialName: {
      type: String,
      required: true,
    },
    material: {
      type: Object as PropType<MaterialUIData>, // Now using MaterialUIData from types.ts
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    }
  },
  emits: ['updateMaterial', 'changeMaterialType'],
  setup(props, { emit }) {
    const isExpanded = ref(true);

    const toggleExpanded = () => {
      isExpanded.value = !isExpanded.value;
    };

    const onChangeType = (newType: MaterialType) => {
        emit('changeMaterialType', { materialName: props.materialName, newType });
    };

    const updateMaterialProp = (propName: keyof MaterialUIData | string, value: any) => {
      emit('updateMaterial', {
        materialName: props.materialName,
        propertyName: propName,
        value,
      });
    };

    const updateAlpha = (newAlpha: number) => {
        // For SolidMaterial, alpha is part of RGBA color
        if (isSolidMaterial(props.material)) { // Use the type guard
            const newColour = { ...props.material.colour, a: newAlpha };
            updateMaterialProp('colour', newColour);
        }
    };

    const updateTransparencyType = (newType: TTransparencyTypes) => {
        if (isTexturedMaterial(props.material)) {
            updateMaterialProp('transparency', { ...props.material.transparency, type: newType });
        }
    };

    const updateTransparencyProp = (propName: string, value: any) => {
        if (isTexturedMaterial(props.material)) {
            // Further check if transparency object itself exists, though isTexturedMaterial should imply it for TexturedMaterialUIData
            if (props.material.transparency) {
                 updateMaterialProp('transparency', { ...props.material.transparency, [propName]: value });
            }
        }
    };


    // Options for Comboboxes
    const filteringOptions = computed((): ComboboxItem<TTexelInterpolation>[] => [
      { payload: 'linear', displayLocKey: 'materials.components.linear' as TLocalisedKey },
      { payload: 'nearest', displayLocKey: 'materials.components.nearest' as TLocalisedKey },
    ]);

    const wrapOptions = computed((): ComboboxItem<TTexelExtension>[] => [ // Corrected TTextureExtension to TTexelExtension
      { payload: 'clamp', displayLocKey: 'materials.components.clamp' as TLocalisedKey },
      { payload: 'repeat', displayLocKey: 'materials.components.repeat' as TLocalisedKey },
    ]);

    const transparencyTypeOptions = computed((): ComboboxItem<TTransparencyTypes>[] => [
      { payload: 'None', displayLocKey: 'materials.components.none' as TLocalisedKey },
      { payload: 'UseAlphaMap', displayLocKey: 'materials.components.alpha_map' as TLocalisedKey },
      { payload: 'UseAlphaValue', displayLocKey: 'materials.components.alpha_constant' as TLocalisedKey },
      { payload: 'UseDiffuseMapAlphaChannel', displayLocKey: 'materials.components.diffuse_map_alpha_channel' as TLocalisedKey },
    ]);

    const imageChannelOptions = computed((): ComboboxItem<EImageChannel>[] => [
      { payload: EImageChannel.R, displayLocKey: 'misc.red' as TLocalisedKey },
      { payload: EImageChannel.G, displayLocKey: 'misc.green' as TLocalisedKey },
      { payload: EImageChannel.B, displayLocKey: 'misc.blue' as TLocalisedKey },
      { payload: EImageChannel.A, displayLocKey: 'misc.alpha' as TLocalisedKey },
    ]);

    // Type guard for textured material specific properties
    const isTexturedMaterial = (mat: MaterialUIData): mat is TexturedMaterialUIData => {
        return mat.type === MaterialType.textured;
    };

    const isSolidMaterial = (mat: MaterialUIData): mat is SolidMaterialUIData => {
        return mat.type === MaterialType.solid;
    };

    return {
      isExpanded,
      isTexturedMaterial,
      isSolidMaterial, // Expose type guard to template
      toggleExpanded,
      onChangeType,
      updateMaterialProp,
      updateAlpha,
      updateTransparencyType,
      updateTransparencyProp,
      // MaterialType is available via types.ts re-export
      filteringOptions,
      wrapOptions,
      transparencyTypeOptions,
      imageChannelOptions,
      LOC,
    };
  },
});
</script>

<style scoped>
.material-item-vue {
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 8px;
  background-color: #f9f9f9;
}

.material-header-vue {
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #efefef;
  border-bottom: 1px solid #ddd;
  font-weight: bold;
  user-select: none;
}
.material-item-vue.disabled .material-header-vue {
    background-color: #f5f5f5;
    color: #aaa;
    cursor: not-allowed;
}


.expander-icon-vue {
  font-size: 0.8em;
  margin-left: 10px;
}

.material-details-vue {
  padding: 12px;
  /* Based on .component-group from original */
  display: flex;
  flex-direction: column;
  gap: 8px; /* Space between components within a material */
}

/* Standardize spacing for config components used within */
/* Using :deep for child component styling */
:deep(.config-component-vue) {
    padding: 4px 0; /* Reduced padding for nested components */
}
:deep(.config-label-vue) {
    font-size: 0.9em; /* Slightly smaller labels for nested items */
}

</style>
