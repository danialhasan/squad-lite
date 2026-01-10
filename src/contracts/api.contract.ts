import { initContract } from '@ts-rest/core'
import { z } from 'zod'

const c = initContract()

// ============================================================
// SHARED RESPONSE SCHEMAS
// ============================================================

const AgentResponse = z.object({
  agentId: z.string().uuid(),
  type: z.enum(['director', 'specialist']),
  status: z.enum(['idle', 'working', 'waiting', 'completed', 'error']),
  sandboxId: z.string().nullable(),
  sandboxStatus: z.enum(['none', 'active', 'paused', 'killed']),
  createdAt: z.string(), // ISO timestamp
  lastHeartbeat: z.string(),
})

const SandboxResponse = z.object({
  sandboxId: z.string(),
  agentId: z.string().uuid(),
  status: z.enum(['creating', 'active', 'paused', 'resuming', 'killed']),
  lifecycle: z.object({
    createdAt: z.string(),
    pausedAt: z.string().nullable(),
    resumedAt: z.string().nullable(),
    killedAt: z.string().nullable(),
    lastHeartbeat: z.string(),
  }),
  resources: z.object({
    cpuCount: z.number(),
    memoryMB: z.number(),
    timeoutMs: z.number(),
  }),
  costs: z.object({
    estimatedCost: z.number(),
    runtimeSeconds: z.number(),
  }),
})

const ErrorResponse = z.object({
  error: z.string(),
  message: z.string(),
  statusCode: z.number(),
})

// ============================================================
// API CONTRACT (FROZEN)
// ============================================================

export const contract = c.router({

  // ============================================================
  // AGENT ROUTES
  // ============================================================

  agents: {
    spawn: {
      method: 'POST',
      path: '/api/agents',
      responses: {
        201: AgentResponse,
        500: ErrorResponse,
      },
      body: z.object({}), // Empty for hackathon (auto-spawn director)
      summary: 'Spawn a Director agent',
    },

    submitTask: {
      method: 'POST',
      path: '/api/agents/:id/task',
      responses: {
        200: z.object({
          taskId: z.string().uuid(),
          status: z.enum(['assigned']),
          agentId: z.string().uuid(),
        }),
        404: ErrorResponse,
        500: ErrorResponse,
      },
      body: z.object({
        task: z.string().min(10).max(1000),
      }),
      pathParams: z.object({
        id: z.string().uuid(),
      }),
      summary: 'Submit task to Director',
    },

    getStatus: {
      method: 'GET',
      path: '/api/agents/:id/status',
      responses: {
        200: AgentResponse,
        404: ErrorResponse,
      },
      pathParams: z.object({
        id: z.string().uuid(),
      }),
      summary: 'Get agent status',
    },

    kill: {
      method: 'DELETE',
      path: '/api/agents/:id',
      responses: {
        200: z.object({
          agentId: z.string().uuid(),
          status: z.literal('killed'),
          checkpointId: z.string().uuid().nullable(),
        }),
        404: ErrorResponse,
        500: ErrorResponse,
      },
      body: z.object({}),
      pathParams: z.object({
        id: z.string().uuid(),
      }),
      summary: 'Kill agent',
    },

    restart: {
      method: 'POST',
      path: '/api/agents/:id/restart',
      responses: {
        201: AgentResponse,
        404: ErrorResponse,
        500: ErrorResponse,
      },
      body: z.object({}),
      pathParams: z.object({
        id: z.string().uuid(),
      }),
      summary: 'Restart agent from checkpoint',
    },
  },

  // ============================================================
  // SANDBOX ROUTES
  // ============================================================

  sandboxes: {
    list: {
      method: 'GET',
      path: '/api/sandboxes',
      responses: {
        200: z.object({
          sandboxes: z.array(SandboxResponse),
        }),
      },
      summary: 'List all sandboxes',
    },

    get: {
      method: 'GET',
      path: '/api/sandboxes/:id',
      responses: {
        200: SandboxResponse,
        404: ErrorResponse,
      },
      pathParams: z.object({
        id: z.string(),
      }),
      summary: 'Get sandbox info',
    },

    pause: {
      method: 'POST',
      path: '/api/sandboxes/:id/pause',
      responses: {
        200: z.object({
          sandboxId: z.string(),
          status: z.literal('paused'),
        }),
        404: ErrorResponse,
        500: ErrorResponse,
      },
      body: z.object({}),
      pathParams: z.object({
        id: z.string(),
      }),
      summary: 'Pause sandbox',
    },

    resume: {
      method: 'POST',
      path: '/api/sandboxes/:id/resume',
      responses: {
        200: z.object({
          sandboxId: z.string(),
          status: z.literal('active'),
        }),
        404: ErrorResponse,
        500: ErrorResponse,
      },
      body: z.object({}),
      pathParams: z.object({
        id: z.string(),
      }),
      summary: 'Resume sandbox',
    },

    kill: {
      method: 'DELETE',
      path: '/api/sandboxes/:id',
      responses: {
        200: z.object({
          sandboxId: z.string(),
          status: z.literal('killed'),
        }),
        404: ErrorResponse,
        500: ErrorResponse,
      },
      body: z.object({}),
      pathParams: z.object({
        id: z.string(),
      }),
      summary: 'Kill sandbox',
    },
  },
})

// ============================================================
// EXPORT TYPES FOR FRONTEND
// ============================================================

export type ApiContract = typeof contract

// Export individual response types
export type AgentResponseType = z.infer<typeof AgentResponse>
export type SandboxResponseType = z.infer<typeof SandboxResponse>
export type ErrorResponseType = z.infer<typeof ErrorResponse>
