# Squad Lite — Exhaustive System Specification

**Version:** 1.0
**Date:** 2026-01-10
**Authors:** Danial, Shafan, Claude Opus 4.5

---

## Table of Contents

1. [Overview](#overview)
2. [Problem Statements Addressed](#problem-statements-addressed)
3. [System Architecture](#system-architecture)
4. [Core Systems](#core-systems)
5. [Dependency Graph](#dependency-graph)
6. [Implementation Tiers](#implementation-tiers)
7. [API Contracts](#api-contracts)
8. [Data Models](#data-models)
9. [Claude Agent SDK Integration](#claude-agent-sdk-integration)
10. [Demo Requirements](#demo-requirements)

---

## Overview

**Squad Lite** is a multi-agent coordination system built on MongoDB Atlas that demonstrates:
- **Statement 1:** Prolonged Coordination (hours/days, failure recovery, task consistency)
- **Statement 2:** Multi-Agent Collaboration (specialized agents, task assignment, context sharing)

### Core Innovation

Instead of ephemeral subagents that die after one task, Squad Lite implements **persistent agents** that:
1. Coordinate via MongoDB message bus
2. Checkpoint state to MongoDB
3. Resume from checkpoints after restart
4. Share context via notification-based agent mail

---

## Problem Statements Addressed

### Statement 1: Prolonged Coordination

> "Create an agentic system capable of performing intricate, multi-step workflows that last hours or days, utilizing MongoDB as the context engine, while enduring failures, restarts, and modifications to tasks."

**Our Solution:**
- **Checkpoint System** — Agents save state snapshots to MongoDB
- **Resume Pointer** — Each checkpoint includes `nextAction`, `phase`, `currentContext`
- **SDK Session Persistence** — Leverage Claude Agent SDK's `resume` option with session IDs
- **Task State Machine** — `pending → assigned → in_progress → completed/failed`

### Statement 2: Multi-Agent Collaboration

> "Develop a multi-agent system in which specialized agents explore, assign tasks, and communicate with one another, using MongoDB to organize and oversee contexts."

**Our Solution:**
- **Agent Hierarchy** — Director (orchestrator) → Specialists (executors)
- **Message Bus** — Inter-agent communication via MongoDB `messages` collection
- **Agent Registry** — Track active agents, their capabilities, and status
- **Task Decomposition** — Director breaks complex tasks into subtasks for specialists

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SQUAD LITE                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                         AGENT LAYER                                   │   │
│  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐               │   │
│  │  │  Director   │    │ Specialist  │    │ Specialist  │               │   │
│  │  │  Agent      │───▶│ Agent #1    │    │ Agent #2    │               │   │
│  │  │             │    │ (Researcher)│    │ (Writer)    │               │   │
│  │  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘               │   │
│  │         │                  │                  │                       │   │
│  └─────────┼──────────────────┼──────────────────┼───────────────────────┘   │
│            │                  │                  │                           │
│  ┌─────────┼──────────────────┼──────────────────┼───────────────────────┐   │
│  │         ▼                  ▼                  ▼                        │   │
│  │                    COORDINATION LAYER                                 │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │   │
│  │  │                    Context Management                            │ │   │
│  │  │  • Session tracking (SDK session IDs)                           │ │   │
│  │  │  • Notification injection (agent mail → context)                │ │   │
│  │  │  • Token budget monitoring                                      │ │   │
│  │  └─────────────────────────────────────────────────────────────────┘ │   │
│  │                                                                       │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                │   │
│  │  │  Message Bus │  │ Checkpoints  │  │    Tasks     │                │   │
│  │  │  (Agent Mail)│  │  (Resume)    │  │ (Work Units) │                │   │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                │   │
│  │         │                 │                 │                         │   │
│  └─────────┼─────────────────┼─────────────────┼─────────────────────────┘   │
│            │                 │                 │                             │
│  ┌─────────┼─────────────────┼─────────────────┼─────────────────────────┐   │
│  │         ▼                 ▼                 ▼                          │   │
│  │                      DATA LAYER (MongoDB Atlas)                       │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐              │   │
│  │  │  agents  │  │ messages │  │checkpnts │  │  tasks   │              │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘              │   │
│  │                                                                       │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Core Systems

### S1: MongoDB Connection Layer

**Purpose:** Foundation for all database operations

**Components:**
- Connection pooling
- Index management
- Collection accessors

**Status:** ✅ Pre-built in `src/db/mongo.ts`

---

### S2: Schema Definitions (Zod)

**Purpose:** Runtime type safety for all data

**Schemas:**
- `AgentSchema` — Agent registry entries
- `MessageSchema` — Inter-agent messages
- `CheckpointSchema` — Agent state snapshots
- `TaskSchema` — Work units

**Status:** ✅ Pre-built in `src/db/mongo.ts`

---

### S3: Agent Registry

**Purpose:** Track all active agents and their capabilities

**Operations:**
- `registerAgent(config)` — Create new agent record
- `updateAgentStatus(id, status)` — Update agent state
- `getActiveAgents()` — List all active agents
- `heartbeat(id)` — Update last-seen timestamp

**Status:** ✅ Pre-built in `src/agents/base.ts`

---

### S4: Message Bus (Agent Mail)

**Purpose:** Inter-agent communication via MongoDB

**Operations:**
- `sendMessage(from, to, content, type)` — Send message
- `getInbox(agentId)` — Get unread messages
- `markAsRead(messageId)` — Acknowledge message
- `pollInbox(agentId, timeout)` — Blocking wait for messages
- `getThread(threadId)` — Get conversation thread

**Notification Model:**
- Metadata notification pushed to context (lightweight)
- Full content stored in MongoDB
- Agent uses `readMessage(id)` tool to fetch full content

**Status:** ✅ Pre-built in `src/coordination/messages.ts`

---

### S5: Checkpoint System

**Purpose:** Persist agent state for resume after restart

**Operations:**
- `createCheckpoint(agentId, summary, resumePointer)` — Save state
- `getLatestCheckpoint(agentId)` — Load most recent state
- `resumeFromCheckpoint(agentId)` — Build resume context

**Checkpoint Contents:**
```typescript
{
  summary: {
    goal: string,
    completed: string[],
    pending: string[],
    decisions: string[]
  },
  resumePointer: {
    nextAction: string,
    currentContext: string,
    phase: string
  },
  tokensUsed: number
}
```

**Status:** ✅ Pre-built in `src/coordination/checkpoints.ts`

---

### S6: Task Management

**Purpose:** Track work units assigned to agents

**Operations:**
- `createTask(title, description)` — Create work unit
- `assignTask(taskId, agentId)` — Assign to agent
- `updateTaskStatus(taskId, status)` — Track progress
- `getAgentTasks(agentId)` — Get assigned tasks
- `completeTask(taskId, result)` — Mark done with result

**Task States:**
```
pending → assigned → in_progress → completed
                  ↘              ↗
                    → failed →
```

**Status:** 🔴 Not yet built

---

### S7: Context Management System

**Purpose:** Manage agent context windows and inject notifications

**Components:**

#### 7a. Session Tracking
- Store SDK session IDs in agent records
- Enable resume via `options: { resume: sessionId }`
- Track cumulative tokens per session

#### 7b. Notification Injection
- When agent mail arrives, create lightweight notification
- Notification format: `[MAIL] From: {sender} | Subject: {type} | ID: {id}`
- Agent calls `readMessage(id)` tool to get full content
- Prevents context bloat while enabling coordination

#### 7c. Context Assembly
- On agent start/resume, build context packet:
  - Latest checkpoint summary (if exists)
  - Pending notifications (unread messages)
  - Current task state
  - Resume pointer

**Status:** 🔴 Not yet built

---

### S8: Director Agent

**Purpose:** Orchestrate multi-agent collaboration

**Responsibilities:**
1. Receive complex task from human
2. Decompose into subtasks
3. Spawn/assign Specialist agents
4. Monitor progress via message bus
5. Aggregate results
6. Handle failures (reassign, escalate)

**Implementation:**
- Uses Claude Agent SDK `query()` function
- Has access to custom tools: `spawnSpecialist`, `assignTask`, `checkInbox`, `sendMessage`
- Checkpoints after each major phase

**Status:** 🔴 Not yet built

---

### S9: Specialist Agent

**Purpose:** Execute specific subtasks

**Responsibilities:**
1. Poll inbox for task assignments
2. Execute task (research, write, analyze, etc.)
3. Checkpoint progress periodically
4. Report results back to Director
5. Handle interrupts (new priority messages)

**Specializations:**
- `researcher` — Web search, data gathering
- `writer` — Content creation, documentation
- `analyst` — Data analysis, synthesis
- `general` — Flexible, any task

**Implementation:**
- Uses Claude Agent SDK `query()` function
- Has access to: `checkInbox`, `sendMessage`, `checkpoint`, specialized tools
- Resumes from checkpoint on restart

**Status:** 🔴 Not yet built

---

### S10: Claude SDK Integration

**Purpose:** Wire agents to Claude Agent SDK

**Key SDK Features Used:**

#### Sessions
```typescript
// Capture session ID on init
for await (const message of query({ prompt, options })) {
  if (message.type === "system" && message.subtype === "init") {
    sessionId = message.session_id;
  }
}

// Resume later
for await (const message of query({
  prompt: "Continue...",
  options: { resume: sessionId }
})) {
  // Full context restored
}
```

#### Custom Tools (MCP)
```typescript
options: {
  mcpServers: {
    "squad-lite": {
      command: "node",
      args: ["./src/mcp-server.js"]
    }
  }
}
```

#### Hooks
```typescript
hooks: {
  PostToolUse: [{
    matcher: ".*",
    hooks: [logToolUsage, checkForMessages]
  }]
}
```

#### Subagents (Alternative to persistent)
```typescript
agents: {
  "researcher": {
    description: "Research specialist",
    prompt: "...",
    tools: ["WebSearch", "Read"]
  }
}
```

**Status:** 🔴 Not yet built

---

### S11: CLI Entry Points

**Purpose:** Run agents from command line

**Commands:**
- `pnpm run director` — Start Director agent
- `pnpm run specialist -- --type=researcher` — Start Specialist
- `pnpm run specialist -- --resume=<agentId>` — Resume from checkpoint

**Status:** 🔴 Not yet built

---

## Dependency Graph

```
                    ┌─────────────────────┐
                    │  S1: MongoDB Conn   │
                    │  (FOUNDATION)       │
                    └──────────┬──────────┘
                               │
                    ┌──────────┴──────────┐
                    │  S2: Zod Schemas    │
                    │  (TYPE SAFETY)      │
                    └──────────┬──────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         │                     │                     │
         ▼                     ▼                     ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ S3: Agent       │  │ S4: Message Bus │  │ S6: Task Mgmt   │
│ Registry        │  │ (Agent Mail)    │  │                 │
└────────┬────────┘  └────────┬────────┘  └────────┬────────┘
         │                    │                    │
         │           ┌────────┴────────┐           │
         │           │                 │           │
         ▼           ▼                 │           │
┌─────────────────────────────┐        │           │
│ S5: Checkpoint System       │        │           │
│ (depends on Agent Registry) │        │           │
└────────────┬────────────────┘        │           │
             │                         │           │
             └────────────┬────────────┘           │
                          │                        │
                          ▼                        │
             ┌─────────────────────────┐           │
             │ S7: Context Management  │◀──────────┘
             │ (Sessions, Notifications│
             │  Token Tracking)        │
             └────────────┬────────────┘
                          │
         ┌────────────────┴────────────────┐
         │                                 │
         ▼                                 ▼
┌─────────────────────┐         ┌─────────────────────┐
│ S10: Claude SDK     │         │ S10: Claude SDK     │
│ Integration         │         │ Integration         │
│ (Director Config)   │         │ (Specialist Config) │
└─────────┬───────────┘         └─────────┬───────────┘
          │                               │
          ▼                               ▼
┌─────────────────────┐         ┌─────────────────────┐
│ S8: Director Agent  │────────▶│ S9: Specialist      │
│                     │  spawns │ Agent               │
└─────────┬───────────┘         └─────────┬───────────┘
          │                               │
          └───────────────┬───────────────┘
                          │
                          ▼
             ┌─────────────────────────┐
             │ S11: CLI Entry Points   │
             └─────────────────────────┘
```

---

## Implementation Tiers

### Tier 0: Foundation (Pre-built ✅)

| System | Status | Files |
|--------|--------|-------|
| S1: MongoDB Connection | ✅ Done | `src/db/mongo.ts` |
| S2: Zod Schemas | ✅ Done | `src/db/mongo.ts` |
| S3: Agent Registry | ✅ Done | `src/agents/base.ts` |
| S4: Message Bus | ✅ Done | `src/coordination/messages.ts` |
| S5: Checkpoints | ✅ Done | `src/coordination/checkpoints.ts` |

### Tier 1: Core Systems (Build First)

| System | Dependencies | Est. Time | Owner |
|--------|--------------|-----------|-------|
| S6: Task Management | S1, S2 | 30 min | — |
| S7: Context Management | S3, S4, S5 | 1 hour | — |
| S10: SDK Integration | S7 | 1 hour | — |

### Tier 2: Agent Implementation (Build Second)

| System | Dependencies | Est. Time | Owner |
|--------|--------------|-----------|-------|
| S8: Director Agent | S6, S7, S10 | 1.5 hours | — |
| S9: Specialist Agent | S6, S7, S10 | 1 hour | — |

### Tier 3: Polish (Build Last)

| System | Dependencies | Est. Time | Owner |
|--------|--------------|-----------|-------|
| S11: CLI Entry Points | S8, S9 | 30 min | — |
| Demo Script | S11 | 30 min | — |

### Total Estimated Time: ~6 hours

---

## API Contracts

### Task Management (S6)

```typescript
// Create task
POST /tasks
{
  title: string,
  description: string,
  parentTaskId?: string
}
→ { taskId: string }

// Assign task
PATCH /tasks/:taskId/assign
{
  agentId: string
}
→ { success: boolean }

// Update status
PATCH /tasks/:taskId/status
{
  status: 'in_progress' | 'completed' | 'failed',
  result?: string
}
→ { success: boolean }
```

### Context Management (S7)

```typescript
// Start session
startSession(agentId: string): Promise<{
  sessionId: string,
  contextPacket: ContextPacket
}>

// Build context packet
buildContextPacket(agentId: string): Promise<{
  checkpointSummary?: string,
  notifications: Notification[],
  currentTask?: Task,
  resumePointer?: ResumePointer
}>

// Inject notification
injectNotification(agentId: string, notification: Notification): Promise<void>

// Track tokens
trackTokens(agentId: string, tokensUsed: number): Promise<void>
```

### Agent Tools (MCP Server)

```typescript
// Check inbox
checkInbox(): Promise<{
  count: number,
  notifications: Array<{
    id: string,
    from: string,
    type: string,
    preview: string,
    timestamp: string
  }>
}>

// Read full message
readMessage(messageId: string): Promise<{
  id: string,
  from: string,
  to: string,
  content: string,
  type: string,
  threadId: string,
  createdAt: string
}>

// Send message
sendMessage(to: string, content: string, type: string): Promise<{
  messageId: string,
  threadId: string
}>

// Create checkpoint
checkpoint(summary: Summary, resumePointer: ResumePointer): Promise<{
  checkpointId: string
}>

// Spawn specialist (Director only)
spawnSpecialist(type: string, taskId: string): Promise<{
  agentId: string
}>
```

---

## Data Models

### Agent

```typescript
interface Agent {
  agentId: string           // UUID
  type: 'director' | 'specialist'
  specialization?: 'researcher' | 'writer' | 'analyst' | 'general'
  status: 'idle' | 'working' | 'waiting' | 'completed' | 'error'
  parentId: string | null   // Director's ID for specialists
  taskId: string | null     // Currently assigned task
  sessionId?: string        // Claude SDK session ID
  createdAt: Date
  lastHeartbeat: Date
}
```

### Message

```typescript
interface Message {
  messageId: string         // UUID
  fromAgent: string         // Agent ID
  toAgent: string           // Agent ID
  content: string           // Full message content
  type: 'task' | 'result' | 'status' | 'error'
  threadId: string          // Conversation thread
  priority: 'high' | 'normal' | 'low'
  readAt: Date | null       // When acknowledged
  createdAt: Date
}
```

### Checkpoint

```typescript
interface Checkpoint {
  checkpointId: string      // UUID
  agentId: string           // Agent ID
  summary: {
    goal: string
    completed: string[]
    pending: string[]
    decisions: string[]
  }
  resumePointer: {
    nextAction: string
    currentContext?: string
    phase: string
  }
  tokensUsed: number
  createdAt: Date
}
```

### Task

```typescript
interface Task {
  taskId: string            // UUID
  parentTaskId: string | null
  assignedTo: string | null // Agent ID
  title: string
  description: string
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'failed'
  result: string | null     // Output when completed
  createdAt: Date
  updatedAt: Date
}
```

### Notification (In-Context)

```typescript
interface Notification {
  id: string                // Message ID
  from: string              // Sender agent ID (truncated)
  type: string              // Message type
  preview: string           // First 100 chars
  timestamp: string         // ISO 8601
}
```

---

## Claude Agent SDK Integration

### Session Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                      SESSION LIFECYCLE                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. START                                                        │
│     │                                                            │
│     ▼                                                            │
│  ┌──────────────────────────────────────────┐                   │
│  │ Check for existing checkpoint            │                   │
│  │ • If exists: Load resume context         │                   │
│  │ • If not: Start fresh                    │                   │
│  └──────────────────────────────────────────┘                   │
│     │                                                            │
│     ▼                                                            │
│  2. QUERY (with context packet)                                  │
│     │                                                            │
│     ▼                                                            │
│  ┌──────────────────────────────────────────┐                   │
│  │ Claude Agent SDK query()                 │                   │
│  │ • Capture session_id on init             │                   │
│  │ • Store in agent record                  │                   │
│  └──────────────────────────────────────────┘                   │
│     │                                                            │
│     ▼                                                            │
│  3. WORK LOOP                                                    │
│     │                                                            │
│     ├──▶ Execute tools (Read, Write, Bash, etc.)                │
│     │                                                            │
│     ├──▶ Check inbox periodically (via tool or hook)            │
│     │    • Process notifications                                 │
│     │    • Read full messages as needed                         │
│     │                                                            │
│     ├──▶ Checkpoint at intervals or phase transitions           │
│     │    • Save summary + resume pointer to MongoDB             │
│     │                                                            │
│     └──▶ Send results via message bus                           │
│                                                                  │
│  4. INTERRUPT (Ctrl+C, crash, etc.)                             │
│     │                                                            │
│     ▼                                                            │
│  ┌──────────────────────────────────────────┐                   │
│  │ Checkpoint exists in MongoDB             │                   │
│  │ Session ID stored in agent record        │                   │
│  └──────────────────────────────────────────┘                   │
│                                                                  │
│  5. RESUME                                                       │
│     │                                                            │
│     ▼                                                            │
│  ┌──────────────────────────────────────────┐                   │
│  │ query() with options: { resume: sessionId }│                 │
│  │ + Checkpoint context in prompt           │                   │
│  └──────────────────────────────────────────┘                   │
│     │                                                            │
│     └──▶ Back to WORK LOOP                                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### SDK Configuration

```typescript
// Director configuration
const directorOptions = {
  allowedTools: ["Read", "Write", "Bash", "Glob", "Grep", "WebSearch", "Task"],
  mcpServers: {
    "squad-lite": {
      command: "node",
      args: ["./src/mcp/server.js"]
    }
  },
  hooks: {
    PostToolUse: [{
      matcher: ".*",
      hooks: [checkInboxHook, heartbeatHook]
    }]
  },
  agents: {
    // Subagent definitions (if using ephemeral pattern)
  }
}

// Specialist configuration
const specialistOptions = {
  allowedTools: ["Read", "Write", "Bash", "Glob", "Grep", "WebSearch"],
  mcpServers: {
    "squad-lite": {
      command: "node",
      args: ["./src/mcp/server.js"]
    }
  },
  hooks: {
    PostToolUse: [{
      matcher: ".*",
      hooks: [checkInboxHook, heartbeatHook, checkpointHook]
    }]
  }
}
```

---

## Demo Requirements

### Visual Setup

```
┌─────────────────────────────────────────────────────────────────┐
│  TERMINAL (LEFT 60%)          │  MONGODB COMPASS (RIGHT 40%)    │
│  ┌─────────────────────────┐  │  ┌─────────────────────────┐    │
│  │ Director Agent          │  │  │ agents collection       │    │
│  │ > Task received...      │  │  │ ├─ director (working)   │    │
│  │ > Spawning Researcher   │  │  │ ├─ researcher (working) │    │
│  │ > Spawning Writer       │  │  │ └─ writer (idle)        │    │
│  └─────────────────────────┘  │  ├─────────────────────────┤    │
│  ┌─────────────────────────┐  │  │ messages collection     │    │
│  │ Researcher Agent        │  │  │ ├─ D→R: "research..."   │    │
│  │ > Received task         │  │  │ ├─ R→D: "found 3..."    │    │
│  │ > Searching web...      │  │  │ └─ D→W: "write..."      │    │
│  └─────────────────────────┘  │  ├─────────────────────────┤    │
│  ┌─────────────────────────┐  │  │ checkpoints collection  │    │
│  │ Writer Agent            │  │  │ └─ researcher: phase=   │    │
│  │ > Waiting for input...  │  │  │     "research_complete" │    │
│  └─────────────────────────┘  │  └─────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### Demo Script (3 Minutes)

| Time | Action | What Judges See |
|------|--------|-----------------|
| 0:00 | Start Director | Terminal shows Director starting |
| 0:15 | Director receives task | "Decomposing task..." |
| 0:30 | Spawn Researchers | Compass: new agents appear |
| 0:45 | Agents coordinate | Compass: messages flowing |
| 1:15 | **Kill Researcher (Ctrl+C)** | Terminal closes |
| 1:20 | Show checkpoint in Compass | "Look, state is saved" |
| 1:30 | **Restart Researcher** | Terminal: "Resuming from checkpoint" |
| 1:45 | Researcher continues | "Picking up where we left off" |
| 2:15 | Task completes | Final result displayed |
| 2:30 | Recap | "MongoDB = coordination + persistence" |

### Success Criteria

- [ ] Director spawns 2+ Specialists
- [ ] Messages visible in MongoDB Compass (real-time)
- [ ] Kill agent → checkpoint exists → restart → continues
- [ ] Final task produces meaningful output
- [ ] Demo completes without errors

---

## Open Questions

1. **Task decomposition logic** — How does Director decide subtasks?
   - Option A: Hardcoded for demo
   - Option B: Let Claude figure it out

2. **Checkpoint frequency** — When should agents checkpoint?
   - Option A: After each tool use (aggressive)
   - Option B: After phase transitions (balanced)
   - Option C: Time-based (every N minutes)

3. **Message polling** — How often should agents check inbox?
   - Option A: After each tool use (via hook)
   - Option B: Every N seconds (background)
   - Option C: Only when idle

---

## Linear Tickets (To Create)

Based on this spec, create tickets in Linear (HACK team):

| Ticket | System | Priority | Estimate |
|--------|--------|----------|----------|
| HACK-1 | S6: Task Management | P0 | 30 min |
| HACK-2 | S7a: Session Tracking | P0 | 30 min |
| HACK-3 | S7b: Notification Injection | P0 | 30 min |
| HACK-4 | S10: SDK Integration | P0 | 1 hour |
| HACK-5 | S8: Director Agent | P0 | 1.5 hours |
| HACK-6 | S9: Specialist Agent | P0 | 1 hour |
| HACK-7 | S11: CLI Entry Points | P1 | 30 min |
| HACK-8 | Demo Script + Polish | P1 | 30 min |

---

_Spec complete. Ready for implementation._
