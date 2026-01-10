<script setup lang="ts">
import { computed } from 'vue'

export interface Checkpoint {
  checkpointId: string
  agentId: string
  phase: string
  timestamp: string
}

const props = defineProps<{
  checkpoints: Checkpoint[]
}>()

// Sort checkpoints newest first
const sortedCheckpoints = computed(() =>
  [...props.checkpoints].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )
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
        :class="['checkpoint-item', { 'is-kill': isKillCheckpoint(cp.phase) }]"
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
  background: #1e1e2e;
  border: 1px solid #313244;
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
  border-bottom: 1px solid #313244;
}

.timeline-header h3 {
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

.timeline-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
}

.checkpoint-item {
  display: flex;
  gap: 12px;
  padding: 8px 0;
  border-left: 2px solid #313244;
  margin-left: 4px;
  padding-left: 16px;
  position: relative;
}

.checkpoint-item.is-kill {
  border-left-color: #f38ba8;
}

.checkpoint-dot {
  position: absolute;
  left: -5px;
  top: 12px;
  width: 8px;
  height: 8px;
  background: #45475a;
  border-radius: 50%;
}

.checkpoint-item.is-kill .checkpoint-dot {
  background: #f38ba8;
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
  font-family: monospace;
  color: #89b4fa;
  font-size: 0.85em;
}

.timestamp {
  color: #6c7086;
  font-size: 0.8em;
}

.checkpoint-phase {
  color: #a6adc8;
  font-size: 0.9em;
}

.checkpoint-item.is-kill .checkpoint-phase {
  color: #f38ba8;
}

.empty-state {
  text-align: center;
  color: #6c7086;
  padding: 32px;
  font-style: italic;
}
</style>
