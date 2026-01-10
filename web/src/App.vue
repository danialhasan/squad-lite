<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { api } from '@/api/client'
import { createWsClient } from '@/api/websocket'
import { isMockMode, resetMockState } from '@/api/mock'
import AgentCard from '@/components/AgentCard.vue'
import MessageFeed from '@/components/MessageFeed.vue'
import type { Message } from '@/components/MessageFeed.vue'
import CheckpointTimeline from '@/components/CheckpointTimeline.vue'
import type { Checkpoint } from '@/components/CheckpointTimeline.vue'
import DemoControls from '@/components/DemoControls.vue'
import OutputPanel from '@/components/OutputPanel.vue'
import type { OutputLine } from '@/components/OutputPanel.vue'
import type { AgentResponse, WsEvent } from '@/types'

// ============================================================
// STATE
// ============================================================

const agents = ref<AgentResponse[]>([])
const messages = ref<Message[]>([])
const checkpoints = ref<Checkpoint[]>([])
const outputs = ref<OutputLine[]>([])
const isConnected = ref(false)
const error = ref<string | null>(null)
const mockMode = isMockMode()

// ============================================================
// WEBSOCKET
// ============================================================

let wsClient: ReturnType<typeof createWsClient> | null = null

const handleWsEvent = (event: WsEvent) => {
  console.log('[WS Event]', event.type, event.data)

  switch (event.type) {
    case 'agent:created': {
      // Add new agent (fetch full details)
      api.agents.getStatus(event.data.agentId).then((agent) => {
        agents.value.push(agent)
      }).catch(console.error)
      break
    }

    case 'agent:status': {
      // Update existing agent
      const idx = agents.value.findIndex(a => a.agentId === event.data.agentId)
      const existing = agents.value[idx]
      if (idx !== -1 && existing) {
        agents.value[idx] = {
          agentId: existing.agentId,
          type: existing.type,
          status: event.data.status,
          sandboxId: existing.sandboxId,
          sandboxStatus: event.data.sandboxStatus,
          createdAt: existing.createdAt,
          lastHeartbeat: existing.lastHeartbeat,
        }
      }
      break
    }

    case 'agent:output': {
      outputs.value.push({
        agentId: event.data.agentId,
        stream: event.data.stream,
        content: event.data.content,
        timestamp: event.data.timestamp,
      })
      break
    }

    case 'message:new': {
      messages.value.push({
        messageId: event.data.messageId,
        fromAgent: event.data.fromAgent,
        toAgent: event.data.toAgent,
        messageType: event.data.messageType,
        preview: event.data.preview,
        timestamp: new Date().toISOString(),
      })
      break
    }

    case 'checkpoint:new': {
      checkpoints.value.push({
        checkpointId: event.data.checkpointId,
        agentId: event.data.agentId,
        phase: event.data.phase,
        timestamp: event.data.timestamp,
      })
      break
    }
  }
}

// ============================================================
// API HANDLERS
// ============================================================

const handleSpawn = async () => {
  try {
    error.value = null
    const agent = await api.agents.spawn()
    agents.value.push(agent)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to spawn'
    console.error('Spawn error:', err)
  }
}

const handleSubmitTask = async (task: string) => {
  try {
    error.value = null
    // Submit to first director
    const director = agents.value.find(a => a.type === 'director')
    if (!director) {
      error.value = 'No director agent. Spawn one first.'
      return
    }
    await api.agents.submitTask(director.agentId, task)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to submit task'
    console.error('Submit error:', err)
  }
}

const handleKill = async (agentId: string) => {
  try {
    error.value = null
    await api.agents.kill(agentId)
    // Update local state
    const idx = agents.value.findIndex(a => a.agentId === agentId)
    const existing = agents.value[idx]
    if (idx !== -1 && existing) {
      agents.value[idx] = {
        agentId: existing.agentId,
        type: existing.type,
        status: existing.status,
        sandboxId: existing.sandboxId,
        sandboxStatus: 'killed',
        createdAt: existing.createdAt,
        lastHeartbeat: existing.lastHeartbeat,
      }
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to kill agent'
    console.error('Kill error:', err)
  }
}

const handleRestart = async (agentId: string) => {
  try {
    error.value = null
    const agent = await api.agents.restart(agentId)
    // Update local state
    const idx = agents.value.findIndex(a => a.agentId === agentId)
    if (idx !== -1) {
      agents.value[idx] = agent
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to restart agent'
    console.error('Restart error:', err)
  }
}

const handleReset = () => {
  agents.value = []
  messages.value = []
  checkpoints.value = []
  outputs.value = []
  error.value = null
  // Reset mock state if in mock mode
  if (mockMode) {
    resetMockState()
  }
}

// ============================================================
// LIFECYCLE
// ============================================================

onMounted(() => {
  wsClient = createWsClient({
    onEvent: handleWsEvent,
    onConnect: () => { isConnected.value = true },
    onDisconnect: () => { isConnected.value = false },
  })
  wsClient.connect()
})

onUnmounted(() => {
  wsClient?.disconnect()
})
</script>

<template>
  <div class="dashboard">
    <!-- Header -->
    <header class="header">
      <div class="header-left">
        <h1>Squad Lite</h1>
        <span :class="['connection-status', { connected: isConnected }]">
          {{ isConnected ? 'Connected' : 'Disconnected' }}
        </span>
        <span v-if="mockMode" class="mock-badge">MOCK MODE</span>
      </div>
      <div class="header-right">
        <span class="tagline">MongoDB Agentic Orchestration</span>
      </div>
    </header>

    <!-- Error Banner -->
    <div v-if="error" class="error-banner">
      {{ error }}
      <button @click="error = null">×</button>
    </div>

    <!-- Controls -->
    <DemoControls
      @spawn="handleSpawn"
      @submit-task="handleSubmitTask"
      @reset="handleReset"
    />

    <!-- Main Content -->
    <main class="main-content">
      <!-- Left: Agents -->
      <section class="agents-section">
        <h2>Agents</h2>
        <div class="agents-grid">
          <AgentCard
            v-for="agent in agents"
            :key="agent.agentId"
            :agent="agent"
            @kill="handleKill"
            @restart="handleRestart"
          />
          <div v-if="agents.length === 0" class="empty-state">
            No agents. Click "Spawn Director" to start.
          </div>
        </div>
      </section>

      <!-- Right: Feeds -->
      <section class="feeds-section">
        <div class="feed-row">
          <MessageFeed :messages="messages" />
          <CheckpointTimeline :checkpoints="checkpoints" />
        </div>
        <OutputPanel :outputs="outputs" />
      </section>
    </main>
  </div>
</template>

<style>
/* Global reset */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background: #11111b;
  color: #cdd6f4;
  min-height: 100vh;
}

#app {
  min-height: 100vh;
}
</style>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 16px;
  gap: 16px;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #1e1e2e;
  border: 1px solid #313244;
  border-radius: 8px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header h1 {
  font-size: 1.5em;
  font-weight: 700;
  color: #89b4fa;
}

.connection-status {
  font-size: 0.8em;
  padding: 4px 10px;
  border-radius: 12px;
  background: #f38ba8;
  color: #1e1e2e;
}

.connection-status.connected {
  background: #a6e3a1;
}

.mock-badge {
  font-size: 0.75em;
  padding: 4px 8px;
  border-radius: 4px;
  background: #fab387;
  color: #1e1e2e;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.tagline {
  color: #6c7086;
  font-size: 0.9em;
}

/* Error Banner */
.error-banner {
  background: rgba(243, 139, 168, 0.2);
  border: 1px solid #f38ba8;
  color: #f38ba8;
  padding: 12px 16px;
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.error-banner button {
  background: none;
  border: none;
  color: #f38ba8;
  font-size: 1.2em;
  cursor: pointer;
}

/* Main Content */
.main-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  flex: 1;
}

.agents-section h2,
.feeds-section h2 {
  font-size: 1em;
  color: #6c7086;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.agents-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.feeds-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.feed-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  height: 250px;
}

.empty-state {
  color: #6c7086;
  font-style: italic;
  padding: 32px;
  text-align: center;
  background: #1e1e2e;
  border: 1px dashed #313244;
  border-radius: 8px;
}
</style>
