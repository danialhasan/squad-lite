---
name: hack-build
description: TDD implementation loop. RED tests first, then GREEN implementation. No shortcuts.
allowed-tools: [Read, Write, Edit, Bash, Glob, Grep, Task, TodoWrite, mcp__filesystem-with-morph__warpgrep_codebase_search]
---

# Hack Build Skill

## Purpose

Implement work units using TDD discipline. **RED before GREEN. No exceptions.**

## When to Use

- After `/hack-plan` with approved tier structure
- For each work unit in the plan
- When implementing any feature

---

## Core Philosophy

```
┌─────────────────────────────────────────────────────────────┐
│                     TDD LOOP                                │
│                                                             │
│   ┌───────┐      ┌───────┐      ┌──────────┐               │
│   │  RED  │─────▶│ GREEN │─────▶│ REFACTOR │──┐            │
│   │ Test  │      │ Impl  │      │ Clean    │  │            │
│   └───────┘      └───────┘      └──────────┘  │            │
│       ▲                                        │            │
│       └────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

**Why TDD at a hackathon?**
- Tests are your safety net for fast iteration
- RED tests define "done" unambiguously
- Catches regressions when you're moving fast
- Judges respect working code with tests

---

## Execution Protocol

### Phase 1: RED — Write Failing Tests

**Before writing ANY implementation:**

1. Read the work unit spec from `docs/plan.md`
2. Write test(s) that define the expected behavior
3. Run tests — they MUST fail
4. Screenshot/log the failure

```typescript
// Example: Testing a collaboration message handler
describe('CollaborationBus', () => {
  it('should broadcast message to all connected agents', async () => {
    const bus = new CollaborationBus()
    const agent1 = await bus.connect('agent-1')
    const agent2 = await bus.connect('agent-2')

    const received: Message[] = []
    agent2.onMessage(msg => received.push(msg))

    await agent1.broadcast({ type: 'SYNC', payload: { state: 'ready' } })

    expect(received).toHaveLength(1)
    expect(received[0].type).toBe('SYNC')
  })
})
```

**Run and confirm RED:**
```bash
pnpm test src/collaboration/bus.test.ts
# Expected: FAIL - CollaborationBus is not defined
```

### Phase 2: GREEN — Make Tests Pass

**Now write the minimal implementation:**

1. Implement just enough to make tests pass
2. No extra features, no "nice to haves"
3. Run tests after each change
4. Stop when GREEN

```typescript
// Minimal implementation to pass the test
export class CollaborationBus {
  private agents = new Map<string, Agent>()

  async connect(agentId: string): Promise<Agent> {
    const agent = new Agent(agentId, this)
    this.agents.set(agentId, agent)
    return agent
  }

  broadcast(message: Message, fromId: string) {
    for (const [id, agent] of this.agents) {
      if (id !== fromId) agent.handleMessage(message)
    }
  }
}
```

**Run and confirm GREEN:**
```bash
pnpm test src/collaboration/bus.test.ts
# Expected: PASS
```

### Phase 3: REFACTOR — Clean Up

**Only after GREEN:**

1. Remove duplication
2. Improve naming
3. Optimize if needed (but don't over-engineer)
4. Run tests again — still GREEN

---

## Squad Stack Patterns

When building with Squad's tech stack, follow these patterns:

### ts-rest Contract (Tier 0 - Always First)

```typescript
// packages/contracts/src/{feature}.contract.ts
import { initContract } from '@ts-rest/core'
import { z } from 'zod'

const c = initContract()

export const featureContract = c.router({
  create: {
    method: 'POST',
    path: '/api/features',
    body: z.object({
      name: z.string().min(1),
      config: z.record(z.unknown()).optional(),
    }),
    responses: {
      201: z.object({ id: z.string().uuid(), name: z.string() }),
      400: z.object({ error: z.string() }),
    },
  },
  list: {
    method: 'GET',
    path: '/api/features',
    responses: {
      200: z.array(z.object({ id: z.string(), name: z.string() })),
    },
  },
})
```

### Fastify Route (Tier 1 - Backend)

```typescript
// services/backend/src/api/{feature}.routes.ts
import { initServer } from '@ts-rest/fastify'
import { featureContract } from '@squad/contracts'

const s = initServer()

export const featureRoutes = s.router(featureContract, {
  create: async ({ body }) => {
    const id = crypto.randomUUID()
    // Implementation
    return { status: 201, body: { id, name: body.name } }
  },
  list: async () => {
    // Implementation
    return { status: 200, body: [] }
  },
})
```

### Pinia Store (Tier 1 - Frontend)

```typescript
// apps/desktop/ui/src/stores/{feature}.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { client } from '@/api/client'

export const useFeatureStore = defineStore('feature', () => {
  const items = ref<Feature[]>([])
  const loading = ref(false)

  const fetchItems = async () => {
    loading.value = true
    try {
      const response = await client.feature.list()
      if (response.status === 200) {
        items.value = response.body
      }
    } finally {
      loading.value = false
    }
  }

  const createItem = async (name: string) => {
    const response = await client.feature.create({ body: { name } })
    if (response.status === 201) {
      items.value.push(response.body)
      return response.body
    }
    throw new Error('Failed to create')
  }

  return { items, loading, fetchItems, createItem }
})
```

### Vue Component (Tier 1/2 - Frontend)

```vue
<!-- apps/desktop/ui/src/components/{Feature}.vue -->
<script setup lang="ts">
import { useFeatureStore } from '@/stores/feature'

const store = useFeatureStore()

onMounted(() => {
  store.fetchItems()
})
</script>

<template>
  <div class="p-4">
    <ul v-if="store.items.length" class="space-y-2">
      <li v-for="item in store.items" :key="item.id">
        {{ item.name }}
      </li>
    </ul>
    <p v-else class="text-muted-foreground">No items yet</p>
  </div>
</template>
```

---

## Hackathon Speed Tips

### Use Task Subagents for Parallel Work

Within a tier, spawn parallel engineers:

```
Task(subagent_type="software-engineer", model="opus", prompt="
  Work unit: WU-2 - Create API endpoint
  Spec: [paste spec]

  INSTRUCTIONS:
  1. Write RED test first
  2. Implement to GREEN
  3. Report when done with test output
")
```

### Use WarpGrep for Pattern Discovery

Before implementing, find similar patterns:

```
warp_grep: "find examples of API route handlers in this codebase"
warp_grep: "find how WebSocket connections are managed"
```

### Minimal Dependencies

```
Don't: Import a library for one function
Do: Write the 10 lines yourself

Don't: Add complex state management
Do: Use simple objects and functions

Don't: Build for scale during hackathon
Do: Build for demo day
```

---

## Agent Collaboration Focus

**Since this hackathon is about agentic orchestration, prioritize:**

1. **Message passing** — How agents communicate
2. **Context sharing** — How agents share state
3. **Coordination** — How agents synchronize
4. **Handoffs** — How work transfers between agents

**Example tests for agent collab:**

```typescript
// Message protocol
it('should encode messages with correlation IDs', () => {
  const msg = createMessage('TASK_COMPLETE', { result: 'success' })
  expect(msg.correlationId).toBeDefined()
  expect(msg.timestamp).toBeDefined()
})

// Context sharing
it('should merge context without conflicts', () => {
  const ctx1 = { user: 'A', state: 'active' }
  const ctx2 = { user: 'A', task: 'pending' }
  const merged = mergeContext(ctx1, ctx2)
  expect(merged).toEqual({ user: 'A', state: 'active', task: 'pending' })
})

// Coordination
it('should handle concurrent agent registrations', async () => {
  const registrations = await Promise.all([
    coordinator.register('agent-1'),
    coordinator.register('agent-2'),
    coordinator.register('agent-3'),
  ])
  expect(new Set(registrations.map(r => r.id)).size).toBe(3)
})
```

---

## Completion Criteria

For each work unit:

- [ ] RED tests written and failing
- [ ] Implementation makes tests GREEN
- [ ] No TypeScript errors (`pnpm typecheck`)
- [ ] Ready for integration

---

## Output

- Implementation code with passing tests
- Test output showing GREEN
- Ready for `/hack-verify`
