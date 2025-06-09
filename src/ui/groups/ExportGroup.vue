<template>
  <div class="export-group-vue">
    <h3 class="group-heading-vue">
      {{ LOC("export.heading" as TLocalisedKey) }}
    </h3>
    <div class="group-components-vue">
      <Combobox
        :label="LOC('export.components.exporter' as TLocalisedKey)"
        v-model="exporterValue"
        :items="exporterOptions"
        :disabled="disabled"
        external-id="export-exporter-combo"
      />
    </div>
    <Button
      :label="LOC('export.button' as TLocalisedKey)"
      @click="handleExportAction"
      :is-loading="isExporting"
      :disabled="disabled"
      class="group-exec-button-vue"
      external-id="export-exec-button"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, PropType, computed, watch } from "vue"; // 'watch' is added
import { LOC, TLocalisedKey } from "../../localiser";
import { AppContext } from "../../app_context";
// AppConfig is not used for EXPORT_TYPE as it wasn't in AppConfig
// import { AppConfig } from '../../config';
import { EAction } from "../../util";
import { TExporters } from "../../exporters/exporters";
import Combobox from "../components/Combobox.vue";
import { ComboboxItem } from "../types";
import Button from "../components/Button.vue";
import { VueUIBridge } from "../../ui/vue_bridge"; // This line is added

const DEFAULT_EXPORTER: TExporters = "litematic";

export default defineComponent({
  name: "ExportGroup",
  components: { Combobox, Button },
  props: {
    disabled: { type: Boolean, default: false },
    appContext: { type: Object as PropType<AppContext>, required: true },
    isExporting: { type: Boolean, default: false },
  },
  setup(props) {
    const exporterValue = ref<TExporters>(DEFAULT_EXPORTER);

    // ---- THIS IS THE NEWLY ADDED LOGIC ----
    // Ensure VueUIBridge is updated when exporterValue changes
    watch(exporterValue, (newValue) => {
      VueUIBridge.Get.setComponentValue("export", "export", newValue);
    });

    // Set the initial value in VueUIBridge on component setup
    VueUIBridge.Get.setComponentValue("export", "export", exporterValue.value);
    // ---- END OF NEWLY ADDED LOGIC ----

    const exporterOptions = computed((): ComboboxItem<TExporters>[] => [
      {
        payload: "litematic",
        displayLocKey: "export.components.litematic" as TLocalisedKey,
      },
      {
        payload: "schematic",
        displayLocKey: "export.components.schematic" as TLocalisedKey,
      },
      {
        payload: "schem",
        displayLocKey: "export.components.sponge_schematic" as TLocalisedKey,
      },
      {
        payload: "nbt",
        displayLocKey: "export.components.structure_blocks" as TLocalisedKey,
      },
      {
        payload: "indexed_json",
        displayLocKey: "export.components.indexed_json" as TLocalisedKey,
      },
      {
        payload: "uncompressed_json",
        displayLocKey: "export.components.uncompressed_json" as TLocalisedKey,
      },
    ]);

    const handleExportAction = () => {
      if (props.appContext && !props.disabled) {
        // TODO: Refactor AppContext.do(EAction.Export) to accept param:
        // { exporter: exporterValue.value }
        // The original AppContext._export() reads from UI.Get.layout...
        props.appContext.do(EAction.Export);
      }
    };

    return {
      LOC,
      // TLocalisedKey, // Cannot return a type
      exporterValue,
      exporterOptions,
      handleExportAction,
    };
  },
});
</script>

<style scoped>
.group-exec-button-vue {
  margin-top: 15px;
}
</style>
