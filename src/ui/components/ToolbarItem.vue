<template>
  <div 
    :class="['toolbar-item', { 'active': isActive, 'disabled': !isEnabled }]"
    @click="handleClick"
    :title="tooltip"
  >
    <div v-html="iconSVG" class="toolbar-icon"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  name: 'ToolbarItem',
  props: {
    iconSVG: {
      type: String,
      required: true
    },
    isActive: {
      type: Boolean,
      default: false
    },
    isEnabled: {
      type: Boolean,
      default: true
    },
    tooltip: {
      type: String,
      default: ''
    },
    onClick: {
      type: Function as PropType<() => void>,
      required: true
    }
  },
  setup(props) {
    const handleClick = () => {
      if (props.isEnabled) {
        props.onClick();
      }
    };

    return {
      handleClick
    };
  }
});
</script>

<style scoped>
.toolbar-item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background-color: rgba(248, 249, 250, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.toolbar-item:hover:not(.disabled) {
  background-color: rgba(248, 249, 250, 1);
  border-color: rgba(0, 0, 0, 0.2);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toolbar-item.active {
  background-color: rgba(0, 123, 255, 0.1);
  border-color: rgba(0, 123, 255, 0.3);
}

.toolbar-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toolbar-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.toolbar-icon :deep(svg) {
  width: 16px;
  height: 16px;
  fill: currentColor;
}

.active .toolbar-icon :deep(svg) {
  fill: #007bff;
}

.disabled .toolbar-icon :deep(svg) {
  fill: #6c757d;
}
</style>