<template>
  <div class="settings-group-vue">
    <h3 class="group-heading-vue">{{ LOC('settings.heading') }}</h3>
    <div class="group-components-vue">
      <Combobox
        :label="LOC('settings.components.language')"
        v-model="currentLanguage"
        :items="languageOptions"
        @update:modelValue="onLanguageChange"
        :disabled="disabled"
        external-id="settings-language-combo"
      />
      <Slider
        :label="LOC('settings.components.overrideHeight')"
        v-model="overrideHeightValue"
        :min="16"
        :max="10000"
        :step="1"
        :decimals="0"
        @update:modelValue="onOverrideHeightChange"
        :disabled="disabled"
        external-id="settings-overrideheight-slider"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, PropType, watch } from 'vue';
import { LOC, Localiser, TLocalisedKey } from '../../localiser';
import { AppConfig } from '../../config';
import { locales, TLocaleDefinition } from '../../../loc/base';
import Combobox from '../components/Combobox.vue';
import { ComboboxItem } from '../types'; // Path from src/ui/groups to src/ui/types
import Slider from '../components/Slider.vue';
import { AppConsole } from '../console'; // Path from src/ui/groups to src/ui/console
import { AppContext } from '../../app_context'; // For appContext prop, if used

export default defineComponent({
  name: 'SettingsGroup',
  components: { Combobox, Slider },
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    // AppContext might not be strictly needed if settings directly modify global AppConfig/Localiser
    // but passed for consistency with other groups that perform EActions.
    appContext: {
        type: Object as PropType<AppContext>,
        // required: true, // Not strictly required if not used for EActions
    },
    // Initial values are read from AppConfig/Localiser directly in setup for now.
    // If AppConfig/Localiser state becomes reactive and managed through AppContext,
    // these could become props updated from a central store.
  },
  setup(props) {
    const currentLanguage = ref(Localiser.Get.getCurrentLanguage() || AppConfig.Get.LOCALE);
    const overrideHeightValue = ref(AppConfig.Get.CONSTRAINT_MAXIMUM_HEIGHT);

    const languageOptions = computed((): ComboboxItem<string>[] => {
      return locales.map((locale: TLocaleDefinition) => ({
        displayText: locale.display_name,
        payload: locale.language_code,
      }));
    });

    const onLanguageChange = (newLanguageCode: string) => {
      AppConsole.info(LOC('settings.changing_language' as TLocalisedKey));
      Localiser.Get.changeLanguage(newLanguageCode).then(() => {
          // Reflect change if Localiser.Get.getCurrentLanguage() is now different
          currentLanguage.value = Localiser.Get.getCurrentLanguage();
      });
      // AppConfig.LOCALE is readonly. Language changes are managed by Localiser.
    };

    // Watch for external changes to Localiser state if any (e.g. if loaded from save)
    // This is a placeholder for a more robust event-driven update from Localiser/AppContext
    watch(() => Localiser.Get.getCurrentLanguage(), (newLang) => {
        if (newLang && newLang !== currentLanguage.value) {
            currentLanguage.value = newLang;
        }
    });

    const onOverrideHeightChange = (newValue: number) => {
      AppConfig.Get.CONSTRAINT_MAXIMUM_HEIGHT = newValue;
      // No need to set overrideHeightValue.value = newValue; because v-model handles it.
    };

    // If AppConfig.CONSTRAINT_MAXIMUM_HEIGHT could change elsewhere, a watcher would be needed:
    // watch(() => AppConfig.Get.CONSTRAINT_MAXIMUM_HEIGHT, (newVal) => {
    //   if (newVal !== overrideHeightValue.value) {
    //     overrideHeightValue.value = newVal;
    //   }
    // });


    return {
      LOC,
      currentLanguage,
      overrideHeightValue,
      languageOptions,
      onLanguageChange,
      onOverrideHeightChange,
    };
  },
});
</script>

<style scoped>
/* Scoped styles for SettingsGroup, if any specific are needed */
/* Common group styles (.group-heading-vue, .group-components-vue) are in Layout.vue */
</style>
