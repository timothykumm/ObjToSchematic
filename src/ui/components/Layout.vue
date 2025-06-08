<template>
  <div class="layout-root">
    <div class="content-wrapper">
      <div class="column-sidebar">
        <div class="column-properties">
          <Header />
          <div class="properties-content-vue">
            <SettingsGroup :appContext="appContext" :disabled="isBusy" />
            <ImportGroup :appContext="appContext" :disabled="isBusy" :isImporting="isBusy" />
            <MaterialsGroup :appContext="appContext" :disabled="isBusy" :materials="materials" />
            <VoxeliseGroup :appContext="appContext" :disabled="isBusy" :isVoxelising="isBusy" />
            <AssignGroup :appContext="appContext" :disabled="isBusy" />
            <ExportGroup :appContext="appContext" :disabled="isBusy" />
          </div>
        </div>
        <div class="column-console">
          <p>Console output will appear here.</p>
        </div>
      </div>
      <div class="column-canvas">
        <canvas id="app-canvas"></canvas> <!-- Renamed to avoid conflict if old canvas is still in DOM -->
        <div class="toolbar">
          <!-- Placeholder for toolbar items from layout.ts -->
          <div class="toolbar-left-vue">
            <div class="toolbar-group-vue">
              <span>MESH</span> | <span>VOXEL</span> | <span>BLOCK</span>
            </div>
            <div class="toolbar-group-vue">
              <span>GRID</span> | <span>AXES</span> | <span>NIGHT</span>
            </div>
            <div class="toolbar-group-vue">
              <span>SLICE</span> | <span>PLUS</span> | <span>MINUS</span>
            </div>
          </div>
          <div class="toolbar-right-vue">
            <div class="toolbar-group-vue">
              <span>PERSP</span> | <span>ORTHO</span>
            </div>
            <div class="toolbar-group-vue">
              <span>ZOOM-</span> | <span>ZOOM+</span> | <span>RESET</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, computed, PropType } from 'vue';
import Header from './Header.vue';
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
    SettingsGroup,
    ImportGroup,
    MaterialsGroup,
    VoxeliseGroup,
    AssignGroup,
    ExportGroup,
  },
  props: {
    appContext: {
        type: Object as PropType<AppContext>,
        required: true,
    }
  },
  setup(props) {
    const isBusy = ref(false);
    const materials = ref<MaterialUIData[]>([]);

    onMounted(() => {
        // TODO: Implement a way for AppContext to provide materials reactively.
        // For example, AppContext could emit an event or provide a reactive getter.
        // if (props.appContext) {
        //   props.appContext.on('materialsUpdated', (newMaterials) => {
        //     materials.value = newMaterials;
        //   });
        //   materials.value = props.appContext.getInitialMaterials(); // Hypothetical
        // }
        // console.log("Layout.vue: TODO: Load materials from appContext into reactive 'materials' ref");

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

    // Expose to template
    return {
        isBusy,
        materials,
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

#app-canvas {
  flex-grow: 1;
  display: block;
  width: 100%;
}

.toolbar {
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  display: flex;
  justify-content: space-between;
  pointer-events: none;
  z-index: 20;
}

.toolbar-left-vue, .toolbar-right-vue {
  display: flex;
  gap: 10px;
  pointer-events: all;
}

.toolbar-right-vue {
  flex-direction: column;
  align-items: flex-end;
}

.toolbar-group-vue {
  background-color: rgba(248, 249, 250, 0.85);
  padding: 8px;
  border-radius: 4px;
  display: flex;
  gap: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.toolbar-group-vue span {
  cursor: pointer;
  padding: 2px 4px;
}
.toolbar-group-vue span:hover {
  background-color: rgba(0,0,0,0.1);
  border-radius: 2px;
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
