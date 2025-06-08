<template>
  <div class="config-component-vue image-input-config-vue" :class="{ 'disabled': disabled }">
    <div class="config-label-vue">
      {{ componentLabel }}
    </div>
    <div class="config-actuator-vue image-actuator-vue">
      <div class="image-preview-container-vue">
        <img
          v-if="previewSrc"
          :src="previewSrc"
          alt="Texture Preview"
          class="texture-preview-vue"
        />
        <div v-else class="texture-preview-placeholder-vue">
          <div v-html="AppIcons.IMAGE_MISSING" class="missing-icon-vue"></div>
          <span>{{ LOC('materials.components.no_image_loaded') }}</span>
        </div>
      </div>
      <Button
        :label="LOC('materials.components.choose')"
        :disabled="disabled"
        @click="triggerFileInput"
        class="choose-file-button-vue"
      />
      <input
        type="file"
        accept="image/png,image/jpeg"
        style="display: none;"
        :id="id"
        ref="fileInputRef"
        @change="handleFileChange"
        :disabled="disabled"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, PropType } from 'vue';
import { LOC, TLocalisedKey } from '../../localiser';
import { TImageRawWrap } from '../../texture'; // Assuming path
import { AppIcons } from '../icons'; // Assuming path
import Button from './Button.vue'; // Using our Button.vue
import { ImageInputValue } from '../types'; // Import from new types file

let imageInputCounter = 0;

export default defineComponent({
  name: 'ImageInput',
  components: { Button },
  props: {
    modelValue: { // TImageRawWrap object for v-model
      type: Object as PropType<ImageInputValue | null>,
      default: null,
    },
    label: {
      type: String as PropType<TLocalisedKey | string>,
      required: true,
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
    const uniqueId = props.externalId || `ots-vue-imageinput-${imageInputCounter++}`;
    const id = computed(() => uniqueId);
    const fileInputRef = ref<HTMLInputElement | null>(null);
    const previewSrc = ref<string | null>(props.modelValue?.raw || null);

    const componentLabel = computed(() => LOC(props.label as TLocalisedKey) || props.label);

    watch(() => props.modelValue, (newValue) => {
      previewSrc.value = newValue?.raw || null;
       if (!newValue && fileInputRef.value) {
            fileInputRef.value.value = ''; // Clear file input if model is cleared
        }
    });

    const triggerFileInput = () => {
      if (!props.disabled && fileInputRef.value) {
        fileInputRef.value.click();
      }
    };

    const handleFileChange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const file = target.files[0];
        if (file.type === 'image/jpeg' || file.type === 'image/png') {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target?.result && typeof e.target.result === 'string') {
              const newImageValue: ImageInputValue = {
                raw: e.target.result,
                filetype: file.type === 'image/jpeg' ? 'jpg' : 'png',
              };
              previewSrc.value = newImageValue.raw;
              emit('update:modelValue', newImageValue);
            }
          };
          reader.readAsDataURL(file);
        } else {
            // Handle invalid file type if necessary
            if (fileInputRef.value) fileInputRef.value.value = ''; // Clear invalid selection
        }
      } else {
        previewSrc.value = null;
        emit('update:modelValue', null);
      }
    };

    return {
      id,
      fileInputRef,
      componentLabel,
      previewSrc,
      triggerFileInput,
      handleFileChange,
      LOC,
      AppIcons, // Make AppIcons available for v-html
    };
  },
});
</script>

<style scoped>
.image-input-config-vue {
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

.image-actuator-vue {
  display: flex;
  align-items: center;
  gap: 10px;
}

.image-preview-container-vue {
  width: 64px; /* Adjust as needed */
  height: 64px; /* Adjust as needed */
  border: 1px solid #ccc;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f8f8f8;
  border-radius: 3px;
  overflow: hidden; /* In case image is larger than container */
}

.texture-preview-vue {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.texture-preview-placeholder-vue {
  display: flex;
  flex-direction: column; /* Stack icon and text */
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 0.8em;
  color: #666;
}

.missing-icon-vue svg {
    width: 24px; /* Adjust as needed */
    height: 24px;
    fill: #999;
    margin-bottom: 4px;
}
/* Hack to make v-html work with SVG fill */
.missing-icon-vue >>> svg path {
    fill: #999;
}


.choose-file-button-vue {
  /* Using Button.vue, specific styling might not be needed unless overriding */
}

.image-input-config-vue.disabled .config-label-vue {
  color: #aaa;
}
.image-input-config-vue.disabled .image-preview-container-vue {
  opacity: 0.6;
}
</style>
