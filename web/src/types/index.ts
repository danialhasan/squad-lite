// ============================================================
// FRONTEND TYPES (derived from backend contracts)
// These are manually synced from src/contracts/*.ts
// ============================================================

// Agent types
export type AgentStatus = 'idle' | 'working' | 'waiting' | 'completed' | 'error'
export type AgentType = 'director' | 'specialist'
export type SandboxStatus = 'none' | 'active' | 'paused' | 'killed'

export interface AgentResponse {
  agentId: string
  type: AgentType
  status: AgentStatus
  sandboxId: string | null
  sandboxStatus: SandboxStatus
  createdAt: string
  lastHeartbeat: string
}

export interface SandboxResponse {
  sandboxId: string
  agentId: string
  status: 'creating' | 'active' | 'paused' | 'resuming' | 'killed'
  lifecycle: {
    createdAt: string
    pausedAt: string | null
    resumedAt: string | null
    killedAt: string | null
    lastHeartbeat: string
  }
  resources: {
    cpuCount: number
    memoryMB: number
    timeoutMs: number
  }
  costs: {
    estimatedCost: number
    runtimeSeconds: number
  }
}

export interface ErrorResponse {
  error: string
  message: string
  statusCode: number
}

export interface TaskSubmitResponse {
  taskId: string
  status: 'assigned'
  agentId: string
}

export interface KillResponse {
  agentId: string
  status: 'killed'
  checkpointId: string | null
}

// ============================================================
// WEBSOCKET EVENT TYPES
// ============================================================

export interface WsAgentCreatedEvent {
  type: 'agent:created'
  data: {
    agentId: string
    agentType: AgentType
    sandboxId: string | null
  }
}

export interface WsAgentStatusEvent {
  type: 'agent:status'
  data: {
    agentId: string
    status: AgentStatus
    sandboxStatus: SandboxStatus
  }
}

export interface WsAgentOutputEvent {
  type: 'agent:output'
  data: {
    agentId: string
    stream: 'stdout' | 'stderr'
    content: string
    timestamp: string
  }
}

export interface WsMessageNewEvent {
  type: 'message:new'
  data: {
    messageId: string
    fromAgent: string
    toAgent: string
    messageType: 'task' | 'result' | 'status' | 'error'
    preview: string
  }
}

export interface WsCheckpointNewEvent {
  type: 'checkpoint:new'
  data: {
    checkpointId: string
    agentId: string
    phase: string
    timestamp: string
  }
}

export interface WsSandboxEvent {
  type: 'sandbox:event'
  data: {
    sandboxId: string
    event: 'created' | 'paused' | 'resumed' | 'killed'
    timestamp: string
  }
}

export type WsEvent =
  | WsAgentCreatedEvent
  | WsAgentStatusEvent
  | WsAgentOutputEvent
  | WsMessageNewEvent
  | WsCheckpointNewEvent
  | WsSandboxEvent

// ============================================================
// TYPE GUARDS
// ============================================================

export const isAgentCreatedEvent = (event: WsEvent): event is WsAgentCreatedEvent => {
  return event.type === 'agent:created'
}

export const isAgentStatusEvent = (event: WsEvent): event is WsAgentStatusEvent => {
  return event.type === 'agent:status'
}

export const isAgentOutputEvent = (event: WsEvent): event is WsAgentOutputEvent => {
  return event.type === 'agent:output'
}

export const isMessageNewEvent = (event: WsEvent): event is WsMessageNewEvent => {
  return event.type === 'message:new'
}

export const isCheckpointNewEvent = (event: WsEvent): event is WsCheckpointNewEvent => {
  return event.type === 'checkpoint:new'
}

export const isSandboxEvent = (event: WsEvent): event is WsSandboxEvent => {
  return event.type === 'sandbox:event'
}
