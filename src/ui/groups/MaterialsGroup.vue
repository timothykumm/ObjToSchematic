<template>
  <div class="materials-group-vue">
    <h3 class="group-heading-vue">
      {{ LOC("materials.heading" as TLocalisedKey) }}
    </h3>
    <div class="group-components-vue">
      <PlaceholderInfo
        v-if="!materials || materials.length === 0"
        :textKey="'materials.components.no_materials_loaded' as TLocalisedKey"
      />
      <div v-else class="materials-list-vue">
        <MaterialItem
          v-for="(material, index) in materials"
          :key="material.name || `material-${index}`"
          :materialName="material.name || `Material ${index + 1}`"
          :material="material"
          :disabled="disabled"
          @updateMaterial="handleUpdateMaterial"
          @changeMaterialType="handleChangeMaterialType"
        />
      </div>
    </div>
    <Button
      :label="LOC('materials.button' as TLocalisedKey)"
      @click="handleMaterialsAction"
      :is-loading="isProcessing"
      :disabled="disabled || !materials || materials.length === 0"
      class="group-exec-button-vue"
      external-id="materials-exec-button"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { LOC, TLocalisedKey } from "../../localiser";
import { AppContext } from "../../app_context";
import { EAction } from "../../util";
// MaterialMapManager might not be directly used here if all updates go via AppContext
// import { MaterialMapManager } from '../../material-map';
import { MaterialType } from "../../mesh"; // Only MaterialType enum for event payload
import MaterialItem from "../components/MaterialItem.vue";
import { MaterialUIData } from "../types"; // Corrected import
import PlaceholderInfo from "../components/PlaceholderInfo.vue";
import Button from "../components/Button.vue";

export default defineComponent({
  name: "MaterialsGroup",
  components: { MaterialItem, PlaceholderInfo, Button },
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    appContext: {
      type: Object as PropType<AppContext>,
      required: true,
    },
    materials: {
      // This list is provided by Layout.vue, ultimately from AppContext
      type: Array as PropType<MaterialUIData[]>,
      default: () => [],
    },
    isProcessing: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    // emit can be used if we need to bubble up events further

    const handleUpdateMaterial = (event: {
      materialName: string;
      propertyName: string;
      value: any;
    }) => {
      if (
        props.appContext &&
        typeof props.appContext.updateMaterialProperty === "function"
      ) {
        props.appContext.updateMaterialProperty(
          event.materialName,
          event.propertyName,
          event.value
        );
      } else {
        console.error(
          "MaterialsGroup: AppContext prop is not available or updateMaterialProperty method is missing."
        );
      }
      // The original console.log and TODO comments should be removed.
    };

    const handleChangeMaterialType = (event: {
      materialName: string;
      newType: MaterialType;
    }) => {
      if (
        props.appContext &&
        typeof props.appContext.handleMaterialTypeChange === "function"
      ) {
        props.appContext.handleMaterialTypeChange(
          event.materialName,
          event.newType
        );
      } else {
        console.error(
          "MaterialsGroup: AppContext prop is not available or handleMaterialTypeChange method is missing."
        );
      }
      // Optionally remove or keep the console.log, for this subtask, let's remove it.
    };

    const handleMaterialsAction = () => {
      if (props.appContext && !props.disabled) {
        // This action might finalize material edits. AppContext needs to have access
        // to the current state of materials (possibly via MaterialMapManager).
        props.appContext.do(EAction.Materials);
      }
    };

    return {
      LOC,
      // TLocalisedKey, // Cannot return a type; LOC function handles the type.
      handleUpdateMaterial,
      handleChangeMaterialType,
      handleMaterialsAction,
    };
  },
});
</script>

<style scoped>
.materials-list-vue {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 5px;
}

.group-exec-button-vue {
  margin-top: 15px;
}
</style>
