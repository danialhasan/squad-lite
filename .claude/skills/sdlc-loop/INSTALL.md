# SDLC Loop — Installation & Verification

**Created:** 2026-01-08
**Status:** ✅ Installed and configured

---

## Installation Status

### ✅ Skills Installed

```
.claude/skills/
├── sdlc-loop/
│   ├── skill.md              ✅ Master orchestrator (150 lines)
│   ├── SPEC.md               ✅ Full specification (900 lines)
│   ├── README.md             ✅ System overview (500 lines)
│   └── hooks/
│       └── stop-gate.sh      ✅ Stop enforcement (executable, 755)
│
├── frontend-build/
│   └── skill.md              ✅ Vue + Pinia patterns (600 lines)
│
├── backend-build/
│   └── skill.md              ✅ Fastify + ts-rest patterns (800 lines)
│
└── fullstack-build/
    └── skill.md              ✅ Full-stack orchestration (600 lines)
```

### ✅ Configuration Applied

**File:** `.claude/settings.json`

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

**Status:** Hook registered ✅

---

## Verification Checklist

### Pre-Flight Checks

Before running `/sdlc-loop` for the first time:

- [ ] Backend server runnable: `cd services/backend && pnpm dev`
- [ ] Desktop app runnable: `cd apps/desktop && pnpm dev:app`
- [ ] Electron remote debugging enabled (port 9222)
- [ ] Playwright installed: `cd apps/desktop/e2e-playwright && npx playwright install`
- [ ] Supabase local running: `supabase start`
- [ ] jq installed (for receipt parsing): `brew install jq` (macOS)
- [ ] Stop hook executable: `ls -la .claude/skills/sdlc-loop/hooks/stop-gate.sh` shows `-rwxr-xr-x`

### Hook Verification

Test the stop hook in isolation:

```bash
# Without active loop (should allow stop immediately)
bash .claude/skills/sdlc-loop/hooks/stop-gate.sh
echo "Exit code: $?"
# Expected: Exit code: 0

# Create fake active loop
mkdir -p .squad/receipts/2026-01-08/test_session
echo '{"session_id":"test_session","current_phase":"build","started_at":"2026-01-08T12:00:00Z"}' > .squad/receipts/2026-01-08/test_session/CHECKPOINT.json

# Now hook should block (missing receipts)
bash .claude/skills/sdlc-loop/hooks/stop-gate.sh
echo "Exit code: $?"
# Expected: Exit code: 2
# Should see diagnostic output

# Cleanup
rm -rf .squad/receipts/2026-01-08/test_session
```

---

## Critical Design Points

### Mandatory Phases (NO EXCEPTIONS)

```
INTERVIEW → DISCOVER → PLAN → BUILD → TEST → VERIFY
   (1)        (2)       (3)      (4)     (5)     (6)

ALL SIX PHASES ARE REQUIRED
```

**Why each phase is mandatory:**

1. **INTERVIEW** — Prevents assumption-driven failures
   - Model limitation: Baked-in assumptions
   - Compensation: Explicit requirements gathering

2. **DISCOVER** — Prevents knowledge-cutoff errors
   - Model limitation: Doesn't know current codebase state
   - Compensation: Re-learn patterns via 5 parallel WarpGrep scouts

3. **PLAN** — Prevents premature implementation
   - Model limitation: Baked-in assumptions about "best practices"
   - Compensation: Empirical validation of approach

4. **BUILD** — Implements following discovered patterns
   - Uses frontend-build, backend-build, or fullstack-build

5. **TEST** — Prevents first-pass bugs from shipping
   - Model limitation: First implementations always have bugs
   - Compensation: Automated test suite catches issues

6. **VERIFY** — Prevents "tests pass but feature doesn't work"
   - Model limitation: Tests can be wrong or incomplete
   - Compensation: Human reviews video proof of feature working

**Even for trivial features**, all phases run. The time cost is acceptable compared to shipping broken code.

### Stop Hook Enforcement

The hook **cannot be bypassed** except via:
1. Agent bailout (3x `<bailout>` tags)
2. Emergency stop (user types `EMERGENCY STOP`)
3. Loop detection (10+ consecutive identical failures)

**There is no "skip verification" mode.** This is intentional.

---

## Usage Examples

### Example 1: Simple Frontend Feature

```
USER: /sdlc-loop

CLAUDE: [Shows DAG visualization]

        Starting INTERVIEW phase...

        Q: What feature are we building?
        A: Add a "Copy to Clipboard" button in the Console view

        Q: Is this frontend-only, backend-only, or fullstack?
        A: Frontend-only

        Q: What should happen when the button is clicked?
        A: Copy the selected message text to clipboard

        ✅ INTERVIEW complete (spec: docs/specs/copy-to-clipboard.md)

        Starting DISCOVER phase...
          → Scout 1: Business patterns
          → Scout 2: Tech stack
          → Scout 3: Console component architecture
          → Scout 4: Clipboard API usage in codebase
          → Scout 5: Similar button patterns
        ✅ DISCOVER complete (found: existing clipboard composable)

        Starting PLAN phase...
        ✅ PLAN complete
          → Use existing useClipboard composable
          → Add button to MessageCard component
          → Wire up on-click handler

        Starting BUILD phase (frontend)...
          → Invoking /frontend-build
          → No new store needed (feature is stateless)
          → No new composable needed (reuse useClipboard)
          → Add CopyButton.vue component
          → Import in MessageCard.vue
        ✅ BUILD complete (1 component added)

        Starting TEST phase...
          → [E2E] Running Playwright with video...
          → 6/6 specs passed (including new clipboard test)
        ✅ TEST complete

        Starting VERIFY phase...
          → Screenshots captured
          → Console: 0 errors

          📹 VIDEO REVIEW REQUIRED
          Please review: clipboard-test.webm

        [USER APPROVES]

        ✅ VERIFY complete

        All receipts valid. Auto-committing...

        ✅ COMMIT: feat(frontend): Add copy-to-clipboard button in Console
```

### Example 2: Fullstack Feature with Failure

```
USER: /sdlc-loop

CLAUDE: [Runs through interview, discover, plan]

        Starting BUILD phase (fullstack)...
          → Spawning backend agent
          → Spawning frontend agent
          → Both agents working in parallel...
        ✅ BUILD complete

        Starting TEST phase...
          → [Backend] 47 tests running...
          → [Backend] 45/47 passed, 2 failed ❌

          Analyzing failures:
            1. Missing workspace_id in service call
            2. Auth token not being validated

          Fixing issue 1: Adding workspace_id parameter...
          Fixing issue 2: Adding auth validation...

          Re-running backend tests...
          → [Backend] 47/47 passed ✅

          → [E2E] 5/5 specs passed ✅

        ✅ TEST complete

        [Continues to VERIFY and COMMIT]
```

### Example 3: Bailout on Hard Blocker

```
USER: /sdlc-loop

CLAUDE: [Runs through phases until VERIFY]

        Starting VERIFY phase...
          → Attempting to connect to Electron MCP (port 9222)
          → Connection failed (attempt 1/3)
          → Connection failed (attempt 2/3)
          → Connection failed (attempt 3/3)

          I've attempted to connect to the Electron MCP 3 times but port 9222
          is not responding. This appears to be an infrastructure issue I
          cannot resolve autonomously.

          <bailout>Electron MCP connection failed - port 9222 not responding</bailout>
          <bailout>Electron MCP connection failed - port 9222 not responding</bailout>
          <bailout>Electron MCP connection failed - port 9222 not responding</bailout>

STOP HOOK:
  → Detected 3 bailout tags
  → Writing notification to .squad/notifications/bailout-20260108T153000Z.md
  → [System alert sound plays]
  → Allowing stop

CLAUDE: 🚨 Bailout triggered. Session terminated.

        Please review: .squad/notifications/bailout-20260108T153000Z.md

        When the issue is resolved, resume with:
        /sdlc-loop --resume
```

---

## Troubleshooting

### Hook Not Running

**Symptom:** Claude stops immediately even with missing receipts

**Check:**
```bash
# 1. Verify hook is in settings
cat .claude/settings.json | jq '.hooks'

# 2. Verify script exists and is executable
ls -la .claude/skills/sdlc-loop/hooks/stop-gate.sh

# 3. Test script manually
bash .claude/skills/sdlc-loop/hooks/stop-gate.sh
```

**Fix:** Ensure script has execute permissions:
```bash
chmod 755 .claude/skills/sdlc-loop/hooks/stop-gate.sh
```

### Hook Always Blocks

**Symptom:** Hook blocks even when no SDLC loop is active

**Check:**
```bash
# Look for stale checkpoints
find .squad/receipts -name "CHECKPOINT.json" -type f

# Check their modification times
find .squad/receipts -name "CHECKPOINT.json" -exec ls -lh {} \;
```

**Fix:** Remove stale checkpoints:
```bash
# Remove checkpoints older than 60 minutes
find .squad/receipts -name "CHECKPOINT.json" -mmin +60 -delete
```

### Bailout Not Detected

**Symptom:** Agent outputs bailout tags but hook doesn't detect them

**Cause:** Hook can't find recent output to scan

**Check:**
```bash
# The hook looks for output in these locations:
# - $SDLC_BAILOUT_LOG
# - $SDLC_LAST_OUTPUT
# - $CLAUDE_OUTPUT_PATH
# - $SESSION_DIR/bailout.log
# - $SESSION_DIR/output.log
```

**Fix:** The hook will be updated to use Claude Code's native output capture when that API is available.

---

## Performance Notes

### Phase Duration Estimates

| Phase | Typical Duration | Parallel? |
|-------|------------------|-----------|
| Interview | 2-5 min | No (human input) |
| Discover | 3-8 min | Yes (5 scouts) |
| Plan | 1-3 min | No |
| Build (frontend) | 5-15 min | N/A |
| Build (backend) | 8-20 min | N/A |
| Build (fullstack) | 10-25 min | Yes (backend ‖ frontend) |
| Backend Tests | 1-3 min | Yes |
| E2E Tests | 2-5 min | Yes |
| Verify | 2-4 min | No (human review) |
| Commit | <1 min | No |

**Total (fullstack feature):** ~30-60 minutes

**Total (frontend-only):** ~15-30 minutes

**Total (backend-only):** ~20-40 minutes

### Optimization Opportunities

- Discovery + planning could run in parallel (future)
- Backend + frontend build already parallel (fullstack mode)
- Tests already run in parallel
- Receipt validation is instant (SHA-256 check)

---

## Next Actions

1. ✅ Skills written and documented
2. ✅ Stop hook implemented with bailout detection
3. ✅ Configuration applied
4. ⬜ **Test with real feature** (recommended next step)
5. ⬜ Document learnings in session journal
6. ⬜ Update CLAUDE.md to reference /sdlc-loop

---

*Installation complete: 2026-01-08T11:30:00Z*
