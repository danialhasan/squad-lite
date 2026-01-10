# /sdlc-loop - Implementation Specification

**Status:** Draft
**Author:** Danial Hasan
**Date:** 2026-01-08
**Reviewers:** TBD

---

## Overview

### Problem Statement

AI coding agents have inherent limitations:
1. **Knowledge cutoff** — Models don't know current codebase state
2. **Baked-in assumptions** — Models make inference errors during synthesis
3. **Premature completion** — Models declare "done" without verification
4. **First-pass bugs** — Initial implementations have bugs, security issues, alignment drift

These limitations compound on long-horizon tasks, where cumulative errors make the final output unusable.

### Goals

- **Receipt-gated completion** — Claude cannot stop until all phases produce valid receipts
- **Continuous verification** — Every phase validates its work before allowing the next
- **Compute-first problem solving** — When tests fail, Claude fixes them (not just retries)
- **Compaction-resilient** — Checkpoint files enable resumption across context compactions
- **Human-in-the-loop for taste** — Interview phase and video review require human input

### Non-Goals

- Real-time monitoring dashboard (out of scope)
- Multi-agent coordination (handled by squad-director/manager skills)
- Deployment to production (separate concern)

---

## Safety Mechanisms

### Agent-Triggered Bailout

When Claude encounters a **hard blocker** it cannot resolve (broken MCP, infrastructure failure, missing credentials), it can trigger a bailout by outputting the `<bailout>` tag **three times**:

```
I've attempted to connect to the Electron MCP 3 times but it's not responding.
This appears to be an infrastructure issue I cannot resolve autonomously.

<bailout>Electron MCP connection failed - port 9222 not responding</bailout>
<bailout>Electron MCP connection failed - port 9222 not responding</bailout>
<bailout>Electron MCP connection failed - port 9222 not responding</bailout>
```

**Stop hook behavior on bailout:**
1. Detect 3+ `<bailout>` tags in recent output
2. Extract reason from tag content
3. Write notification to `.squad/notifications/bailout-{timestamp}.md`
4. Allow stop (exit 0) — **do NOT force continuation**
5. Sound alert (system notification)

**Bailout notification format:**
```markdown
# BAILOUT NOTIFICATION

**Timestamp:** 2026-01-08T15:30:00Z
**Session:** {session-id}
**Reason:** Electron MCP connection failed - port 9222 not responding

## Context
- Phase: VERIFY
- Attempts: 3
- Last action: Trying to take screenshot for E2E verification

## Required Human Action
1. Check if Electron app is running with remote debugging
2. Verify port 9222 is accessible
3. Restart /sdlc-loop when resolved

## Receipts Collected Before Bailout
- ✅ interview.json
- ✅ discover.json
- ✅ plan.json
- ✅ build.json
- ✅ backend.json
- ⬜ e2e.json (blocked)
- ⬜ verify.json (blocked)
```

### Emergency Stop (Human-Triggered)

User can type `EMERGENCY STOP` at any prompt to immediately terminate without completing verification.

### Loop Detection

Stop hook tracks consecutive failures. If same phase fails 10+ times with same error, auto-bailout to prevent infinite loops.

---

## Architecture

### System Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         /sdlc-loop Master Skill                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    DECLARATIVE DAG ENGINE                        │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                  │                                      │
│        ┌─────────────────────────┼─────────────────────────┐           │
│        │                         │                         │           │
│        ▼                         ▼                         ▼           │
│   ┌─────────┐            ┌─────────────┐           ┌─────────────┐    │
│   │INTERVIEW│───────────▶│   DISCOVER  │──────────▶│    PLAN     │    │
│   │         │            │             │           │             │    │
│   │/interview            │/squad-      │           │/squad-collab│    │
│   │         │            │ discover    │           │             │    │
│   └─────────┘            └─────────────┘           └─────────────┘    │
│        │                        │                         │            │
│        ▼                        ▼                         ▼            │
│   [spec.md]              [discovery.json]          [plan.json]        │
│                                                           │            │
│                                                           ▼            │
│                                                    ┌─────────────┐    │
│                                                    │    BUILD    │    │
│                                                    │             │    │
│                                                    │/squad-build │    │
│                                                    └─────────────┘    │
│                                                           │            │
│                              ┌────────────────────────────┼────────┐  │
│                              │                            │        │  │
│                              ▼                            ▼        │  │
│                       ┌─────────────┐            ┌─────────────┐   │  │
│                       │   BACKEND   │            │   DESKTOP   │   │  │
│                       │   TESTS     │            │    E2E      │   │  │
│                       │             │            │             │   │  │
│                       │ vitest      │            │ playwright  │   │  │
│                       │ (parallel)  │            │ (parallel)  │   │  │
│                       └─────────────┘            └─────────────┘   │  │
│                              │                            │        │  │
│                              ▼                            ▼        │  │
│                       [backend.json]              [e2e.json]       │  │
│                       [backend/*.log]             [videos/*.webm]  │  │
│                              │                            │        │  │
│                              └────────────┬───────────────┘        │  │
│                                           │                        │  │
│                                           ▼                        │  │
│                                    ┌─────────────┐                 │  │
│                                    │   VERIFY    │                 │  │
│                                    │             │                 │  │
│                                    │  /verify    │                 │  │
│                                    │  + human    │                 │  │
│                                    │  video      │                 │  │
│                                    │  review     │                 │  │
│                                    └─────────────┘                 │  │
│                                           │                        │  │
│                                           ▼                        │  │
│                                    [verify.json]                   │  │
│                                    [screenshots/]                  │  │
│                                                                    │  │
│  ┌─────────────────────────────────────────────────────────────────┘  │
│  │                                                                     │
│  ▼                                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                     STOP HOOK GATE                               │  │
│  │                                                                  │  │
│  │  Checks all receipts exist:                                      │  │
│  │  □ interview.json   □ discover.json   □ plan.json                │  │
│  │  □ build.json       □ backend.json    □ e2e.json                 │  │
│  │  □ verify.json                                                   │  │
│  │                                                                  │  │
│  │  + SHA-256 verification of artifacts                             │  │
│  │  + Prompts Claude with diagnostic if any missing                 │  │
│  │                                                                  │  │
│  │  ALL PASS → exit(0) → Claude stops → Auto-commit                 │  │
│  │  ANY FAIL → exit(2) → Claude continues with diagnostic           │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Components

| Component | Responsibility | Technology |
|-----------|---------------|------------|
| **DAG Engine** | Orchestrate phase execution order based on dependencies | Skill logic (Markdown + Skill tool) |
| **Stop Hook** | Gate completion until all receipts valid | Bash script, exit code 2 |
| **Receipt Store** | Persist evidence of completed phases | JSON files + artifacts in `.squad/receipts/` |
| **Checkpoint Manager** | Enable resume after compaction | JSON checkpoint file |
| **Phase Skills** | Execute specific SDLC phases | Existing skills: /interview, /squad-discover, etc. |

### Data Flow

1. User invokes `/sdlc-loop`
2. Skill shows DAG visualization with status
3. Checks for existing checkpoint → if found, offers resume
4. If fresh start: invokes `/interview` skill
5. Interview produces spec file + session context
6. DAG proceeds through phases, invoking skills via Skill tool
7. Each phase writes receipt to `.squad/receipts/{date}/{session-id}/`
8. Backend tests + Desktop E2E run in **parallel** via subagents
9. Verify phase includes human video review
10. Stop hook validates all receipts
11. On success: auto-commit with descriptive message

---

## Skill Composition (Declarative DAG)

### DAG Definition

```yaml
# Phase dependencies (edges in the DAG)
dag:
  interview:
    depends_on: []
    skill: /interview
    output: spec.md + interview.json

  discover:
    depends_on: [interview]
    skill: /squad-discover
    output: discovery.json

  plan:
    depends_on: [discover]
    skill: /squad-collab
    output: plan.json

  build:
    depends_on: [plan]
    skill: /squad-build
    output: build.json

  backend_tests:
    depends_on: [build]
    skill: null  # Direct command execution
    command: |
      cd services/backend && pnpm test
      # Also: pnpm test:ws, integration tests
    output: backend.json + test logs
    parallel_group: testing

  desktop_e2e:
    depends_on: [build]
    skill: null  # Direct command execution
    command: |
      cd apps/desktop/e2e-playwright
      VIDEO=on npx playwright test
    output: e2e.json + videos/*.webm
    parallel_group: testing

  verify:
    depends_on: [backend_tests, desktop_e2e]
    skill: /verify
    human_touchpoint: true  # Video review required
    output: verify.json + screenshots/
```

### Parallel Execution

Phases in the same `parallel_group` run concurrently via Task tool subagents:

```
BUILD completes
    │
    ├─────────────────────────────┐
    │                             │
    ▼                             ▼
Task(backend_tests)         Task(desktop_e2e)
    │                             │
    └──────────┬──────────────────┘
               │
               ▼ (join: wait for both)
            VERIFY
```

---

## Receipt System

### Storage Location

```
.squad/receipts/{YYYY-MM-DD}/{session-id}/
├── interview.json
├── discover.json
├── plan.json
├── build.json
├── backend.json
├── backend/
│   └── vitest-output.log
├── e2e.json
├── e2e/
│   ├── videos/
│   │   ├── cli-detection-*.webm
│   │   ├── file-operations-*.webm
│   │   └── golden-path-*.webm
│   └── test-results.json
├── verify.json
├── verify/
│   └── screenshots/
│       ├── 001-initial.png
│       ├── 002-after-login.png
│       └── final.png
└── CHECKPOINT.json
```

### Receipt JSON Schema

```typescript
interface Receipt {
  // Identity
  phase: 'interview' | 'discover' | 'plan' | 'build' | 'backend_tests' | 'desktop_e2e' | 'verify';
  session_id: string;
  timestamp: string;  // ISO 8601

  // Status
  status: 'pass' | 'fail';
  duration_ms: number;

  // Reproducibility
  git_sha: string;
  git_branch: string;
  node_version: string;
  env_vars_hash: string;  // SHA-256 of relevant env vars

  // Execution details
  command_run: string;
  exit_code: number;
  stdout_hash: string;  // SHA-256 of stdout

  // Artifacts with integrity
  artifacts: Array<{
    type: 'log' | 'screenshot' | 'video' | 'json';
    path: string;  // Relative to receipt directory
    hash: string;  // SHA-256 of file contents
    size_bytes: number;
  }>;

  // For tests specifically
  test_summary?: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    flaky: number;  // Passed on retry
  };
}
```

### Hash Verification

Each receipt includes SHA-256 hashes of its artifacts. The stop hook verifies:

1. Receipt file exists
2. `status === 'pass'`
3. Artifact files exist at specified paths
4. Artifact hashes match (prevents tampering)

---

## Stop Hook Implementation

### Configuration (`.claude/settings.json`)

```json
{
  "permissions": {
    "allow": ["mcp__squad__*"]
  },
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

### Stop Hook Script (`.claude/skills/sdlc-loop/hooks/stop-gate.sh`)

```bash
#!/bin/bash
# SDLC Loop Stop Gate
# Blocks Claude from stopping until all receipts are valid
# Exit 0 = allow stop, Exit 2 = block stop (continue)

set -euo pipefail

# Check for emergency stop
if [[ "${SDLC_EMERGENCY_STOP:-}" == "true" ]]; then
  echo "EMERGENCY STOP triggered. Allowing immediate termination." >&2
  exit 0
fi

# Check if loop is active
CHECKPOINT_DIR=".squad/receipts"
ACTIVE_CHECKPOINT=$(find "$CHECKPOINT_DIR" -name "CHECKPOINT.json" -mmin -60 2>/dev/null | head -1)

if [[ -z "$ACTIVE_CHECKPOINT" ]]; then
  # No active loop, allow stop
  exit 0
fi

SESSION_DIR=$(dirname "$ACTIVE_CHECKPOINT")
CHECKPOINT=$(cat "$ACTIVE_CHECKPOINT")

# Required receipts
REQUIRED_RECEIPTS=(
  "interview.json"
  "discover.json"
  "plan.json"
  "build.json"
  "backend.json"
  "e2e.json"
  "verify.json"
)

# Build status checklist
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
echo "     SDLC LOOP COMPLETION GATE CHECK      " >&2
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
echo "" >&2

ALL_PASS=true
MISSING_RECEIPTS=()

for receipt in "${REQUIRED_RECEIPTS[@]}"; do
  RECEIPT_PATH="$SESSION_DIR/$receipt"

  if [[ -f "$RECEIPT_PATH" ]]; then
    # Parse status from JSON
    STATUS=$(jq -r '.status' "$RECEIPT_PATH" 2>/dev/null || echo "unknown")

    if [[ "$STATUS" == "pass" ]]; then
      echo "  ✅ $receipt" >&2
    else
      echo "  ❌ $receipt (status: $STATUS)" >&2
      ALL_PASS=false
      MISSING_RECEIPTS+=("$receipt")
    fi
  else
    echo "  ⬜ $receipt (missing)" >&2
    ALL_PASS=false
    MISSING_RECEIPTS+=("$receipt")
  fi
done

echo "" >&2
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2

if $ALL_PASS; then
  echo "" >&2
  echo "✅ ALL RECEIPTS VALID. SDLC loop complete!" >&2
  echo "" >&2
  echo "Ready to auto-commit changes." >&2
  exit 0
else
  echo "" >&2
  echo "❌ CANNOT STOP - Missing or invalid receipts:" >&2
  echo "" >&2

  for missing in "${MISSING_RECEIPTS[@]}"; do
    case "$missing" in
      interview.json)
        echo "  → Run /interview to gather requirements" >&2
        ;;
      discover.json)
        echo "  → Run /squad-discover to analyze codebase" >&2
        ;;
      plan.json)
        echo "  → Run /squad-collab to create implementation plan" >&2
        ;;
      build.json)
        echo "  → Run /squad-build to implement the feature" >&2
        ;;
      backend.json)
        echo "  → Run backend tests: cd services/backend && pnpm test" >&2
        echo "    If tests fail, ANALYZE the failures and FIX them." >&2
        ;;
      e2e.json)
        echo "  → Run E2E tests: cd apps/desktop/e2e-playwright && VIDEO=on npx playwright test" >&2
        echo "    If tests fail, ANALYZE the failures and FIX them." >&2
        ;;
      verify.json)
        echo "  → Run /verify to validate feature works from user POV" >&2
        echo "    Includes human review of video recordings." >&2
        ;;
    esac
  done

  echo "" >&2
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
  echo "⚠️  DO NOT STOP until all receipts show ✅" >&2
  echo "" >&2
  echo "Type 'EMERGENCY STOP' to abort without completion." >&2
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2

  # Exit 2 = block stop, continue working
  exit 2
fi
```

---

## Checkpoint System

### Checkpoint File Schema

```typescript
interface Checkpoint {
  session_id: string;
  started_at: string;
  last_updated: string;

  // Current state
  current_phase: string;
  completed_phases: string[];

  // Context preservation
  spec_path: string;  // Path to interview output
  discovery_path: string;
  plan_path: string;

  // For resume
  next_action: string;  // What to do next

  // Emergency stop flag
  emergency_stop: boolean;
}
```

### Resume Logic

On `/sdlc-loop` invocation:

```
1. Check for checkpoint: .squad/receipts/**/CHECKPOINT.json (last 60 min)
2. If found:
   - Read checkpoint
   - Show: "Found existing session. Resume from {phase}? [Y/n]"
   - If yes: skip to that phase
   - If no: start fresh (new session_id)
3. If not found:
   - Generate new session_id
   - Create checkpoint file
   - Start from INTERVIEW
```

---

## User Experience

### Opening Experience

When user types `/sdlc-loop`:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    SDLC LOOP - Autonomous Development
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ┌─────────┐
  │INTERVIEW│ ← You are here
  └────┬────┘
       │
       ▼
  ┌─────────┐
  │DISCOVER │
  └────┬────┘
       │
       ▼
  ┌─────────┐
  │  PLAN   │
  └────┬────┘
       │
       ▼
  ┌─────────┐
  │  BUILD  │
  └────┬────┘
       │
   ┌───┴───┐
   ▼       ▼
┌──────┐ ┌─────┐
│TESTS │ │ E2E │  (parallel)
└──┬───┘ └──┬──┘
   └───┬────┘
       ▼
  ┌─────────┐
  │ VERIFY  │
  └────┬────┘
       │
       ▼
    [DONE]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Starting INTERVIEW phase...
```

### Progress Updates (Standard Verbosity)

```
✅ INTERVIEW complete → docs/specs/feature-name.md created

Starting DISCOVER phase...
  → Spawning 5 parallel scouts...
  → Business scout: analyzing README.md
  → Tech scout: analyzing package.json
  → Architecture scout: mapping modules
  ...
✅ DISCOVER complete → discovery report generated

Starting PLAN phase...
  → Invoking /squad-collab for depth-progressive planning
  ...
✅ PLAN complete → implementation plan created

Starting BUILD phase...
  → Detected scope: TICKET (SQD-XXX)
  → Following TDD: RED → GREEN → INTEGRATE
  ...
✅ BUILD complete → feature implemented

Starting TESTS phase (parallel)...
  → [Backend] Running 47 unit tests...
  → [E2E] Running 5 Playwright specs with video...
  ✅ [Backend] 47/47 tests passed
  ✅ [E2E] 5/5 specs passed (videos captured)
✅ TESTS complete

Starting VERIFY phase...
  → Taking screenshots via Electron MCP
  → Checking console for errors
  ⚠️  VIDEO REVIEW REQUIRED

  Please review the following recordings:
  1. cli-detection.webm (2:34)
  2. golden-path-flow.webm (4:12)

  [Approve] [Reject and describe issue]
```

### Human Touchpoints

1. **Interview phase** — User answers questions about what they're building
2. **Video review** — User reviews Playwright recordings of E2E tests

Everything else runs autonomously.

### Emergency Stop

If user types `EMERGENCY STOP` at any point:

```
⚠️  EMERGENCY STOP detected.

This will terminate the SDLC loop immediately without completing verification.
Progress will be saved to checkpoint for later resume.

Are you sure? [y/N]
```

---

## Error Handling

### Failure Modes

| Failure | Probability | Impact | Mitigation |
|---------|------------|--------|------------|
| Backend tests fail | High | Loop continues | Claude analyzes failures, fixes code, re-runs tests |
| E2E tests fail | Medium | Loop continues | Claude analyzes Playwright output, fixes code, re-runs |
| Flaky test | Medium | Possible false failure | Playwright retries:2 in config; flaky tests marked |
| Compaction mid-loop | High | Context loss | Checkpoint file enables resume |
| Electron app not running | Low | Verify fails | Clear error message; Claude starts app |
| Video review rejected | Medium | Loop continues | Claude reads rejection reason, fixes, re-verifies |

### Retry Strategy

When a phase fails:
1. Parse error output to understand what failed
2. Attempt to fix the underlying issue (not just retry)
3. Re-run only the failed phase (not restart from beginning)
4. If fix fails 3 times, escalate to human with diagnostic

### Test Flakiness Handling

Uses Playwright's built-in retry mechanism:
```typescript
// playwright.config.ts
export default defineConfig({
  retries: 2,
  // ...
});
```

If a test fails then passes on retry, the receipt marks it as `flaky: 1` but still `status: pass`.

---

## Security Considerations

### Hook Script Permissions

```bash
chmod 755 .claude/skills/sdlc-loop/hooks/stop-gate.sh
```

755 = owner rwx, group rx, others rx (standard executable permissions)

### Receipt Integrity

- SHA-256 hashes of all artifacts prevent tampering
- Receipts stored in project directory (not system-wide)
- Git-tracked for auditability

### Input Validation

- Session IDs are UUID v4 (no user input in paths)
- Checkpoint files validated before reading
- No shell injection vectors (jq for JSON parsing)

---

## Testing Strategy

### Manual Testing

This skill will be tested manually by:
1. Running `/sdlc-loop` on a real feature
2. Verifying each phase executes correctly
3. Verifying stop hook blocks appropriately
4. Verifying checkpoint/resume works
5. Verifying emergency stop works

### Test Cases

| Test Case | Expected Behavior |
|-----------|------------------|
| Fresh start | Shows DAG, starts interview |
| Resume from checkpoint | Detects checkpoint, offers resume |
| Backend tests fail | Claude fixes and re-runs |
| E2E tests fail | Claude fixes and re-runs |
| All phases pass | Stop hook allows completion, auto-commits |
| Emergency stop | Saves checkpoint, terminates |
| Video review rejected | Claude receives feedback, fixes |

---

## Deployment & Rollout

### Installation

1. Create skill directory: `.claude/skills/sdlc-loop/`
2. Add skill file: `skill.md`
3. Add spec file: `SPEC.md` (this document)
4. Add hook script: `hooks/stop-gate.sh`
5. Update `.claude/settings.json` with hook configuration
6. `chmod 755` the hook script

### Feature Flags

None — skill is either installed or not.

### Monitoring

- Receipts provide full audit trail
- Checkpoint files show session state
- Git history shows auto-commits

---

## Composed Skills (Replaces squad-build)

The `/sdlc-loop` composes three domain-specific build skills:

### /frontend-build

Builds Vue 3 + Pinia frontend features following discovered patterns:

```
PATTERN: Store → Composable → Component (ADR-024)

Steps:
1. Create Pinia store (src/stores/{feature}Store.ts)
   - defineStore with state, getters, actions
   - Export from stores/index.ts

2. Create composable (src/composables/use{Feature}.ts)
   - Wrap store with storeToRefs
   - Add API integration via ts-rest client
   - Handle loading/error states
   - Manage subscriptions with onMounted/onUnmounted

3. Create components (src/components/{feature}/*.vue)
   - Use composable, not store directly
   - Handle UI rendering only
   - Emit events, don't mutate

4. Add route (src/router/index.ts)
   - Add to DesktopShell children
   - Set requiresAuth metadata

5. Wire API client (src/api/client.ts)
   - Import contract from @squad/contracts
   - Create type-safe client
```

### /backend-build

Builds Fastify + ts-rest + Supabase backend features:

```
PATTERN: Contract → Routes → Service → Database

Steps:
1. Define contract (packages/contracts/src/{feature}.contract.ts)
   - Zod schemas for request/response
   - ts-rest router definition
   - Export from contracts/index.ts

2. Create module (services/backend/src/modules/{feature}/)
   - {feature}.types.ts - Type definitions
   - {feature}.service.ts - Factory function (NO classes)
   - {feature}.routes.ts - ts-rest implementation
   - index.ts - Barrel export

3. Implement service
   - makeFoo({ db }) factory pattern
   - Inject Supabase client
   - Return object literal with methods

4. Implement routes
   - Extract token from Authorization header
   - Validate user via anonClient.auth.getUser()
   - Call service layer
   - Emit canonical log events
   - Return typed response

5. Register routes (services/backend/src/index.ts)
   - server.register(s.plugin(fooRouter))

6. Add migration (supabase/migrations/{timestamp}_{name}.sql)
   - CREATE TABLE with RLS
   - Add indexes
   - Create RLS policies

7. Write tests (modules/{feature}/__tests__/)
   - Vitest + server.inject()
   - Test auth, validation, happy path
```

### /fullstack-build

Orchestrates frontend + backend for complete features:

```
PATTERN: Contract-first, then parallel implementation

Steps:
1. Define shared contract (packages/contracts/)
   - Single source of truth for types
   - Zod validation schemas
   - Export types for both layers

2. Parallel implementation:
   ├── Backend: /backend-build
   └── Frontend: /frontend-build

3. Wire together:
   - Frontend imports contract
   - Creates type-safe API client
   - Calls backend with full type safety

4. E2E verification:
   - User action → Frontend → Backend → DB → Response → UI
   - Playwright tests trace complete flow
```

---

## Open Questions

- [ ] Should the skill integrate with Linear for ticket status updates?
- [ ] Should receipts include git diff for rollback capability?

---

## Change Log

| Date | Author | Changes |
|------|--------|---------|
| 2026-01-08 | Danial Hasan | Initial draft from /interview session |
| 2026-01-08 | Danial Hasan | Added bailout mechanism, loop detection |
| 2026-01-08 | Danial Hasan | Added composed skills from codebase discovery |
