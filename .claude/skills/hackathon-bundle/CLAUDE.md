# Claude Code — Hackathon Mode

**Version:** 1.0 (2026-01-09)
**Scope:** Rapid hackathon development with proven workflows
**Philosophy:** Discover → Interview → Plan → Build → Verify → Ship

---

## Quick Start (Read in Order)

1. **This file** (~300 lines) — Hackathon workflow and skills
2. **Project README.md** — Setup, dependencies, how to run
3. **docs/specs/*.md** — What we're building (created via `/hack-interview`)

**Total reading: ~5 min**

---

## Hackathon Skill Router

| Phase | Skill | Purpose | Invoke |
|-------|-------|---------|--------|
| 1 | **Interview** | Extract requirements from vague ideas | `/hack-interview` |
| 2 | **Discover** | Map codebase with 5 parallel scouts | `/hack-discover` |
| 3 | **Plan** | Design tiered implementation | `/hack-plan` |
| 4 | **Build** | TDD loop (RED → GREEN) | `/hack-build` |
| 5 | **Verify** | Prove it works with screenshots | `/hack-verify` |
| Full | **Loop** | Orchestrate all phases | `/hack-loop` |

---

## The Workflow DAG

```
┌─────────────────────────────────────────────────────────────────┐
│                      HACKATHON LOOP                              │
│                                                                 │
│   /hack-interview ────▶ spec.md                                  │
│          │                                                       │
│          ▼                                                       │
│   /hack-discover ─────▶ discovery.md                             │
│          │                                                       │
│          ▼                                                       │
│   /hack-plan ─────────▶ plan.md (with tiers)                     │
│          │                                                       │
│          ▼                                                       │
│   ┌──────────────────────────────────────────┐                   │
│   │  FOR EACH TIER:                          │                   │
│   │    /hack-build (parallel work units)     │                   │
│   │           │                              │                   │
│   │           ▼                              │                   │
│   │    /hack-verify (tier checkpoint)        │                   │
│   │           │                              │                   │
│   │    PASS? ─── NO ──▶ FIX & RETRY         │                   │
│   └───────────┼──────────────────────────────┘                   │
│               │                                                  │
│               ▼                                                  │
│   DEMO READY ✓                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Core Philosophy

### 1. No Assumptions
Always interview + discover first. **Never code on guesses.**

### 2. Tests Define Done
- RED tests are the contract
- GREEN = you're done
- Refactoring doesn't change behavior

### 3. Evidence > Claims
- **Screenshots or it didn't happen**
- Tests pass or it's not done
- Verification at each tier

### 4. Parallel Scouts
5 agents searching in parallel = 5x faster codebase understanding

### 5. Tiered Execution
Dependencies first. Enables parallelization with teammates.

---

## Design Rules (BLOCKING)

These rules make code safe for rapid iteration:

### Grepability First
```typescript
// ✅ GOOD (grep-able)
export const createClient = () => { ... }
import { createClient } from '@app/lib/client'

// ❌ BAD (not grep-able)
export default createClient
import createClient from '../../lib/client'
```

### No Classes
```typescript
// ✅ GOOD (functional)
export const createCounter = (initial: number) => ({
  value: initial,
  increment: () => { ... }
})

// ❌ BAD (class-based)
export class Counter { ... }
```

### Type Safety with Zod
```typescript
// ✅ GOOD (runtime validation)
import { z } from 'zod'
const UserSchema = z.object({ id: z.string(), name: z.string() })
const user = UserSchema.parse(data)

// ❌ BAD (only compile-time)
const user = data as User
```

---

## Squad Stack Patterns

When building with the Squad tech stack:

### ts-rest Contracts
```typescript
// packages/contracts/src/{feature}.contract.ts
import { initContract } from '@ts-rest/core'
import { z } from 'zod'

const c = initContract()

export const featureContract = c.router({
  create: {
    method: 'POST',
    path: '/features',
    body: z.object({ name: z.string() }),
    responses: { 201: z.object({ id: z.string() }) },
  },
})
```

### Pinia Stores
```typescript
// apps/desktop/ui/src/stores/{feature}.ts
import { defineStore } from 'pinia'

export const useFeatureStore = defineStore('feature', () => {
  const items = ref<Feature[]>([])

  const fetchItems = async () => { ... }

  return { items, fetchItems }
})
```

### Fastify Routes
```typescript
// services/backend/src/api/{feature}.routes.ts
import { initServer } from '@ts-rest/fastify'
import { featureContract } from '@squad/contracts'

export const featureRoutes = initServer().router(featureContract, {
  create: async ({ body }) => {
    // Implementation
    return { status: 201, body: { id: 'new-id' } }
  },
})
```

---

## Verification Tools

### Playwriter MCP (Recommended for Web Apps)
```javascript
// Navigate and screenshot
await page.goto('http://localhost:5173');
await screenshotWithAccessibilityLabels({ page });

// Find interactive elements
const snapshot = await accessibilitySnapshot({ page });

// Interact using aria-ref
await page.locator('aria-ref=e5').click();
await page.locator('aria-ref=e12').fill('test input');

// Check for errors
const logs = await getLatestLogs({ page, search: /error/i });
```

### Terminal Verification (Backend)
```bash
# Start server
pnpm dev &

# Test endpoints
curl -X POST http://localhost:3000/api/features \
  -H "Content-Type: application/json" \
  -d '{"name": "test"}'

# Verify response
curl http://localhost:3000/api/features | jq .
```

---

## Parallel Execution (2-Person Team)

```
Person A (Backend)          Person B (Frontend)
─────────────────────────────────────────────────
[TOGETHER] /hack-interview
[TOGETHER] /hack-discover
[TOGETHER] /hack-plan

Tier 0: Contracts + Types   Tier 0: (wait)

Tier 1: API endpoints       Tier 1: Components
        ↓                           ↓
[SYNC] Review each other's work

Tier 2: Integration (together)
        ↓
[SYNC] /hack-verify (final)
```

---

## Time Budget (Sample 3h Feature)

| Phase | Time | Cumulative |
|-------|------|------------|
| Interview | 10 min | 10 min |
| Discover | 5 min | 15 min |
| Plan | 10 min | 25 min |
| Tier 0 (build + verify) | 30 min | 55 min |
| Tier 1 (build + verify) | 45 min | 1h 40m |
| Tier 2 (build + verify) | 45 min | 2h 25m |
| Buffer | 35 min | 3h |

---

## Bailout Conditions

If stuck > 30 min on same issue:

1. **Simplify scope** — Move to P2, ship what works
2. **Ask for help** — Sync with teammate
3. **Pivot approach** — Different implementation strategy
4. **Ship MVP** — Working demo > perfect code

**Hackathon rule: Working demo beats perfect code**

---

## Checkpoint System

Track progress in `docs/checkpoint.json`:

```json
{
  "feature": "agent-collaboration",
  "current_phase": "build",
  "current_tier": 1,
  "checkpoints": {
    "interview": { "status": "complete" },
    "discover": { "status": "complete" },
    "plan": { "status": "complete" },
    "tier_0": { "status": "complete" },
    "tier_1": { "status": "in_progress" }
  }
}
```

---

## Output Artifacts

| Phase | Artifact |
|-------|----------|
| Interview | `docs/specs/{feature}.md` |
| Discover | `docs/discovery.md` |
| Plan | `docs/plan.md` |
| Verify | `docs/verify-{tier}.md` |
| Checkpoint | `docs/checkpoint.json` |

---

## Quick Commands

```bash
# Development
pnpm install          # Install dependencies
pnpm dev              # Start dev server
pnpm test             # Run tests
pnpm typecheck        # Check types
pnpm lint             # Lint code

# Skills (invoke in Claude)
/hack-interview       # Start requirements extraction
/hack-discover        # Map codebase
/hack-plan            # Design tiers
/hack-build           # TDD implementation
/hack-verify          # Prove it works
/hack-loop            # Full cycle
```

---

## Anti-Patterns

| Don't | Do Instead |
|-------|------------|
| Skip interview | Always clarify requirements first |
| Code without tests | Write RED test first |
| Assume codebase structure | Run `/hack-discover` |
| Scope creep | Use tiers: P0 for MVP, P2 for stretch |
| Manual verification only | Screenshot or it didn't happen |
| Work in isolation | Sync at tier boundaries |

---

## MCP Tools Required

This workflow uses these MCP servers:

| Server | Purpose | Required? |
|--------|---------|-----------|
| `filesystem-with-morph` | WarpGrep semantic search | **Yes** |
| `playwriter` | Browser automation & screenshots | **Yes** |
| `chrome-devtools` | Simple browser verification | Optional |

See `INSTALL.md` for setup instructions.

---

## Success Checklist (Before Demo)

- [ ] P0 requirements complete
- [ ] All tiers verified with screenshots
- [ ] Demo scenario works end-to-end
- [ ] Tests pass
- [ ] No console errors
- [ ] Code follows design rules

---

## Credits

Extracted from Squad's CTO workflow, battle-tested over 3 months of AI-native development.

**Skill files:** `.claude/skills/hackathon-bundle/skills/`
**Templates:** `.claude/skills/hackathon-bundle/templates/`

---

_Last updated: 2026-01-09_
