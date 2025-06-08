<template>
  <div class="config-component-vue file-input-config-vue" :class="{ 'disabled': disabled }">
    <div class="config-label-vue">
      {{ componentLabel }}
    </div>
    <div class="config-actuator-vue">
      <div
        class="file-input-display-vue struct-prop-vue"
        :class="{ 'hovered': isHovered, 'disabled': disabled }"
        @click="triggerFileInput"
        @mouseenter="isHovered = true"
        @mouseleave="isHovered = false"
        role="button"
        tabindex="0"
        :aria-disabled="disabled"
      >
        <input
          type="file"
          :accept="accept"
          style="display: none;"
          :id="id"
          ref="fileInputRef"
          @change="handleFileChange"
          :disabled="disabled"
        />
        <span v-if="fileName" class="file-name-vue">{{ fileName }}</span>
        <i v-else class="no-file-vue">{{ LOC('import.components.no_file_chosen') }}</i>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, PropType, watch } from 'vue'; // Added watch
import { LOC, TLocalisedKey } from '../../localiser'; // Assuming path

let fileInputCounter = 0;

export default defineComponent({
  name: 'FileInput',
  props: {
    modelValue: { // For v-model (File object)
      type: Object as PropType<File | null>,
      default: null,
    },
    label: {
      type: String as PropType<TLocalisedKey | string>,
      required: true,
    },
    accept: { // File types to accept
      type: String,
      default: '.obj,.glb,.gltf', // Added .gltf as it's common with .glb
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
    const uniqueId = props.externalId || `ots-vue-fileinput-${fileInputCounter++}`;
    const id = computed(() => uniqueId);
    const fileInputRef = ref<HTMLInputElement | null>(null);
    const isHovered = ref(false);
    const internalFileName = ref<string | null>(props.modelValue?.name || null);

    const componentLabel = computed(() => LOC(props.label as TLocalisedKey) || props.label);
    const fileName = computed(() => internalFileName.value);

    const triggerFileInput = () => {
      if (!props.disabled && fileInputRef.value) {
        fileInputRef.value.click();
      }
    };

    const handleFileChange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const file = target.files[0];
        internalFileName.value = file.name;
        emit('update:modelValue', file);
      } else {
        internalFileName.value = null;
        emit('update:modelValue', null);
      }
    };

    // Watch for external changes to modelValue (e.g. if parent clears the file)
    watch(() => props.modelValue, (newFile) => {
        internalFileName.value = newFile?.name || null;
        // Reset the actual file input if the model is cleared externally
        if (!newFile && fileInputRef.value) {
            fileInputRef.value.value = '';
        }
    });

    return {
      id,
      fileInputRef,
      isHovered,
      componentLabel,
      fileName,
      triggerFileInput,
      handleFileChange,
      LOC,
    };
  },
});
</script>

<style scoped>
.file-input-config-vue {
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

.config-actuator-vue {
  min-width: 150px; /* Adjust as needed */
}

.file-input-display-vue {
  /* Mimicking .input-file.struct-prop from original */
  border: 1px solid #ccc; /* Example */
  background-color: #f8f8f8; /* Example */
  padding: 6px 10px;
  border-radius: 3px;
  text-align: center;
  cursor: pointer;
  transition: background-color 0.2s, border-color 0.2s;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-input-display-vue.hovered:not(.disabled) {
  border-color: #888; /* Example hover */
  background-color: #f0f0f0; /* Example hover */
}

.file-input-display-vue.disabled {
  background-color: #e9e9e9;
  color: #a0a0a0;
  cursor: not-allowed;
  border-color: #c0c0c0;
}

.file-name-vue {
  /* Style for the displayed file name */
}

.no-file-vue {
  font-style: italic;
  color: #666; /* Example */
}

.file-input-config-vue.disabled .config-label-vue {
  color: #aaa;
}
</style>
