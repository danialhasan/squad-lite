import { z } from 'zod'

// ============================================================
// WEBSOCKET EVENT SCHEMAS (FROZEN)
// ============================================================

export const WsAgentCreatedEvent = z.object({
  type: z.literal('agent:created'),
  data: z.object({
    agentId: z.string().uuid(),
    agentType: z.enum(['director', 'specialist']),
    sandboxId: z.string().nullable(),
  }),
})

export const WsAgentStatusEvent = z.object({
  type: z.literal('agent:status'),
  data: z.object({
    agentId: z.string().uuid(),
    status: z.enum(['idle', 'working', 'waiting', 'completed', 'error']),
    sandboxStatus: z.enum(['none', 'active', 'paused', 'killed']),
  }),
})

export const WsAgentOutputEvent = z.object({
  type: z.literal('agent:output'),
  data: z.object({
    agentId: z.string().uuid(),
    stream: z.enum(['stdout', 'stderr']),
    content: z.string(),
    timestamp: z.string(), // ISO timestamp
  }),
})

export const WsMessageNewEvent = z.object({
  type: z.literal('message:new'),
  data: z.object({
    messageId: z.string().uuid(),
    fromAgent: z.string().uuid(),
    toAgent: z.string().uuid(),
    messageType: z.enum(['task', 'result', 'status', 'error']),
    preview: z.string(),
  }),
})

export const WsCheckpointNewEvent = z.object({
  type: z.literal('checkpoint:new'),
  data: z.object({
    checkpointId: z.string().uuid(),
    agentId: z.string().uuid(),
    phase: z.string(),
    timestamp: z.string(),
  }),
})

export const WsSandboxEvent = z.object({
  type: z.literal('sandbox:event'),
  data: z.object({
    sandboxId: z.string(),
    event: z.enum(['created', 'paused', 'resumed', 'killed']),
    timestamp: z.string(),
  }),
})

// ============================================================
// UNION TYPE FOR ALL EVENTS
// ============================================================

export type WsEvent =
  | z.infer<typeof WsAgentCreatedEvent>
  | z.infer<typeof WsAgentStatusEvent>
  | z.infer<typeof WsAgentOutputEvent>
  | z.infer<typeof WsMessageNewEvent>
  | z.infer<typeof WsCheckpointNewEvent>
  | z.infer<typeof WsSandboxEvent>

// ============================================================
// TYPE GUARDS
// ============================================================

export const isAgentCreatedEvent = (event: WsEvent): event is z.infer<typeof WsAgentCreatedEvent> => {
  return event.type === 'agent:created'
}

export const isAgentStatusEvent = (event: WsEvent): event is z.infer<typeof WsAgentStatusEvent> => {
  return event.type === 'agent:status'
}

export const isAgentOutputEvent = (event: WsEvent): event is z.infer<typeof WsAgentOutputEvent> => {
  return event.type === 'agent:output'
}

export const isMessageNewEvent = (event: WsEvent): event is z.infer<typeof WsMessageNewEvent> => {
  return event.type === 'message:new'
}

export const isCheckpointNewEvent = (event: WsEvent): event is z.infer<typeof WsCheckpointNewEvent> => {
  return event.type === 'checkpoint:new'
}

export const isSandboxEvent = (event: WsEvent): event is z.infer<typeof WsSandboxEvent> => {
  return event.type === 'sandbox:event'
}
