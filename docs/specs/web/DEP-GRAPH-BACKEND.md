# Backend Dependency Graph — Auto-Verifiable Tasks

**Approach:** Test-driven development with automated verification
**Developer:** Backend engineer (Danial or Shafan)
**Verification:** All tasks verify via `pnpm test` and `pnpm typecheck`

---

## Verification Strategy

**Backend tasks are auto-verifiable through:**
1. **Unit tests** (`pnpm test`) — All tests must pass
2. **Type checking** (`pnpm typecheck`) — Zero TypeScript errors
3. **Contract tests** — API responses match ts-rest schemas
4. **Integration tests** — MongoDB operations work end-to-end

**Gate:** Cannot proceed to next tier until all tests pass.

---

## Tier 0: Contracts (✅ DONE)

| Component | File | Status | Verification |
|-----------|------|--------|--------------|
| MongoDB schemas | `src/db/mongo.ts` | ✅ | Contract tests pass |
| API contract | `src/contracts/api.contract.ts` | ✅ | TypeScript compiles |
| WebSocket contract | `src/contracts/websocket.contract.ts` | ✅ | TypeScript compiles |
| Sandbox Manager contract | `src/contracts/sandbox-manager.contract.ts` | ✅ | TypeScript compiles |
| Test skeletons | `src/__tests/*.test.ts` | ✅ | Tests run (failing is OK) |

---

## Tier 1: Core Services (Hours 1-2.5)

### WP1-BE: Config Layer (15 min)

**File:** `src/config.ts`
**Dependencies:** None

**Tasks:**
- [ ] Create Zod schema for environment variables
- [ ] Load and validate env vars
- [ ] Export typed config object
- [ ] Never use `process.env` directly anywhere else

**Verification:**
```bash
pnpm typecheck  # Must compile
pnpm test src/__tests__/config.test.ts  # Must pass
```

**Test criteria:**
- Config loads successfully with valid env
- Config throws error with missing MONGODB_URI
- Config throws error with invalid API keys
- All config values have correct types

---

### WP2-BE: E2B Sandbox Manager (1 hour)

**File:** `src/sandbox/manager.ts`
**Dependencies:** WP1-BE (config), contracts

**Tasks:**
- [ ] Implement `createSandboxManager()` factory
- [ ] Implement `create(config)` - Spawn E2B sandbox
- [ ] Implement `execute(agentId, cmd, opts)` - Run with streaming
- [ ] Implement `pause(agentId)` - Call sandbox.betaPause()
- [ ] Implement `resume(agentId)` - Sandbox.connect()
- [ ] Implement `kill(agentId)` - Cleanup
- [ ] Implement `get()`, `list()`, `isRunning()` - State queries
- [ ] Sync all operations to MongoDB `sandbox_tracking`

**Verification:**
```bash
pnpm test src/__tests__/sandbox-manager.test.ts
# Tests:
# - create() returns SandboxInstance
# - execute() streams to onStdout callback
# - pause() updates MongoDB status='paused'
# - resume() restores sandbox
# - kill() marks status='killed'
# - MongoDB sync after each operation
```

**Contract compliance:**
- Interface matches `SandboxManager` from contract
- Throws typed errors (`SandboxCreationError`, etc.)
- All operations update MongoDB

---

### WP3-BE: Task Management (30 min)

**File:** `src/coordination/tasks.ts`
**Dependencies:** MongoDB schemas

**Tasks:**
- [ ] Implement `createTask(title, desc, parentId?)`
- [ ] Implement `assignTask(taskId, agentId)`
- [ ] Implement `updateTaskStatus(taskId, status, result?)`
- [ ] Implement `getTask(taskId)`
- [ ] Implement `getAgentTasks(agentId)`
- [ ] Implement `completeTask(taskId, result)`

**Verification:**
```bash
pnpm test src/__tests__/tasks.test.ts
# Tests:
# - createTask() inserts into MongoDB
# - assignTask() updates status='assigned'
# - updateTaskStatus() validates transitions
# - completeTask() stores result
# - getAgentTasks() returns correct tasks
```

---

### WP4-BE: Context Management (45 min)

**File:** `src/coordination/context.ts`
**Dependencies:** WP3-BE, checkpoints, messages

**Tasks:**
- [ ] Implement `startSession(agentId)`
- [ ] Implement `buildContextPacket(agentId)` - Load checkpoint + messages
- [ ] Implement `injectNotification(agentId, notification)`
- [ ] Implement `trackTokens(agentId, tokensUsed)`
- [ ] Implement checkpoint trigger at 70% threshold

**Verification:**
```bash
pnpm test src/__tests__/context.test.ts
# Tests:
# - buildContextPacket() includes checkpoint if exists
# - buildContextPacket() includes unread messages
# - injectNotification() formats correctly
# - trackTokens() triggers checkpoint at threshold
```

---

### WP5-BE: Claude SDK Runner (1 hour)

**File:** `src/sdk/runner.ts`
**Dependencies:** WP4-BE (context), contracts

**Tasks:**
- [ ] Implement `createClaudeRunner()` factory
- [ ] Implement `run(config, onMessage)` - Execute Claude
- [ ] Load skills from `.claude/skills/` and inject into system prompt
- [ ] Handle streaming responses
- [ ] Parse tool use messages
- [ ] Track token usage

**Verification:**
```bash
pnpm test src/__tests__/sdk-runner.test.ts
# Tests:
# - run() calls Anthropic API
# - Skills loaded and injected
# - System prompt constructed correctly
# - Streaming callback invoked
# - Token usage tracked
```

**Manual verification** (requires API key):
```bash
pnpm tsx scripts/test-sdk-runner.ts
# Should output Claude response
```

---

## Tier 2: Agent Implementation (Hours 2.5-5)

### WP6-BE: Director Agent (1.5 hours)

**File:** `src/agents/director.ts`
**Dependencies:** All Tier 1 services

**Tasks:**
- [ ] Implement `start(taskFromHuman)` - Entry point
- [ ] Implement `decompose(task)` - Break into subtasks
- [ ] Implement `spawnSpecialist(type, taskId)` - Create + assign
- [ ] Implement `coordinateWork()` - Message loop
- [ ] Implement `aggregateResults()` - Combine outputs
- [ ] Implement `checkpoint()` - Save orchestration state

**Verification:**
```bash
pnpm test src/__tests__/director.test.ts
# Tests:
# - decompose() creates tasks in MongoDB
# - spawnSpecialist() creates agent + sandbox
# - coordinateWork() processes messages
# - aggregateResults() combines specialist outputs
# - checkpoint() saves Director state
```

**Integration test:**
```bash
pnpm test src/__tests__/integration.test.ts -t "Director spawns"
# Must spawn 2 specialists and coordinate
```

---

### WP7-BE: Specialist Agent (1 hour)

**File:** `src/agents/specialist.ts`
**Dependencies:** All Tier 1 services

**Tasks:**
- [ ] Implement `start(specialization)` - Entry point
- [ ] Implement `pollForTasks()` - Check inbox
- [ ] Implement `executeTask(task)` - Run research/analysis
- [ ] Implement `reportResult(task, result)` - Send to Director
- [ ] Implement `checkpoint()` - Save specialist state

**Verification:**
```bash
pnpm test src/__tests__/specialist.test.ts
# Tests:
# - pollForTasks() receives message
# - executeTask() processes task
# - reportResult() sends result message
# - checkpoint() saves specialist state
```

**Integration test:**
```bash
pnpm test src/__tests__/integration.test.ts -t "Kill agent → restart"
# Must resume from checkpoint
```

---

## Tier 3: API Layer (Hours 5-6)

### WP8-BE: Fastify Server + Routes (1 hour)

**Files:** `src/api/server.ts`, `src/api/routes/agents.ts`, `src/api/routes/sandboxes.ts`
**Dependencies:** WP6-BE, WP7-BE

**Tasks:**
- [ ] Set up Fastify server with CORS
- [ ] Integrate ts-rest with `@ts-rest/fastify`
- [ ] Implement agent routes (spawn, submitTask, getStatus, kill, restart)
- [ ] Implement sandbox routes (list, get, pause, resume, kill)
- [ ] Add error handling middleware
- [ ] Add request logging

**Verification:**
```bash
pnpm test src/__tests__/api.test.ts
# Tests:
# - POST /api/agents returns 201
# - POST /api/agents/:id/task returns 200
# - GET /api/agents/:id/status returns 200
# - DELETE /api/agents/:id returns 200
# - All routes match contract
```

**Manual verification:**
```bash
pnpm run dev:api  # Start server
curl -X POST http://localhost:3001/api/agents
# Should return AgentResponse
```

---

### WP9-BE: WebSocket Handler (30 min)

**File:** `src/api/websocket.ts`
**Dependencies:** WP8-BE

**Tasks:**
- [ ] Set up WebSocket server
- [ ] Implement event broadcasting
- [ ] Subscribe clients to agent/sandbox events
- [ ] Stream stdout/stderr from sandboxes
- [ ] Emit MongoDB change notifications

**Verification:**
```bash
pnpm test src/__tests__/websocket.test.ts
# Tests:
# - Client connects successfully
# - Events broadcast to subscribed clients
# - Stdout streams to connected clients
```

**Manual verification:**
```bash
# Terminal 1
pnpm run dev:api

# Terminal 2
websocat ws://localhost:3001/ws
# Should receive events
```

---

## Automated Verification Pipeline

### Per-Task Verification

After completing each task:

```bash
# 1. Type check
pnpm typecheck

# 2. Run unit tests for this task
pnpm test src/__tests__/<task>.test.ts

# 3. Run integration tests if applicable
pnpm test src/__tests__/integration.test.ts

# 4. Lint
pnpm lint
```

### Tier Completion Gates

**Tier 1 complete when:**
```bash
pnpm typecheck  # ✅ Zero errors
pnpm test       # ✅ All Tier 1 tests pass
```

**Tier 2 complete when:**
```bash
pnpm test src/__tests__/integration.test.ts  # ✅ All integration tests pass
```

**Tier 3 complete when:**
```bash
pnpm test  # ✅ All tests pass
curl http://localhost:3001/api/agents  # ✅ API responds
```

---

## Timeline (Backend Only)

```
Hour 1-1.5:   WP1-BE (Config) + WP3-BE (Tasks) in parallel
Hour 1.5-2.5: WP2-BE (E2B) + WP4-BE (Context) in parallel
Hour 2.5-3.5: WP5-BE (SDK Runner)
Hour 3.5-5:   WP6-BE (Director) || WP7-BE (Specialist) in parallel
Hour 5-6:     WP8-BE (API) + WP9-BE (WebSocket)
```

**Total:** ~5 hours for full backend with tests

---

## Success Criteria (Backend)

- [ ] All unit tests pass (`pnpm test`)
- [ ] All integration tests pass
- [ ] Zero TypeScript errors (`pnpm typecheck`)
- [ ] API matches frozen ts-rest contract
- [ ] MongoDB operations work
- [ ] E2B sandboxes create/kill/restart
- [ ] Agents coordinate via message bus
- [ ] Checkpoints save/resume work

**Definition of done:** Backend can run headlessly and pass all tests without human intervention.

---

_Backend dependency graph with automated verification gates._
