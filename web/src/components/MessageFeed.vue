<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

export interface Message {
  messageId: string
  fromAgent: string
  toAgent: string
  messageType: 'task' | 'result' | 'status' | 'error'
  preview: string
  timestamp: string
}

const props = defineProps<{
  messages: Message[]
}>()

const feedRef = ref<HTMLElement | null>(null)

// Auto-scroll to bottom when new messages arrive
watch(
  () => props.messages.length,
  async () => {
    await nextTick()
    if (feedRef.value) {
      feedRef.value.scrollTop = feedRef.value.scrollHeight
    }
  }
)

// Truncate agent IDs
const shortId = (id: string) => id.slice(0, 8)

// Message type icons and colors
const typeConfig: Record<Message['messageType'], { icon: string; color: string }> = {
  task: { icon: '→', color: 'text-blue-400' },
  result: { icon: '✓', color: 'text-green-400' },
  status: { icon: 'ℹ', color: 'text-yellow-400' },
  error: { icon: '✗', color: 'text-red-400' },
}

// Format timestamp
const formatTime = (iso: string) => {
  const date = new Date(iso)
  return date.toLocaleTimeString()
}
</script>

<template>
  <div class="message-feed">
    <div class="feed-header">
      <h3>Messages</h3>
      <span class="count">{{ messages.length }}</span>
    </div>

    <div ref="feedRef" class="feed-content">
      <div
        v-for="msg in messages"
        :key="msg.messageId"
        class="message-item"
      >
        <div class="message-header">
          <span :class="['type-icon', typeConfig[msg.messageType].color]">
            {{ typeConfig[msg.messageType].icon }}
          </span>
          <span class="agents">
            {{ shortId(msg.fromAgent) }} → {{ shortId(msg.toAgent) }}
          </span>
          <span class="timestamp">{{ formatTime(msg.timestamp) }}</span>
        </div>
        <div class="message-preview">{{ msg.preview }}</div>
      </div>

      <div v-if="messages.length === 0" class="empty-state">
        No messages yet
      </div>
    </div>
  </div>
</template>

<style scoped>
.message-feed {
  background: #1e1e2e;
  border: 1px solid #313244;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.feed-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #313244;
}

.feed-header h3 {
  margin: 0;
  font-size: 0.95em;
  color: #cdd6f4;
}

.count {
  background: #313244;
  color: #6c7086;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8em;
}

.feed-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.message-item {
  background: #181825;
  border-radius: 6px;
  padding: 10px 12px;
  margin-bottom: 8px;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 0.85em;
}

.type-icon {
  font-weight: bold;
}

.agents {
  font-family: monospace;
  color: #cdd6f4;
}

.timestamp {
  margin-left: auto;
  color: #6c7086;
  font-size: 0.9em;
}

.message-preview {
  color: #a6adc8;
  font-size: 0.9em;
  line-height: 1.4;
  word-break: break-word;
}

.empty-state {
  text-align: center;
  color: #6c7086;
  padding: 32px;
  font-style: italic;
}

/* Colors */
.text-blue-400 { color: #89b4fa; }
.text-green-400 { color: #a6e3a1; }
.text-yellow-400 { color: #f9e2af; }
.text-red-400 { color: #f38ba8; }
</style>
