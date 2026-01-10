<script setup lang="ts">
import { computed } from 'vue'
import type { AgentResponse, AgentStatus, SandboxStatus } from '@/types'

const props = defineProps<{
  agent: AgentResponse
}>()

const emit = defineEmits<{
  kill: [agentId: string]
  restart: [agentId: string]
}>()

// Truncate UUID for display
const shortId = computed(() => props.agent.agentId.slice(0, 8))

// Status color mapping
const statusColor = computed(() => {
  const colors: Record<AgentStatus, string> = {
    idle: 'bg-gray-500',
    working: 'bg-blue-500 animate-pulse',
    waiting: 'bg-yellow-500',
    completed: 'bg-green-500',
    error: 'bg-red-500',
  }
  return colors[props.agent.status]
})

// Sandbox status color
const sandboxColor = computed(() => {
  const colors: Record<SandboxStatus, string> = {
    none: 'text-gray-400',
    active: 'text-green-400',
    paused: 'text-yellow-400',
    killed: 'text-red-400',
  }
  return colors[props.agent.sandboxStatus]
})

// Format timestamp
const formatTime = (iso: string) => {
  const date = new Date(iso)
  return date.toLocaleTimeString()
}

// Is agent killable?
const canKill = computed(() =>
  props.agent.status !== 'completed' &&
  props.agent.status !== 'error' &&
  props.agent.sandboxStatus !== 'killed'
)

// Is agent restartable?
const canRestart = computed(() =>
  props.agent.sandboxStatus === 'killed' ||
  props.agent.status === 'error'
)

const handleKill = () => emit('kill', props.agent.agentId)
const handleRestart = () => emit('restart', props.agent.agentId)
</script>

<template>
  <div class="agent-card">
    <!-- Header -->
    <div class="card-header">
      <div class="agent-info">
        <span :class="['status-dot', statusColor]"></span>
        <span class="agent-type">{{ agent.type }}</span>
        <span class="agent-id">{{ shortId }}</span>
      </div>
      <span :class="['sandbox-status', sandboxColor]">
        {{ agent.sandboxStatus }}
      </span>
    </div>

    <!-- Body -->
    <div class="card-body">
      <div class="stat-row">
        <span class="label">Status:</span>
        <span class="value">{{ agent.status }}</span>
      </div>
      <div class="stat-row">
        <span class="label">Sandbox:</span>
        <span class="value">{{ agent.sandboxId?.slice(0, 8) || 'none' }}</span>
      </div>
      <div class="stat-row">
        <span class="label">Heartbeat:</span>
        <span class="value">{{ formatTime(agent.lastHeartbeat) }}</span>
      </div>
    </div>

    <!-- Actions -->
    <div class="card-actions">
      <button
        v-if="canKill"
        class="btn btn-kill"
        @click="handleKill"
      >
        Kill
      </button>
      <button
        v-if="canRestart"
        class="btn btn-restart"
        @click="handleRestart"
      >
        Restart
      </button>
    </div>
  </div>
</template>

<style scoped>
.agent-card {
  background: #1e1e2e;
  border: 1px solid #313244;
  border-radius: 8px;
  padding: 16px;
  min-width: 280px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #313244;
}

.agent-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.agent-type {
  font-weight: 600;
  text-transform: capitalize;
  color: #cdd6f4;
}

.agent-id {
  font-family: monospace;
  color: #6c7086;
  font-size: 0.9em;
}

.sandbox-status {
  font-size: 0.85em;
  text-transform: uppercase;
  font-weight: 500;
}

.card-body {
  margin-bottom: 12px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 0.9em;
}

.label {
  color: #6c7086;
}

.value {
  color: #cdd6f4;
  font-family: monospace;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.btn {
  flex: 1;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn:hover {
  opacity: 0.8;
}

.btn-kill {
  background: #f38ba8;
  color: #1e1e2e;
}

.btn-restart {
  background: #a6e3a1;
  color: #1e1e2e;
}

/* Animations */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
