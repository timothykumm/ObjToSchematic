<template>
  <div class="layout-root">
    <div class="content-wrapper">
      <div class="column-sidebar">
        <div class="column-properties">
          <Header />
          <div class="properties-content-vue" v-if="appContextReady">
            <SettingsGroup :appContext="appContext" :disabled="!isActionEnabled('Settings')" />
            <ImportGroup :appContext="appContext" :disabled="!isActionEnabled('Import')" :isImporting="isBusy" />
            <MaterialsGroup :appContext="appContext" :disabled="!isActionEnabled('Materials')" :materials="materials" />
            <VoxeliseGroup :appContext="appContext" :disabled="!isActionEnabled('Voxelise')" :isVoxelising="isBusy" />
            <AssignGroup :appContext="appContext" :disabled="!isActionEnabled('Assign')" />
            <ExportGroup :appContext="appContext" :disabled="!isActionEnabled('Export')" />
          </div>
          <div v-else class="loading-message">
            Initializing application...
          </div>
        </div>
        <div class="column-console">
          <Console />
        </div>
      </div>
      <div class="column-canvas">
        <canvas id="canvas"></canvas>
        <Toolbar v-if="appContextReady" :appContext="appContext" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, computed, PropType, getCurrentInstance } from 'vue';
import { EAction } from '../../util';
import Header from './Header.vue';
import Console from './Console.vue';
import Toolbar from './Toolbar.vue';
import Split from 'split.js';

// Import Group Components
import SettingsGroup from '../groups/SettingsGroup.vue';
import ImportGroup from '../groups/ImportGroup.vue';
import MaterialsGroup from '../groups/MaterialsGroup.vue';
import VoxeliseGroup from '../groups/VoxeliseGroup.vue';
import AssignGroup from '../groups/AssignGroup.vue';
import ExportGroup from '../groups/ExportGroup.vue';
import { AppContext } from '../../app_context';
import { MaterialUIData } from '../types'; // Import from new types file

export default defineComponent({
  name: 'Layout',
  components: {
    Header,
    Console,
    Toolbar,
    SettingsGroup,
    ImportGroup,
    MaterialsGroup,
    VoxeliseGroup,
    AssignGroup,
    ExportGroup,
  },
  setup() {
    const isBusy = ref(false);
    const materials = ref<MaterialUIData[]>([]);
    const appContext = ref<AppContext | null>(null);
    const appContextReady = ref(false);
    const vueBridge = ref<any>(null);

    // Get the current Vue instance to access global properties
    const instance = getCurrentInstance();

    onMounted(() => {
      // Check for AppContext availability
      const checkAppContext = () => {
        if (instance?.appContext.config.globalProperties.$appContextReady) {
          appContext.value = instance.appContext.config.globalProperties.$appContext;
          appContextReady.value = true;
          vueBridge.value = appContext.value!.getVueUIBridge();
          materials.value = vueBridge.value.materials.value;
        } else {
          setTimeout(checkAppContext, 50);
        }
      };
      checkAppContext();

      // Setup Split.js when component mounts
      Split(['.column-sidebar', '.column-canvas'], {
        sizes: [30, 70],
        minSize: [300, 400],
        gutterSize: 8,
        elementStyle: (dimension, size, gutterSize) => ({
            'flex-basis': `calc(${size}% - ${gutterSize}px)`,
        }),
        gutterStyle: (dimension, gutterSize) => ({
            'flex-basis': `${gutterSize}px`,
        }),
      });
      Split(['.column-properties', '.column-console'], {
        sizes: [80, 20],
        minSize: [200, 100],
        direction: 'vertical',
        gutterSize: 8,
        elementStyle: (dimension, size, gutterSize) => ({
            'height': `calc(${size}% - ${gutterSize}px)`,
        }),
        gutterStyle: (dimension, gutterSize) => ({
            'height': `${gutterSize}px`,
        }),
      });
    });

    // Computed properties for action enablement
    const actionsEnabled = computed(() => {
      if (!vueBridge.value) return {};
      
      // Access the reactive enabledActions directly to ensure reactivity
      const bridge = vueBridge.value;
      return {
        Settings: bridge.enabledActions[EAction.Settings],
        Import: bridge.enabledActions[EAction.Import],
        Materials: bridge.enabledActions[EAction.Materials],
        Voxelise: bridge.enabledActions[EAction.Voxelise],
        Assign: bridge.enabledActions[EAction.Assign],
        Export: bridge.enabledActions[EAction.Export],
      };
    });

    // Function to check if an action is enabled
    const isActionEnabled = (actionName: string) => {
      return actionsEnabled.value[actionName as keyof typeof actionsEnabled.value] || false;
    };

    // Expose to template
    return {
        isBusy,
        materials,
        appContext,
        appContextReady,
        vueBridge,
        actionsEnabled,
        isActionEnabled,
    };
  },
});
</script>

<style scoped>
/* Basic layout styling, adapt from original styles.css */
.layout-root {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.content-wrapper {
  display: flex;
  flex-direction: row;
  flex-grow: 1;
  overflow: hidden;
  width: 100%;
}

.column-sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f8f9fa;
  overflow: hidden;
}

.column-properties {
  overflow-y: auto;
  /* padding: 10px; */ /* Padding moved to .properties-content-vue */
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.properties-content-vue {
  padding: 10px;
  flex-grow: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* Common styles for groups, now in Layout.vue's scope */
/* Using :deep() for scoped styles to affect child components */
:deep(.group-heading-vue) {
  font-size: 1.1em;
  font-weight: bold;
  margin-bottom: 10px;
  padding-bottom: 5px;
  border-bottom: 1px solid #ccc;
  text-align: left;
}

:deep(.group-components-vue) {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

:deep(.group-exec-button-vue) {
  margin-top: 15px;
}

.loading-message {
  padding: 20px;
  text-align: center;
  color: #666;
  font-style: italic;
}

.column-console {
  min-height: 50px;
  background-color: #343a40;
  color: white;
  padding: 10px;
  overflow-y: auto;
  flex-shrink: 0;
}

.column-canvas {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #e9ecef;
  position: relative;
  overflow: hidden;
}

#canvas {
  flex-grow: 1;
  display: block;
  width: 100%;
}


.gutter {
  background-color: #adb5bd;
  background-repeat: no-repeat;
  background-position: 50%;
  z-index: 100;
}

.gutter.gutter-horizontal {
  cursor: ew-resize;
}

.gutter.gutter-vertical {
  cursor: ns-resize;
}
</style>
