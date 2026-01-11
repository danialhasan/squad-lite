<script setup lang="ts">
import { ref, computed, watch } from 'vue'

export interface Checkpoint {
  checkpointId: string
  agentId: string
  phase: string
  timestamp: string
}

const props = defineProps<{
  checkpoints: Checkpoint[]
}>()

// Track which checkpoint should flash (newest one)
const flashCheckpointId = ref<string | null>(null)

// Sort checkpoints newest first
const sortedCheckpoints = computed(() =>
  [...props.checkpoints].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )
)

// Flash highlight when new checkpoint arrives
watch(
  () => props.checkpoints.length,
  (newLen, oldLen) => {
    if (newLen > (oldLen ?? 0) && sortedCheckpoints.value.length > 0) {
      // Flash the newest checkpoint (first in sorted order)
      const newest = sortedCheckpoints.value[0]
      if (newest) {
        flashCheckpointId.value = newest.checkpointId
        setTimeout(() => {
          flashCheckpointId.value = null
        }, 900)
      }
    }
  }
)

// Truncate IDs
const shortId = (id: string) => id.slice(0, 8)

// Format timestamp
const formatTime = (iso: string) => {
  const date = new Date(iso)
  return date.toLocaleTimeString()
}

// Check if checkpoint is a "kill" checkpoint (phase contains kill/error)
const isKillCheckpoint = (phase: string) =>
  phase.toLowerCase().includes('kill') ||
  phase.toLowerCase().includes('error') ||
  phase.toLowerCase().includes('interrupt')
</script>

<template>
  <div class="checkpoint-timeline">
    <div class="timeline-header">
      <h3>Checkpoints</h3>
      <span class="count">{{ checkpoints.length }}</span>
    </div>

    <div class="timeline-content">
      <div
        v-for="cp in sortedCheckpoints"
        :key="cp.checkpointId"
        :class="['checkpoint-item', { 'is-kill': isKillCheckpoint(cp.phase), flash: flashCheckpointId === cp.checkpointId }]"
      >
        <div class="checkpoint-dot"></div>
        <div class="checkpoint-info">
          <div class="checkpoint-header">
            <span class="agent-id">{{ shortId(cp.agentId) }}</span>
            <span class="timestamp">{{ formatTime(cp.timestamp) }}</span>
          </div>
          <div class="checkpoint-phase">{{ cp.phase }}</div>
        </div>
      </div>

      <div v-if="checkpoints.length === 0" class="empty-state">
        No checkpoints yet
      </div>
    </div>
  </div>
</template>

<style scoped>
.checkpoint-timeline {
  background: var(--ctp-base);
  border: 1px solid var(--ctp-surface0);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--ctp-surface0);
}

.timeline-header h3 {
  margin: 0;
  font-size: 0.95em;
  color: var(--ctp-text);
}

.count {
  background: var(--ctp-surface0);
  color: var(--ctp-overlay0);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8em;
}

.timeline-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
}

.checkpoint-item {
  display: flex;
  gap: 12px;
  padding: 8px 0;
  border-left: 2px solid var(--ctp-surface0);
  margin-left: 4px;
  padding-left: 16px;
  position: relative;
  animation: fadeInUp 0.2s ease-out;
  transition: border-color 0.3s ease;
}

/* Flash highlight for newest checkpoint */
.checkpoint-item.flash {
  animation: flashIn 0.9s ease-out;
}

.checkpoint-item.is-kill {
  border-left-color: var(--ctp-red);
}

.checkpoint-dot {
  position: absolute;
  left: -5px;
  top: 12px;
  width: 8px;
  height: 8px;
  background: var(--ctp-surface1);
  border-radius: 50%;
  transition: background 0.2s ease;
}

.checkpoint-item.is-kill .checkpoint-dot {
  background: var(--ctp-red);
}

.checkpoint-info {
  flex: 1;
}

.checkpoint-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.agent-id {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  color: var(--ctp-blue);
  font-size: 0.85em;
}

.timestamp {
  color: var(--ctp-overlay0);
  font-size: 0.8em;
}

.checkpoint-phase {
  color: var(--ctp-subtext0);
  font-size: 0.9em;
}

.checkpoint-item.is-kill .checkpoint-phase {
  color: var(--ctp-red);
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
    border-left-color: rgba(137, 180, 250, 0.65);
  }
  100% {
    background: transparent;
    border-left-color: var(--ctp-surface0);
  }
}

/* Respect reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  .checkpoint-item {
    animation: none;
  }
  .checkpoint-item.flash {
    animation: none;
    background: rgba(137, 180, 250, 0.14);
  }
}
</style>
