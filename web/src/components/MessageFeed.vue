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

// Track which message should flash (newest one)
const flashMessageId = ref<string | null>(null)

// Auto-scroll to bottom when new messages arrive + flash highlight
watch(
  () => props.messages.length,
  async (newLen, oldLen) => {
    await nextTick()
    if (feedRef.value) {
      feedRef.value.scrollTop = feedRef.value.scrollHeight
    }
    // Flash the newest message
    if (newLen > (oldLen ?? 0) && props.messages.length > 0) {
      const newest = props.messages[props.messages.length - 1]
      if (newest) {
        flashMessageId.value = newest.messageId
        setTimeout(() => {
          flashMessageId.value = null
        }, 900)
      }
    }
  }
)

// Truncate agent IDs
const shortId = (id: string) => id.slice(0, 8)

// Message type icons and colors
const typeConfig: Record<Message['messageType'], { icon: string; class: string }> = {
  task: { icon: '→', class: 'type-task' },
  result: { icon: '✓', class: 'type-result' },
  status: { icon: 'ℹ', class: 'type-status' },
  error: { icon: '✗', class: 'type-error' },
}

// Format timestamp
const formatTime = (iso: string) => {
  const date = new Date(iso)
  return date.toLocaleTimeString()
}
</script>

<template>
  <div class="message-feed">
    <div ref="feedRef" class="feed-content">
      <div
        v-for="msg in messages"
        :key="msg.messageId"
        :class="['message-item', { flash: flashMessageId === msg.messageId }]"
      >
        <div class="message-header">
          <span :class="['type-icon', typeConfig[msg.messageType].class]">
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
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.feed-content {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  min-height: 0;
}

.message-item {
  background: var(--ctp-mantle);
  border: 1px solid transparent;
  border-radius: 6px;
  padding: 10px 12px;
  margin-bottom: 8px;
  animation: fadeInUp 0.2s ease-out;
  transition: background 0.3s ease, border-color 0.3s ease;
}

/* Flash highlight for newest message */
.message-item.flash {
  animation: flashIn 0.9s ease-out;
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

/* Type-specific colors using CSS variables */
.type-icon.type-task { color: var(--ctp-blue); }
.type-icon.type-result { color: var(--ctp-green); }
.type-icon.type-status { color: var(--ctp-yellow); }
.type-icon.type-error { color: var(--ctp-red); }

.agents {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  color: var(--ctp-text);
}

.timestamp {
  margin-left: auto;
  color: var(--ctp-overlay0);
  font-size: 0.9em;
}

.message-preview {
  color: var(--ctp-subtext0);
  font-size: 0.9em;
  line-height: 1.4;
  word-break: break-word;
}

.empty-state {
  text-align: center;
  color: var(--ctp-overlay0);
  padding: 32px;
  font-style: italic;
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes flashIn {
  0% {
    background: rgba(137, 180, 250, 0.14);
    border-color: rgba(137, 180, 250, 0.45);
  }
  100% {
    background: var(--ctp-mantle);
    border-color: transparent;
  }
}

/* Respect reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  .message-item {
    animation: none;
  }
  .message-item.flash {
    animation: none;
    background: rgba(137, 180, 250, 0.14);
  }
}
</style>
