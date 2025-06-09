<template>
  <div class="assign-group-vue">
    <h3 class="group-heading-vue">{{ LOC('assign.heading' as TLocalisedKey) }}</h3>
    <div class="group-components-vue">
      <PaletteDisplay
        :label="LOC('assign.components.block_palette' as TLocalisedKey)"
        v-model="blockPaletteValue"
        :disabled="disabled"
        external-id="assign-palette"
      />
      <Combobox
        :label="LOC('assign.components.dithering' as TLocalisedKey)"
        v-model="ditheringValue"
        :items="ditheringOptions"
        :disabled="disabled"
        external-id="assign-dithering-combo"
      />
      <!-- Placeholder for Advanced Settings: Corrected order as per layout.ts -->
      <PlaceholderInfo :textKey="'misc.advanced_settings' as TLocalisedKey" />

      <Combobox
        :label="LOC('assign.components.texture_atlas' as TLocalisedKey)"
        v-model="textureAtlasValue"
        :items="textureAtlasOptions"
        :disabled="disabled"
        external-id="assign-textureatlas-combo"
      />
      <Slider
        :label="LOC('assign.components.dithering_magnitude' as TLocalisedKey)"
        v-model="ditheringMagnitudeValue"
        :min="1" :max="64" :step="1" :decimals="0"
        :disabled="disabled || ditheringMagnitudeDisabled"
        external-id="assign-dithermag-slider"
      />
      <Combobox
        :label="LOC('assign.components.fallable_blocks' as TLocalisedKey)"
        v-model="fallableValue"
        :items="fallableOptions"
        :disabled="disabled"
        external-id="assign-fallable-combo"
      />
      <Slider
        :label="LOC('assign.components.colour_accuracy' as TLocalisedKey)"
        v-model="colourAccuracyValue"
        :min="1" :max="8" :step="0.1" :decimals="1"
        :disabled="disabled"
        external-id="assign-colouraccuracy-slider"
      />
      <Checkbox
        :label="LOC('assign.components.smart_averaging' as TLocalisedKey)"
        v-model="contextualAveragingValue"
        :checkedTextKey="'voxelise.components.on_recommended' as TLocalisedKey"
        :uncheckedTextKey="'voxelise.components.off_faster' as TLocalisedKey"
        :disabled="disabled"
        external-id="assign-smartaverage-checkbox"
      />
      <Slider
        :label="LOC('assign.components.smoothness' as TLocalisedKey)"
        v-model="errorWeightValue"
        :min="0.0" :max="2.0" :step="0.01" :decimals="2"
        :disabled="disabled"
        external-id="assign-smoothness-slider"
      />
      <Checkbox
        :label="LOC('assign.components.calculate_lighting' as TLocalisedKey)"
        v-model="calculateLightingValue"
        :checkedTextKey="'misc.on' as TLocalisedKey"
        :uncheckedTextKey="'misc.off' as TLocalisedKey"
        :disabled="disabled"
        external-id="assign-calclighting-checkbox"
      />
      <Slider
        :label="LOC('assign.components.light_threshold' as TLocalisedKey)"
        v-model="lightThresholdValue"
        :min="0" :max="14" :step="1" :decimals="0"
        :disabled="disabled || lightThresholdDisabled"
        external-id="assign-lightthresh-slider"
      />
    </div>
    <Button
      :label="LOC('assign.button' as TLocalisedKey)"
      @click="handleAssignAction"
      :is-loading="isAssigning"
      :disabled="disabled"
      class="group-exec-button-vue"
      external-id="assign-exec-button"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, PropType } from 'vue';
import { LOC, TLocalisedKey } from '../../localiser';
import { AppContext } from '../../app_context';
// AppConfig is not directly used for these settings as they don't exist there
// import { AppConfig } from '../../config';
import { EAction } from '../../util';
import { TDithering } from '../../util/type_util'; // TDithering is still from util/type_util
import { FallableBehaviour, ComboboxItem } from '../types'; // FallableBehaviour and ComboboxItem from types.ts
import { VueUIBridge } from '../vue_bridge';
import { Palette } from '../../palette';
import Combobox from '../components/Combobox.vue';
import Slider from '../components/Slider.vue';
import Checkbox from '../components/Checkbox.vue';
import Button from '../components/Button.vue';
import PaletteDisplay from '../components/PaletteDisplay.vue';
import PlaceholderInfo from '../components/PlaceholderInfo.vue';

// Default values from original layout.ts or sensible defaults
const DEFAULT_TEXTURE_ATLAS = 'vanilla';
const DEFAULT_DITHERING: TDithering = 'ordered';
const DEFAULT_DITHER_MAGNITUDE = 32;
const DEFAULT_FALLABLE: FallableBehaviour = 'replace-falling';
const DEFAULT_COLOUR_ACCURACY = 5;
const DEFAULT_CONTEXTUAL_AVG = true;
const DEFAULT_ERROR_WEIGHT = 0.2;
const DEFAULT_CALC_LIGHTING = false;
const DEFAULT_LIGHT_THRESHOLD = 1;

export default defineComponent({
  name: 'AssignGroup',
  components: { Combobox, Slider, Checkbox, Button, PaletteDisplay, PlaceholderInfo },
  props: {
    disabled: { type: Boolean, default: false },
    appContext: { type: Object as PropType<AppContext>, required: true },
    isAssigning: { type: Boolean, default: false },
  },
  setup(props) {
    const textureAtlasValue = ref<string>(DEFAULT_TEXTURE_ATLAS);
    const blockPaletteValue = ref<string[]>([]);
    const ditheringValue = ref<TDithering>(DEFAULT_DITHERING);
    const ditheringMagnitudeValue = ref(DEFAULT_DITHER_MAGNITUDE);
    const fallableValue = ref<FallableBehaviour>(DEFAULT_FALLABLE);
    const colourAccuracyValue = ref(DEFAULT_COLOUR_ACCURACY);
    const contextualAveragingValue = ref(DEFAULT_CONTEXTUAL_AVG);
    const errorWeightValue = ref(DEFAULT_ERROR_WEIGHT);
    const calculateLightingValue = ref(DEFAULT_CALC_LIGHTING);
    const lightThresholdValue = ref(DEFAULT_LIGHT_THRESHOLD);

    const ditheringMagnitudeDisabled = computed(() => ditheringValue.value === 'off');
    const lightThresholdDisabled = computed(() => !calculateLightingValue.value);

    const textureAtlasOptions: ComboboxItem<string>[] = [
      { payload: 'vanilla', displayLocKey: 'assign.components.vanilla' as TLocalisedKey },
    ];
    const ditheringOptions: ComboboxItem<TDithering>[] = [
      { payload: 'ordered', displayLocKey: 'assign.components.ordered' as TLocalisedKey },
      { payload: 'random', displayLocKey: 'assign.components.random' as TLocalisedKey },
      { payload: 'off', displayLocKey: 'assign.components.off' as TLocalisedKey },
    ];
    const fallableOptions: ComboboxItem<FallableBehaviour>[] = [
      { payload: 'replace-falling', displayLocKey: 'assign.components.replace_falling' as TLocalisedKey },
      { payload: 'replace-fallable', displayLocKey: 'assign.components.replace_fallable' as TLocalisedKey },
      { payload: 'do-nothing', displayLocKey: 'assign.components.do_nothing' as TLocalisedKey },
    ];

    const handleAssignAction = () => {
      if (props.appContext && !props.disabled) {
        // TODO: Refactor AppContext.do(EAction.Assign) to accept params from local refs
        props.appContext.do(EAction.Assign);
      }
    };

    // Watch for changes in blockPaletteValue and sync with Vue bridge
    watch(blockPaletteValue, (newBlocks) => {
      const palette = Palette.create();
      palette.add(newBlocks);
      VueUIBridge.Get.setComponentValue('assign', 'blockPalette', palette);
    }, { deep: true });

    // Sync other component values
    watch(textureAtlasValue, (value) => VueUIBridge.Get.setComponentValue('assign', 'textureAtlas', value));
    watch(ditheringValue, (value) => VueUIBridge.Get.setComponentValue('assign', 'dithering', value));
    watch(ditheringMagnitudeValue, (value) => VueUIBridge.Get.setComponentValue('assign', 'ditheringMagnitude', value));
    watch(fallableValue, (value) => VueUIBridge.Get.setComponentValue('assign', 'fallable', value));
    watch(colourAccuracyValue, (value) => VueUIBridge.Get.setComponentValue('assign', 'colourAccuracy', value));
    watch(calculateLightingValue, (value) => VueUIBridge.Get.setComponentValue('assign', 'calculateLighting', value));
    watch(lightThresholdValue, (value) => VueUIBridge.Get.setComponentValue('assign', 'lightThreshold', value));

    return {
      LOC, // TLocalisedKey should not be returned as it's a type
      textureAtlasValue, blockPaletteValue, ditheringValue, ditheringMagnitudeValue,
      fallableValue, colourAccuracyValue, contextualAveragingValue, errorWeightValue,
      calculateLightingValue, lightThresholdValue,
      textureAtlasOptions, ditheringOptions, fallableOptions,
      ditheringMagnitudeDisabled, lightThresholdDisabled,
      handleAssignAction,
    };
  },
});
</script>

<style scoped>
.group-exec-button-vue {
  margin-top: 15px;
}
</style>
