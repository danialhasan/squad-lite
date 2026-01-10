# SDLC Loop — Complete Automation System

**Created:** 2026-01-08
**Status:** Ready for testing

---

> **⚠️ CRITICAL: All Phases Are Mandatory**
>
> **INTERVIEW → DISCOVER → PLAN** are ALWAYS required, never optional.
>
> **Why:** Compensates for model limitations:
> - **Interview** → Prevents assumption-driven failures
> - **Discover** → Compensates for knowledge cutoff (re-learns codebase)
> - **Plan** → Compensates for baked-in assumptions (validates empirically)
>
> Even for "simple" features, all phases run. This is by design.

---

## What We Built

A **composable skill system** that automates Squad's entire software development and testing lifecycle, with stop-hook enforcement preventing premature completion.

### File Structure

```
.claude/skills/
├── sdlc-loop/
│   ├── README.md            ← YOU ARE HERE (overview)
│   ├── skill.md             ← Master orchestrator (lean index)
│   ├── SPEC.md              ← Full implementation spec (detailed)
│   └── hooks/
│       └── stop-gate.sh     ← Stop hook script (executable)
│
├── frontend-build/
│   └── skill.md             ← Vue + Pinia + TypeScript patterns
│
├── backend-build/
│   └── skill.md             ← Fastify + ts-rest + Supabase patterns
│
└── fullstack-build/
    └── skill.md             ← Orchestrates frontend + backend in parallel
```

**Configuration:**
- `.claude/settings.json` — Hook registration

---

## How It Works

### The Loop

```
USER INVOKES: /sdlc-loop

    ↓
┌─────────────────────────────────────────────────────────────┐
│  1. INTERVIEW (always)                                      │
│     - Skill('interview')                                    │
│     - Output: docs/specs/{feature}.md + interview.json      │
│                                                             │
│  2. DISCOVER (always)                                       │
│     - Skill('squad-discover')                               │
│     - 5 parallel WarpGrep scouts re-learn codebase          │
│     - Output: discover.json                                 │
│     - WHY: Compensates for knowledge cutoff                 │
│                                                             │
│  3. PLAN (always)                                           │
│     - Skill('squad-collab')                                 │
│     - Depth-progressive planning with empirical validation  │
│     - Output: plan.json                                     │
│     - WHY: Compensates for baked-in assumptions             │
│                                                             │
│  4. BUILD (scope-detected)                                  │
│     - Skill('frontend-build') OR                            │
│     - Skill('backend-build') OR                             │
│     - Skill('fullstack-build')                              │
│     - Output: build.json + code files                       │
│                                                             │
│  5. TEST (parallel)                                         │
│     ├─ Backend: Task(vitest)                                │
│     └─ E2E: Task(playwright)                                │
│     - Output: backend.json + e2e.json + videos/*.webm       │
│                                                             │
│  6. VERIFY (human review)                                   │
│     - Skill('verify')                                       │
│     - Human reviews Playwright videos                       │
│     - Output: verify.json + screenshots/                    │
│                                                             │
│  7. STOP HOOK GATE                                          │
│     - Validates all receipts                                │
│     - If ANY missing → Exit 2 (block, continue)             │
│     - If ALL valid → Exit 0 (allow stop)                    │
│                                                             │
│  8. AUTO-COMMIT                                             │
│     - git commit with descriptive message                   │
│     - Output: commit.json                                   │
└─────────────────────────────────────────────────────────────┘

RESULT: Fully tested, verified, committed feature
```

### The Enforcement

**Stop Hook** (`hooks/stop-gate.sh`):
- Runs every time Claude tries to stop
- Checks `.squad/receipts/{date}/{session-id}/` for required receipts
- Validates each receipt: `status === 'pass'`, artifacts exist, SHA-256 hashes match
- Blocks if any receipt missing/invalid
- Shows diagnostic checklist to guide Claude

**Exit Codes:**
- `exit 0` → Allow stop (loop complete or bailout)
- `exit 2` → Block stop, inject diagnostic, force continuation

---

## Safety Mechanisms

### 1. Agent-Triggered Bailout

When Claude hits a hard blocker (broken MCP, infrastructure failure):

```
<bailout>Electron MCP not responding on port 9222</bailout>
<bailout>Electron MCP not responding on port 9222</bailout>
<bailout>Electron MCP not responding on port 9222</bailout>
```

**Stop hook response:**
- Detects 3+ `<bailout>` tags
- Writes notification to `.squad/notifications/bailout-{timestamp}.md`
- Sounds system alert
- **Exits 0** (allows stop, does NOT force continuation)

### 2. Loop Detection (Auto-Bailout)

If same phase fails **10+ times consecutively**:

```
Checkpoint tracks:
- consecutive_failures: 12
- last_error: "Backend tests failing: cannot connect to database"

Stop hook:
- Detects consecutive_failures >= 10
- Writes auto-bailout notification
- Exits 0 (allows stop)
```

Prevents infinite loops when there's a systemic issue.

### 3. Emergency Stop (Human-Triggered)

User types `EMERGENCY STOP` in any message:

```
USER: EMERGENCY STOP

CLAUDE: 🚨 Emergency stop detected. Confirm? [y/N]

Stop hook:
- Checks SDLC_EMERGENCY_STOP env var or checkpoint.emergency_stop
- Exits 0 immediately (bypasses all gates)
```

---

## Receipt System

### Storage

```
.squad/receipts/
└── 2026-01-08/
    └── sess_abc123/
        ├── CHECKPOINT.json           # Resume state
        ├── interview.json            # Interview complete
        ├── discover.json             # Discovery complete
        ├── plan.json                 # Plan complete
        ├── build.json                # Build complete
        ├── backend.json              # Backend tests pass
        ├── e2e.json                  # E2E tests pass
        ├── verify.json               # Human approved
        └── artifacts/
            ├── spec.md               # Interview output
            ├── discovery-report.md   # Discovery output
            ├── backend-tests.log     # Test logs
            ├── videos/               # Playwright recordings
            │   ├── crud-flow.webm
            │   └── validation.webm
            └── screenshots/          # Electron MCP screenshots
                ├── 001-initial.png
                └── final.png
```

### Receipt Schema

Every receipt follows this structure:

```json
{
  "phase": "backend_tests",
  "session_id": "sess_abc123",
  "timestamp": "2026-01-08T15:30:00Z",
  "status": "pass",
  "duration_ms": 12340,

  "git_sha": "abc123...",
  "git_branch": "main",
  "node_version": "v20.10.0",

  "artifacts": [
    {
      "type": "log",
      "path": ".squad/receipts/2026-01-08/sess_abc123/backend-tests.log",
      "hash": "sha256:def456...",
      "size_bytes": 45678
    }
  ],

  "test_summary": {
    "total": 47,
    "passed": 47,
    "failed": 0,
    "skipped": 0
  }
}
```

SHA-256 hashes prevent tampering.

---

## Domain Skills (Encode Squad Patterns)

### `/frontend-build`

**Pattern:** Store → Composable → Component (ADR-024)

**Creates:**
1. Pinia store (`src/stores/{feature}Store.ts`)
2. Composable (`src/composables/use{Feature}.ts`)
3. Components (`src/components/{feature}/*.vue`)
4. Route (`src/router/index.ts`)
5. API client integration

**Receipts:**
- frontend.store.created
- frontend.composable.created
- frontend.component.created
- frontend.route.added
- frontend.compiles
- frontend.renders (screenshot)

### `/backend-build`

**Pattern:** Contract → Routes → Service → Database

**Creates:**
1. ts-rest contract (`packages/contracts/src/{feature}.contract.ts`)
2. Module structure (`services/backend/src/modules/{feature}/`)
3. Service factory (`{feature}.service.ts`)
4. Routes (`{feature}.routes.ts`)
5. Migration (`supabase/migrations/`)
6. Tests (`__tests__/`)

**Receipts:**
- backend.contract.defined
- backend.service.implemented
- backend.routes.implemented
- backend.migration.applied
- backend.tests.passing

### `/fullstack-build`

**Pattern:** Contract-first, parallel implementation, integration verification

**Orchestrates:**
1. Define shared contract
2. Spawn backend agent + frontend agent (parallel)
3. Wait for both to complete
4. Run integration tests
5. Verify data flow end-to-end

**Receipts:**
- fullstack.contract.defined
- fullstack.backend.complete
- fullstack.frontend.complete
- fullstack.integration.verified
- fullstack.e2e.passing

---

## How to Use

### Basic Invocation

```bash
/sdlc-loop
```

Claude will:
1. Show DAG visualization
2. Start with `/interview` (ask you questions)
3. Detect scope from your answers (frontend/backend/fullstack)
4. Execute DAG phases automatically
5. Run tests in parallel
6. Ask you to review videos
7. Auto-commit when all receipts valid

**Stop hook will block** until everything is complete.

### Resume from Checkpoint

If session was interrupted (compaction, crash, emergency stop):

```bash
/sdlc-loop --resume
```

Reads checkpoint, skips completed phases, continues from where it left off.

### Force Scope

If you want to override auto-detection:

```bash
/sdlc-loop --scope=frontend     # Only frontend
/sdlc-loop --scope=backend      # Only backend
/sdlc-loop --scope=fullstack    # Full stack
```

---

## Escape Hatches

### For Hard Blockers

When Claude encounters something it cannot fix (MCP broken, infrastructure down):

```
Claude output:
"I've tried 3 times to connect to Electron MCP but port 9222 is not responding.
This appears to be an infrastructure issue."

<bailout>Electron MCP connection failed - port 9222 not responding</bailout>
<bailout>Electron MCP connection failed - port 9222 not responding</bailout>
<bailout>Electron MCP connection failed - port 9222 not responding</bailout>

Stop hook:
- Detects 3+ bailout tags
- Writes notification
- Sounds alert
- Allows stop (exit 0)
```

**Human then:**
1. Reads `.squad/notifications/bailout-*.md`
2. Fixes the issue (starts Electron app with debugging)
3. Runs `/sdlc-loop --resume`

### For Emergency Abort

If you need to stop immediately:

```
USER: EMERGENCY STOP

Claude: Confirms emergency stop
Sets: checkpoint.emergency_stop = true

Stop hook:
- Reads checkpoint
- Sees emergency_stop flag
- Allows immediate termination (exit 0)
```

### For Infinite Loops

If same phase fails 10+ times with same error:

```
Checkpoint:
- consecutive_failures: 10
- last_error: "Backend tests: database connection refused"

Stop hook:
- Detects loop
- Writes auto-bailout notification
- Allows stop (exit 0)
```

---

## Next Steps

### Testing the System

**Recommended test flow:**

1. **Simple feature test:**
   ```bash
   /sdlc-loop
   ```
   - When asked: "Build a simple frontend-only feature (just a new button)"
   - Should complete: interview → discover → plan → frontend-build → e2e → verify → commit
   - NOTE: All phases run even for simple features (compensates for model limitations)

2. **Failure handling test:**
   - Make a test intentionally fail (edit test file)
   - Invoke `/sdlc-loop`
   - Verify Claude fixes the failure and re-runs
   - Verify stop hook blocks until test passes

3. **Bailout test:**
   - Stop Electron app (break port 9222)
   - Invoke `/sdlc-loop`
   - When verify phase fails 3 times, type bailout tags manually
   - Verify stop hook detects and allows stop with notification

4. **Emergency stop test:**
   - Invoke `/sdlc-loop`
   - During any phase, type `EMERGENCY STOP`
   - Verify immediate termination with checkpoint saved

5. **Resume test:**
   - Start `/sdlc-loop`, let it complete interview
   - Trigger compaction or emergency stop
   - Invoke `/sdlc-loop --resume`
   - Verify it skips interview and continues from next phase

### Integration with Squad

This system replaces `squad-build` for individual feature development.

**Existing skills that should invoke /sdlc-loop:**
- `/squad-manager` — When assigning ticket to engineer
- `/squad-director` — When orchestrating autonomous development
- Human developers — For manual feature development

**Skills that /sdlc-loop composes:**
- `/interview` — Requirements gathering
- `/squad-discover` — Codebase discovery
- `/squad-collab` — Planning
- `/frontend-build` — Vue implementation
- `/backend-build` — API implementation
- `/fullstack-build` — Full-stack orchestration
- `/verify` — E2E verification

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SDLC LOOP SYSTEM                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  USER INVOCATION                                                    │
│  ───────────────                                                    │
│  /sdlc-loop                                                         │
│      │                                                              │
│      ▼                                                              │
│  ┌──────────────────────────────────────────────────────────┐      │
│  │  skill.md (Master Orchestrator)                          │      │
│  │  - Show DAG visualization                                │      │
│  │  - Check for checkpoint (resume logic)                   │      │
│  │  - Execute phases via Skill tool                         │      │
│  │  - Track receipts                                        │      │
│  └──────────────────────────────────────────────────────────┘      │
│      │                                                              │
│      ├─→ Skill('interview')          → interview.json              │
│      ├─→ Skill('squad-discover')     → discover.json               │
│      ├─→ Skill('squad-collab')       → plan.json                   │
│      ├─→ Skill('frontend-build')     → build.json + code           │
│      │   OR Skill('backend-build')                                 │
│      │   OR Skill('fullstack-build')                               │
│      ├─→ Task(backend tests)         → backend.json + logs         │
│      ├─→ Task(E2E tests)             → e2e.json + videos           │
│      └─→ Skill('verify')             → verify.json + screenshots   │
│                                                                     │
│  STOP HOOK GATE                                                    │
│  ───────────────                                                    │
│  hooks/stop-gate.sh                                                 │
│      │                                                              │
│      ├─ Check for bailout tags (3+) → Allow stop                   │
│      ├─ Check for emergency stop    → Allow stop                   │
│      ├─ Check for loop (10+ fails)  → Auto-bailout, allow stop     │
│      ├─ Validate all receipts       → If valid: allow stop         │
│      └─ If missing/invalid          → Exit 2 (block, continue)     │
│                                         │                           │
│                                         ▼                           │
│                                  Show diagnostic                    │
│                                  Force continuation                 │
│                                                                     │
│  COMPLETION                                                         │
│  ──────────                                                         │
│  All receipts valid → Auto-commit → DONE                           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Domain Skill Patterns

### Frontend Pattern (ADR-024)

```
LAYER 1: Pinia Store
  - defineStore with state, getters, actions
  - Owns all reactive data

LAYER 2: Composable
  - Wraps store with storeToRefs
  - Adds API integration
  - Handles lifecycle (onMounted, onUnmounted)

LAYER 3: Component
  - Uses composable (not store directly)
  - Renders UI
  - Emits events
```

**Example:**
```typescript
// Store
const useFeatureStore = defineStore('feature', {
  state: () => ({ items: [] }),
  actions: { setItems(items) { this.items = items } }
})

// Composable
export const useFeature = () => {
  const store = useFeatureStore()
  const { items } = storeToRefs(store)

  const fetchItems = async () => {
    const data = await api.features.list()
    store.setItems(data)
  }

  onMounted(() => fetchItems())

  return { items, fetchItems }
}

// Component
<script setup>
const { items } = useFeature()
</script>
```

### Backend Pattern (ADR-029)

```
LAYER 1: ts-rest Contract
  - Zod schemas for request/response
  - Single source of truth

LAYER 2: Fastify Routes
  - ts-rest server implementation
  - Auth, logging, error handling

LAYER 3: Service Layer
  - Factory functions (NO classes)
  - Business logic
  - Database access

LAYER 4: Supabase
  - RLS policies for security
  - Service client for bypass
```

**Example:**
```typescript
// Contract
export const featureContract = c.router({
  create: {
    method: 'POST',
    path: '/api/v1/features',
    body: CreateFeatureSchema,
    responses: { 201: FeatureResponseSchema }
  }
})

// Service
export const makeFeatureService = ({ db }) => ({
  create: async (data) => {
    return await db.from('features').insert(data)
  }
})

// Routes
export const featureRouter = s.router(featureContract, {
  create: async ({ body, request }) => {
    const service = makeFeatureService({ db: serviceClient })
    const feature = await service.create(body)
    canonical(request, { event: 'feature.created' })
    return { status: 201, body: feature }
  }
})
```

### Fullstack Pattern

```
1. Define contract (shared type truth)
2. Parallel implementation:
   ├─ Backend agent implements contract
   └─ Frontend agent uses contract
3. Integration verification:
   - API curl test
   - E2E Playwright test
   - Database state check
```

---

## Receipts Reference

| Receipt | Phase | Status Criteria |
|---------|-------|-----------------|
| `interview.json` | Interview | spec.md exists, scope detected |
| `discover.json` | Discover | 5 scouts completed, patterns found |
| `plan.json` | Plan | Approach defined, dependencies mapped |
| `build.json` | Build | Files created, compiles |
| `backend.json` | Backend Tests | All tests pass, 0 failures |
| `e2e.json` | E2E Tests | All specs pass, videos captured |
| `verify.json` | Verify | Human approved videos, 0 console errors |
| `commit.json` | Commit | Git commit created, SHA recorded |

---

## Stop Hook Details

### Configuration

File: `.claude/settings.json`

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "bash .claude/skills/sdlc-loop/hooks/stop-gate.sh"
          }
        ]
      }
    ]
  }
}
```

### Script Logic

```bash
#!/bin/bash

# 1. Check emergency stop (highest priority)
if [[ "$SDLC_EMERGENCY_STOP" == "true" ]]; then
  exit 0  # Allow stop immediately
fi

# 2. Check for active loop
CHECKPOINT=$(find .squad/receipts -name CHECKPOINT.json -mmin -60)
if [[ -z "$CHECKPOINT" ]]; then
  exit 0  # No active loop, allow stop
fi

# 3. Check for loop detection
if [[ consecutive_failures >= 10 ]]; then
  # Write auto-bailout notification
  # Sound alert
  exit 0  # Allow stop
fi

# 4. Check for agent bailout (3+ <bailout> tags)
if grep -c "<bailout>" | >= 3; then
  # Write bailout notification
  # Sound alert
  exit 0  # Allow stop
fi

# 5. Validate all required receipts
for receipt in "${REQUIRED_RECEIPTS[@]}"; do
  if ! validate_receipt "$receipt"; then
    ALL_PASS=false
  fi
done

# 6. Decision
if $ALL_PASS; then
  exit 0  # All receipts valid, allow stop
else
  # Show diagnostic
  exit 2  # Block stop, force continuation
fi
```

---

## Files Created

### Skills (4 files)

1. **`.claude/skills/sdlc-loop/skill.md`** (150 lines)
   - Master orchestrator
   - DAG definition
   - Phase rules
   - Points to SPEC for details

2. **`.claude/skills/frontend-build/skill.md`** (600+ lines)
   - Complete Vue + Pinia pattern
   - Store → Composable → Component
   - API integration via ts-rest
   - Testing patterns
   - Anti-patterns

3. **`.claude/skills/backend-build/skill.md`** (800+ lines)
   - Complete Fastify + ts-rest pattern
   - Contract → Routes → Service → Database
   - Factory functions (no classes)
   - RLS enforcement
   - Canonical logging
   - Migration patterns

4. **`.claude/skills/fullstack-build/skill.md`** (600+ lines)
   - Orchestration of frontend + backend
   - Parallel implementation strategy
   - Integration testing protocol
   - Wiring verification
   - E2E test patterns

### Specifications

5. **`.claude/skills/sdlc-loop/SPEC.md`** (900+ lines)
   - Complete implementation spec
   - DAG architecture
   - Receipt schemas
   - Checkpoint system
   - Safety mechanisms (bailout, emergency stop, loop detection)
   - UX flows

### Scripts

6. **`.claude/skills/sdlc-loop/hooks/stop-gate.sh`** (320 lines)
   - Stop hook implementation
   - Receipt validation
   - SHA-256 integrity checks
   - Bailout detection
   - Loop detection
   - Enhanced diagnostics

### Configuration

7. **`.claude/settings.json`** (updated)
   - Registered Stop hook

---

## Testing Plan

### Phase 1: Manual Smoke Test

1. Invoke `/sdlc-loop`
2. Answer interview questions for a simple feature
3. Let it run through all phases
4. Verify stop hook blocks until tests pass
5. Approve videos
6. Verify auto-commit happens

### Phase 2: Failure Recovery Test

1. Break a test intentionally
2. Invoke `/sdlc-loop`
3. Verify Claude detects failure, fixes it, re-runs
4. Verify stop hook blocks until fixed

### Phase 3: Bailout Test

1. Stop Electron app
2. Invoke `/sdlc-loop`
3. When verify fails repeatedly, output bailout tags
4. Verify stop hook allows stop with notification

### Phase 4: Resume Test

1. Start `/sdlc-loop`
2. Complete interview + discover phases
3. Trigger emergency stop
4. Invoke `/sdlc-loop --resume`
5. Verify skips completed phases (interview, discover), continues from plan

---

## Known Limitations

1. **Playwright video paths:** Videos are saved in `test-results/videos/` but this directory is in `.gitignore`. Receipts reference them but they won't be in git.

2. **Human approval blocking:** If human doesn't approve videos, loop will block forever. Consider timeout.

3. **Checkpoint staleness:** Checkpoints older than 60 minutes are ignored. Long-running sessions may lose state.

4. **No rollback:** If auto-commit creates bad code, must manually revert.

---

## Future Enhancements

- [ ] Web dashboard for receipt visualization
- [ ] Upload receipts to Squad backend for persistence
- [ ] Linear integration (update ticket status automatically)
- [ ] Parallel discovery (run discover while user is answering interview)
- [ ] Smart checkpoint merging (multiple active loops)
- [ ] Receipt diff (compare receipts across sessions)

---

*Created: 2026-01-08 by Claude Sonnet 4.5 via /interview skill*
