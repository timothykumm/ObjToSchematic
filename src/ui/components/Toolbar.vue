<template>
  <div class="toolbar">
    <div class="toolbar-left">
      <!-- View Mode Group -->
      <div class="toolbar-group">
        <ToolbarItem
          :iconSVG="icons.MESH"
          :isActive="viewMode === 'mesh'"
          :isEnabled="true"
          :tooltip="'View triangle mesh'"
          :onClick="() => setViewMode('mesh')"
        />
        <ToolbarItem
          :iconSVG="icons.VOXEL"
          :isActive="viewMode === 'voxel'"
          :isEnabled="true"
          :tooltip="'View voxel mesh'"
          :onClick="() => setViewMode('voxel')"
        />
        <ToolbarItem
          :iconSVG="icons.BLOCK"
          :isActive="viewMode === 'block'"
          :isEnabled="true"
          :tooltip="'View block mesh'"
          :onClick="() => setViewMode('block')"
        />
      </div>

      <!-- Debug Group -->
      <div class="toolbar-group">
        <ToolbarItem
          :iconSVG="icons.GRID"
          :isActive="debugMode.grid"
          :isEnabled="true"
          :tooltip="'Toggle grid'"
          :onClick="() => toggleDebug('grid')"
        />
        <ToolbarItem
          :iconSVG="icons.AXES"
          :isActive="debugMode.axes"
          :isEnabled="true"
          :tooltip="'Toggle axes'"
          :onClick="() => toggleDebug('axes')"
        />
        <ToolbarItem
          :iconSVG="icons.BULB"
          :isActive="debugMode.nightVision"
          :isEnabled="true"
          :tooltip="'Toggle night vision'"
          :onClick="() => toggleDebug('nightVision')"
        />
      </div>

      <!-- Slice Group -->
      <div class="toolbar-group">
        <ToolbarItem
          :iconSVG="icons.SLICE"
          :isActive="sliceMode.enabled"
          :isEnabled="true"
          :tooltip="'Toggle slice viewer'"
          :onClick="() => toggleSlice()"
        />
        <ToolbarItem
          :iconSVG="icons.PLUS"
          :isActive="false"
          :isEnabled="sliceMode.enabled"
          :tooltip="'Increment slice height'"
          :onClick="() => adjustSlice(1)"
        />
        <ToolbarItem
          :iconSVG="icons.MINUS"
          :isActive="false"
          :isEnabled="sliceMode.enabled"
          :tooltip="'Decrement slice height'"
          :onClick="() => adjustSlice(-1)"
        />
      </div>
    </div>

    <div class="toolbar-right">
      <!-- Camera Group -->
      <div class="toolbar-group">
        <ToolbarItem
          :iconSVG="icons.PERSPECTIVE"
          :isActive="cameraMode === 'perspective'"
          :isEnabled="true"
          :tooltip="'Perspective camera'"
          :onClick="() => setCameraMode('perspective')"
        />
        <ToolbarItem
          :iconSVG="icons.ORTHOGRAPHIC"
          :isActive="cameraMode === 'orthographic'"
          :isEnabled="true"
          :tooltip="'Orthographic camera'"
          :onClick="() => setCameraMode('orthographic')"
        />
      </div>

      <!-- Zoom Group -->
      <div class="toolbar-group">
        <ToolbarItem
          :iconSVG="icons.MINUS"
          :isActive="false"
          :isEnabled="true"
          :tooltip="'Zoom out'"
          :onClick="() => zoom('out')"
        />
        <ToolbarItem
          :iconSVG="icons.PLUS"
          :isActive="false"
          :isEnabled="true"
          :tooltip="'Zoom in'"
          :onClick="() => zoom('in')"
        />
        <ToolbarItem
          :iconSVG="icons.CENTRE"
          :isActive="false"
          :isEnabled="true"
          :tooltip="'Reset camera'"
          :onClick="() => resetCamera()"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, PropType } from 'vue';
import ToolbarItem from './ToolbarItem.vue';
import { AppContext } from '../../app_context';

export default defineComponent({
  name: 'Toolbar',
  components: {
    ToolbarItem
  },
  props: {
    appContext: {
      type: Object as PropType<AppContext>,
      required: true
    }
  },
  setup(props) {
    // State
    const viewMode = ref<'mesh' | 'voxel' | 'block'>('mesh');
    const cameraMode = ref<'perspective' | 'orthographic'>('perspective');
    const debugMode = ref({
      grid: false,
      axes: false,
      nightVision: false
    });
    const sliceMode = ref({
      enabled: false,
      height: 0
    });

    // Icons - these would need to be imported from the actual icons file
    const icons = {
      MESH: '<svg width="16" height="16" viewBox="0 0 16 16"><circle cx="3" cy="3" r="1"/><circle cx="8" cy="3" r="1"/><circle cx="13" cy="3" r="1"/><circle cx="3" cy="8" r="1"/><circle cx="8" cy="8" r="1"/><circle cx="13" cy="8" r="1"/><circle cx="3" cy="13" r="1"/><circle cx="8" cy="13" r="1"/><circle cx="13" cy="13" r="1"/></svg>',
      VOXEL: '<svg width="16" height="16" viewBox="0 0 16 16"><rect x="2" y="2" width="5" height="5" fill="none" stroke="currentColor"/><rect x="9" y="2" width="5" height="5" fill="none" stroke="currentColor"/><rect x="2" y="9" width="5" height="5" fill="none" stroke="currentColor"/><rect x="9" y="9" width="5" height="5" fill="none" stroke="currentColor"/></svg>',
      BLOCK: '<svg width="16" height="16" viewBox="0 0 16 16"><rect x="2" y="2" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
      GRID: '<svg width="16" height="16" viewBox="0 0 16 16"><path d="M1 2.5h14m-14 3h14m-14 3h14m-14 3h14M2.5 1v14m3-14v14m3-14v14m3-14v14" stroke="currentColor" fill="none"/></svg>',
      AXES: '<svg width="16" height="16" viewBox="0 0 16 16"><path d="M8 1v14M1 8h14" stroke="currentColor" stroke-width="2"/><path d="M11 5l3 3-3 3M5 11l-3-3 3-3" stroke="currentColor" fill="none"/></svg>',
      BULB: '<svg width="16" height="16" viewBox="0 0 16 16"><path d="M8 2a4 4 0 0 1 4 4c0 1.5-.8 2.8-2 3.5V12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-2.5C4.8 8.8 4 7.5 4 6a4 4 0 0 1 4-4z"/></svg>',
      SLICE: '<svg width="16" height="16" viewBox="0 0 16 16"><path d="M2 8h12M8 2v12" stroke="currentColor" stroke-width="2"/></svg>',
      PLUS: '<svg width="16" height="16" viewBox="0 0 16 16"><path d="M8 2v12M2 8h12" stroke="currentColor" stroke-width="2"/></svg>',
      MINUS: '<svg width="16" height="16" viewBox="0 0 16 16"><path d="M2 8h12" stroke="currentColor" stroke-width="2"/></svg>',
      PERSPECTIVE: '<svg width="16" height="16" viewBox="0 0 16 16"><path d="M2 2l6 12 6-12z" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
      ORTHOGRAPHIC: '<svg width="16" height="16" viewBox="0 0 16 16"><rect x="2" y="2" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
      CENTRE: '<svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="2" fill="currentColor"/><circle cx="8" cy="8" r="6" fill="none" stroke="currentColor"/></svg>'
    };

    // Actions
    const setViewMode = (mode: 'mesh' | 'voxel' | 'block') => {
      viewMode.value = mode;
      // TODO: Call AppContext renderer methods
      console.log('Set view mode:', mode);
    };

    const setCameraMode = (mode: 'perspective' | 'orthographic') => {
      cameraMode.value = mode;
      // TODO: Call AppContext camera methods
      console.log('Set camera mode:', mode);
    };

    const toggleDebug = (type: 'grid' | 'axes' | 'nightVision') => {
      debugMode.value[type] = !debugMode.value[type];
      // TODO: Call AppContext debug methods
      console.log('Toggle debug:', type, debugMode.value[type]);
    };

    const toggleSlice = () => {
      sliceMode.value.enabled = !sliceMode.value.enabled;
      // TODO: Call AppContext slice methods
      console.log('Toggle slice:', sliceMode.value.enabled);
    };

    const adjustSlice = (delta: number) => {
      sliceMode.value.height += delta;
      // TODO: Call AppContext slice adjustment methods
      console.log('Adjust slice:', sliceMode.value.height);
    };

    const zoom = (direction: 'in' | 'out') => {
      // TODO: Call AppContext zoom methods
      console.log('Zoom:', direction);
    };

    const resetCamera = () => {
      // TODO: Call AppContext reset camera method
      console.log('Reset camera');
    };

    return {
      viewMode,
      cameraMode,
      debugMode,
      sliceMode,
      icons,
      setViewMode,
      setCameraMode,
      toggleDebug,
      toggleSlice,
      adjustSlice,
      zoom,
      resetCamera
    };
  }
});
</script>

<style scoped>
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

.toolbar-left,
.toolbar-right {
  display: flex;
  gap: 10px;
  pointer-events: all;
}

.toolbar-right {
  flex-direction: column;
  align-items: flex-end;
}

.toolbar-group {
  display: flex;
  gap: 2px;
  background-color: rgba(248, 249, 250, 0.85);
  padding: 4px;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(4px);
}
</style>