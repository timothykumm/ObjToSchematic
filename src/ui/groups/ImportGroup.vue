<template>
  <div class="import-group-vue">
    <h3 class="group-heading-vue">{{ LOC("import.heading") }}</h3>
    <div class="group-components-vue">
      <FileInput
        :label="LOC('import.components.input' as TLocalisedKey)"
        v-model="selectedFile"
        accept=".obj,.glb,.gltf"
        :disabled="disabled"
        external-id="import-file-input"
      />
      <VectorInput
        :label="LOC('import.components.rotation' as TLocalisedKey)"
        v-model="rotationValue"
        :showY="true"
        :min="-360"
        :max="360"
        :step="1"
        :disabled="disabled"
        @axisHover="onAxisHover"
        external-id="import-rotation-input"
      />
    </div>
    <Button
      :label="LOC('import.button' as TLocalisedKey)"
      @click="handleImportAction"
      :is-loading="isImporting"
      :progress="importProgress"
      :disabled="disabled || !selectedFile"
      class="group-exec-button-vue"
      external-id="import-exec-button"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, onMounted, PropType } from "vue";
import { LOC, TLocalisedKey } from "../../localiser";
import { AppContext } from "../../app_context";
import { Renderer } from "../../renderer";
import { EAction } from "../../util";
import { TAxis, Vector3Value } from "../types"; // Correct: TAxis and Vector3Value from types.ts
import FileInput from "../components/FileInput.vue";
import VectorInput from "../components/VectorInput.vue";
import Button from "../components/Button.vue";

export default defineComponent({
  name: "ImportGroup",
  components: { FileInput, VectorInput, Button },
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    appContext: {
      type: Object as PropType<AppContext>,
      required: true,
    },
    isImporting: {
      // For exec button loading state
      type: Boolean,
      default: false,
    },
    importProgress: {
      // For exec button progress
      type: Number,
      default: 0,
    },
  },
  setup(props) {
    const selectedFile = ref<File | null>(null);
    const rotationValue = ref<Vector3Value>({ x: 0, y: 0, z: 0 });

    // Get Vue UI Bridge for state synchronization
    const vueBridge = props.appContext.getVueUIBridge();

    // Watch for changes and sync with VueUIBridge
    watch(selectedFile, (newFile) => {
      vueBridge.setComponentValue("import", "input", newFile);
    });

    watch(
      rotationValue,
      (newRotation) => {
        vueBridge.setComponentValue("import", "rotation", newRotation);
      },
      { deep: true }
    );

    // Initialize values in bridge on mount
    onMounted(() => {
      vueBridge.setComponentValue("import", "input", selectedFile.value);
      vueBridge.setComponentValue("import", "rotation", rotationValue.value);
    });

    const onAxisHover = (hoverEvent: {
      axis: TAxis;
      state: "enter" | "exit";
    }) => {
      if (props.disabled) return;
      if (hoverEvent.state === "enter") {
        Renderer.Get.setAxisToHighlight(hoverEvent.axis);
      } else {
        Renderer.Get.clearAxisToHighlight();
      }
    };

    const handleImportAction = () => {
      if (props.appContext && !props.disabled && selectedFile.value) {
        // TODO: Refactor AppContext.do(EAction.Import) to accept params:
        // { file: selectedFile.value, rotation: rotationValue.value }
        // The original AppContext._import() reads from UI.Get.layout...
        // which won't work with Vue components.
        props.appContext.do(EAction.Import);
      }
    };

    return {
      LOC,
      // TLocalisedKey, // Cannot return a type; LOC function handles the type.
      selectedFile,
      rotationValue,
      onAxisHover,
      handleImportAction,
    };
  },
});
</script>

<style scoped>
/* Scoped styles for ImportGroup */
/* Common group styles (.group-heading-vue, .group-components-vue, .group-exec-button-vue) */
/* are expected to be in Layout.vue or a global stylesheet. */
.group-exec-button-vue {
  margin-top: 15px;
}
</style>
