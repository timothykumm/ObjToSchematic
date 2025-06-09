<template>
  <div class="console-container">
    <div ref="consoleMessages" class="console-messages">
      <div 
        v-for="(message, index) in messages" 
        :key="index" 
        :class="['console-message', `console-${message.type}`]"
      >
        [{{ getMessagePrefix(message.type) }}]: {{ message.text }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, nextTick, onMounted, onUnmounted } from 'vue';
import { TLocalisedString } from '../../localiser';

export type TMessage = { text: TLocalisedString, type: 'success' | 'info' | 'warning' | 'error' };

export default defineComponent({
  name: 'Console',
  setup() {
    const messages = ref<TMessage[]>([]);
    const consoleMessages = ref<HTMLDivElement>();

    const getMessagePrefix = (type: TMessage['type']): string => {
      switch (type) {
        case 'success': return 'OKAY';
        case 'info': return 'INFO';
        case 'warning': return 'WARN';
        case 'error': return 'UHOH';
      }
    };

    const addMessage = (message: TMessage) => {
      messages.value.push(message);
      nextTick(() => {
        scrollToBottom();
      });
    };

    const scrollToBottom = () => {
      if (consoleMessages.value) {
        consoleMessages.value.scrollTop = consoleMessages.value.scrollHeight;
      }
    };

    // Static methods to match the original AppConsole interface
    const success = (text: TLocalisedString) => {
      addMessage({ text, type: 'success' });
    };

    const info = (text: TLocalisedString) => {
      addMessage({ text, type: 'info' });
    };

    const warning = (text: TLocalisedString) => {
      addMessage({ text, type: 'warning' });
    };

    const error = (text: TLocalisedString) => {
      addMessage({ text, type: 'error' });
    };

    // Expose methods globally so AppConsole can use them
    onMounted(() => {
      // Store reference for AppConsole to use
      (window as any).__vueConsole = {
        success,
        info,
        warning,
        error,
        addMessage
      };
    });

    onUnmounted(() => {
      delete (window as any).__vueConsole;
    });

    return {
      messages,
      consoleMessages,
      getMessagePrefix,
      addMessage,
      success,
      info,
      warning,
      error
    };
  }
});
</script>

<style scoped>
.console-container {
  height: 100%;
  width: 100%;
  background-color: #343a40;
  color: white;
  overflow: hidden;
}

.console-messages {
  height: 100%;
  padding: 5px;
  overflow-y: auto;
  white-space: nowrap;
}

.console-message {
  display: block;
  margin-bottom: 2px;
  font-family: monospace;
  font-size: 12px;
}

.console-success {
  color: #28a745;
}

.console-info {
  color: #17a2b8;
}

.console-warning {
  color: #ffc107;
}

.console-error {
  color: #dc3545;
}
</style>