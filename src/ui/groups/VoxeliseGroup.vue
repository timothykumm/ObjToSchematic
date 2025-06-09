<template>
  <div class="voxelise-group-vue">
    <h3 class="group-heading-vue">{{ LOC('voxelise.heading' as TLocalisedKey) }}</h3>
    <div class="group-components-vue">
      <Combobox
        :label="LOC('voxelise.components.constraint_axis' as TLocalisedKey)"
        v-model="constraintAxisValue"
        :items="constraintAxisOptions"
        @update:modelValue="onConstraintAxisChanged"
        :disabled="disabled"
        external-id="voxelise-constraintaxis-combo"
      />
      <Slider
        :label="LOC('voxelise.components.size' as TLocalisedKey)"
        v-model="sizeValue"
        :min="currentSizeMin"
        :max="currentSizeMax"
        :step="1"
        :decimals="0"
        :disabled="disabled"
        external-id="voxelise-size-slider"
      />
      <PlaceholderInfo :textKey="'misc.advanced_settings' as TLocalisedKey" />
      <Combobox
        :label="LOC('voxelise.components.algorithm' as TLocalisedKey)"
        v-model="voxeliserValue"
        :items="voxeliserOptions"
        :disabled="disabled"
        external-id="voxelise-algorithm-combo"
      />
      <Checkbox
        :label="LOC('voxelise.components.ambient_occlusion' as TLocalisedKey)"
        v-model="ambientOcclusionValue"
        :checkedTextKey="'voxelise.components.on_recommended' as TLocalisedKey"
        :uncheckedTextKey="'voxelise.components.off_faster' as TLocalisedKey"
        :disabled="disabled"
        external-id="voxelise-ao-checkbox"
      />
      <Checkbox
        :label="LOC('voxelise.components.multisampling' as TLocalisedKey)"
        v-model="multisampleColouringValue"
        :checkedTextKey="'voxelise.components.on_recommended'as TLocalisedKey"
        :uncheckedTextKey="'voxelise.components.off_faster' as TLocalisedKey"
        :disabled="disabled"
        external-id="voxelise-multisample-checkbox"
      />
      <Combobox
        :label="LOC('voxelise.components.voxel_overlap' as TLocalisedKey)"
        v-model="voxelOverlapRuleValue"
        :items="voxelOverlapRuleOptions"
        :disabled="disabled"
        external-id="voxelise-overlap-combo"
      />
    </div>
    <Button
      :label="LOC('voxelise.button' as TLocalisedKey)"
      @click="handleVoxeliseAction"
      :is-loading="isVoxelising"
      :disabled="disabled"
      class="group-exec-button-vue"
      external-id="voxelise-exec-button"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, PropType, onMounted } from 'vue';
import { LOC, TLocalisedKey } from '../../localiser';
import { AppContext } from '../../app_context';
import { AppConfig } from '../../config';
import { EAction } from '../../util';
import { TAxis, TVoxelisers, TVoxelOverlapRule, ComboboxItem } from '../types';
import Combobox from '../components/Combobox.vue';
import Slider from '../components/Slider.vue';
import Checkbox from '../components/Checkbox.vue';
import Button from '../components/Button.vue';
import PlaceholderInfo from '../components/PlaceholderInfo.vue';

const DEFAULT_SIZE = 80;
const DEFAULT_AO = true;
const DEFAULT_MULTISAMPLING = true;
const DEFAULT_CONSTRAINT_AXIS: TAxis = 'y';
const DEFAULT_VOXELISER_ALGORITHM: TVoxelisers = 'ray-based';
const DEFAULT_VOXEL_OVERLAP_RULE: TVoxelOverlapRule = 'average';


export default defineComponent({
  name: 'VoxeliseGroup',
  components: { Combobox, Slider, Checkbox, Button, PlaceholderInfo },
  props: {
    disabled: { type: Boolean, default: false },
    appContext: { type: Object as PropType<AppContext>, required: true },
    isVoxelising: { type: Boolean, default: false },
  },
  setup(props) {
    const constraintAxisValue = ref<TAxis>(DEFAULT_CONSTRAINT_AXIS);
    const sizeValue = ref(DEFAULT_SIZE);
    const voxeliserValue = ref<TVoxelisers>(DEFAULT_VOXELISER_ALGORITHM);
    const ambientOcclusionValue = ref(DEFAULT_AO);
    const multisampleColouringValue = ref(DEFAULT_MULTISAMPLING);
    const voxelOverlapRuleValue = ref<TVoxelOverlapRule>(DEFAULT_VOXEL_OVERLAP_RULE);

    const currentSizeMin = ref(AppConfig.Get.CONSTRAINT_MINIMUM_HEIGHT);
    const currentSizeMax = ref(AppConfig.Get.CONSTRAINT_MAXIMUM_HEIGHT);

    const constraintAxisOptions = computed((): ComboboxItem<TAxis>[] => [
      { payload: 'y', displayLocKey: 'voxelise.components.y_axis' as TLocalisedKey },
      { payload: 'x', displayLocKey: 'voxelise.components.x_axis' as TLocalisedKey },
      { payload: 'z', displayLocKey: 'voxelise.components.z_axis' as TLocalisedKey },
    ]);

    const voxeliserOptions = computed((): ComboboxItem<TVoxelisers>[] => [
      { payload: 'ray-based', displayLocKey: 'voxelise.components.ray_based' as TLocalisedKey },
      { payload: 'bvh-ray', displayLocKey: 'voxelise.components.bvh_ray' as TLocalisedKey },
      { payload: 'ncrb', displayLocKey: 'voxelise.components.ncrb' as TLocalisedKey },
    ]);

    const voxelOverlapRuleOptions = computed((): ComboboxItem<TVoxelOverlapRule>[] => [
      { payload: 'average', displayLocKey: 'voxelise.components.average_recommended' as TLocalisedKey },
      { payload: 'first', displayLocKey: 'voxelise.components.first' as TLocalisedKey },
    ]);

    const onConstraintAxisChanged = (newAxis: TAxis) => {
      let newMin = 1, newMax = 256; // Fallback values
      switch (newAxis) {
        case 'x':
          newMin = props.appContext?.minConstraint?.x ?? AppConfig.Get.CONSTRAINT_MINIMUM_HEIGHT;
          newMax = props.appContext?.maxConstraint?.x ?? AppConfig.Get.CONSTRAINT_MAXIMUM_HEIGHT;
          break;
        case 'y':
          newMin = AppConfig.Get.CONSTRAINT_MINIMUM_HEIGHT;
          newMax = AppConfig.Get.CONSTRAINT_MAXIMUM_HEIGHT;
          break;
        case 'z':
          newMin = props.appContext?.minConstraint?.z ?? AppConfig.Get.CONSTRAINT_MINIMUM_HEIGHT;
          newMax = props.appContext?.maxConstraint?.z ?? AppConfig.Get.CONSTRAINT_MAXIMUM_HEIGHT;
          break;
      }
      currentSizeMin.value = Math.max(1, newMin); // Ensure min is at least 1
      currentSizeMax.value = Math.max(currentSizeMin.value, newMax); // Ensure max is >= min

      sizeValue.value = Math.max(currentSizeMin.value, Math.min(currentSizeMax.value, sizeValue.value));
    };

    // Get Vue UI Bridge for state synchronization
    const vueBridge = props.appContext.getVueUIBridge();

    // Watch for changes and sync with VueUIBridge
    watch(constraintAxisValue, (newValue) => {
      vueBridge.setComponentValue('voxelise', 'constraintAxis', newValue);
    });
    watch(sizeValue, (newValue) => {
      vueBridge.setComponentValue('voxelise', 'size', newValue);
    });
    watch(voxeliserValue, (newValue) => {
      vueBridge.setComponentValue('voxelise', 'voxeliser', newValue);
    });
    watch(ambientOcclusionValue, (newValue) => {
      vueBridge.setComponentValue('voxelise', 'ambientOcclusion', newValue);
    });
    watch(multisampleColouringValue, (newValue) => {
      vueBridge.setComponentValue('voxelise', 'useMultisampleColouring', newValue);
      vueBridge.setComponentValue('voxelise', 'multisampleColouring', newValue);
    });
    watch(voxelOverlapRuleValue, (newValue) => {
      vueBridge.setComponentValue('voxelise', 'voxelOverlapRule', newValue);
    });

    onMounted(() => {
      onConstraintAxisChanged(constraintAxisValue.value);
      
      // Initialize values in bridge
      vueBridge.setComponentValue('voxelise', 'constraintAxis', constraintAxisValue.value);
      vueBridge.setComponentValue('voxelise', 'size', sizeValue.value);
      vueBridge.setComponentValue('voxelise', 'voxeliser', voxeliserValue.value);
      vueBridge.setComponentValue('voxelise', 'ambientOcclusion', ambientOcclusionValue.value);
      vueBridge.setComponentValue('voxelise', 'useMultisampleColouring', multisampleColouringValue.value);
      vueBridge.setComponentValue('voxelise', 'multisampleColouring', multisampleColouringValue.value);
      vueBridge.setComponentValue('voxelise', 'voxelOverlapRule', voxelOverlapRuleValue.value);
    });

    const handleVoxeliseAction = () => {
      if (props.appContext && !props.disabled) {
        // TODO: Refactor AppContext.do(EAction.Voxelise) to accept params:
        // {
        //   constraintAxis: constraintAxisValue.value,
        //   size: sizeValue.value,
        //   voxeliser: voxeliserValue.value,
        //   ambientOcclusion: ambientOcclusionValue.value,
        //   multisampleColouring: multisampleColouringValue.value,
        //   voxelOverlapRule: voxelOverlapRuleValue.value,
        // }
        props.appContext.do(EAction.Voxelise);
      }
    };

    return {
      LOC,
      // TLocalisedKey, // Cannot return a type; LOC function handles the type.
      constraintAxisValue,
      sizeValue,
      voxeliserValue,
      ambientOcclusionValue,
      multisampleColouringValue,
      voxelOverlapRuleValue,
      constraintAxisOptions,
      voxeliserOptions,
      voxelOverlapRuleOptions,
      currentSizeMin,
      currentSizeMax,
      onConstraintAxisChanged,
      handleVoxeliseAction,
    };
  },
});
</script>

<style scoped>
/* Styles for VoxeliseGroup */
.group-exec-button-vue {
  margin-top: 15px;
}
</style>
