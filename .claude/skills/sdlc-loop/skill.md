---
name: sdlc-loop
description: Master SDLC automation loop with receipt-gated completion. Use for end-to-end feature work that must run interview, discovery, planning, build, tests, and Electron verification with stop-hook enforcement, bailouts, and checkpoints. Orchestrates /interview, /squad-discover, /squad-collab, /frontend-build, /backend-build, /fullstack-build, and /verify.
allowed-tools: [Read, Write, Edit, Glob, Grep, Bash, Task, TodoWrite, AskUserQuestion, mcp__filesystem-with-morph__warpgrep_codebase_search]
---

# SDLC Loop Skill

## Purpose

Enforce a continuous SDLC loop that cannot stop until receipts prove completion. This skill is the orchestrator that sequences existing skills and test runners, then relies on a stop hook to gate completion.

Key ideas:
- No assumptions: always interview, then discover
- Receipt-gated completion: no receipts, no stop
- Compute-first fixes: failing tests are fixed, not ignored
- Checkpoint-resilient: resume after compaction
- Human-in-the-loop only for interview + video review

## Canonical Reference

For full details (receipt schema, hook config, scripts, UX), read:
- `.claude/skills/sdlc-loop/SPEC.md`

Keep this file lean; defer deep details to the spec.

---

## Execution DAG (Declarative)

```
/interview
   ↓
/squad-discover
   ↓
/squad-collab
   ↓
/build (frontend|backend|fullstack)
   ↓
parallel: backend tests + E2E (Playwright)
   ↓
/verify (Electron MCP)
   ↓
STOP HOOK GATE
```

### Phase Rules

1. **Interview (ALWAYS - NO EXCEPTIONS)**
   - Run `/interview` first. Produce both spec + context notes.
   - Store outputs in receipts directory and update checkpoint.
   - WHY: Explicit requirements prevent assumption-driven failures.

2. **Discover (ALWAYS - NO EXCEPTIONS)**
   - Run `/squad-discover` to re-learn the codebase. Use WarpGrep for search.
   - WHY: Compensates for knowledge cutoff. Never assume you know the codebase.
   - BLOCKING: Cannot plan without fresh discovery.

3. **Plan (ALWAYS - NO EXCEPTIONS)**
   - Run `/squad-collab` for depth-progressive collaborative planning.
   - WHY: Compensates for baked-in assumptions. Validate approach empirically.
   - BLOCKING: Cannot build without explicit plan.

4. **Build**
   - Choose exactly one:
     - `/frontend-build` for Vue + Pinia features
     - `/backend-build` for Fastify + ts-rest + Supabase
     - `/fullstack-build` for contract-first full-stack work

5. **Tests (parallel)**
   - Backend: Vitest (see SPEC for exact commands).
   - E2E: Playwright + Electron fixture (VIDEO=on), full spec suite.
   - Use Task subagents to run in parallel when possible.

6. **Verify**
   - Run `/verify` with Electron MCP. Human reviews video artifacts.

---

## Receipts and Checkpoints

### Receipt Storage

- Root: `.squad/receipts/{date}/{session-id}/`
- Checkpoint: `CHECKPOINT.json` (used to resume after compaction)

### Required Receipts

```
interview.json
discover.json
plan.json
build.json
backend.json
e2e.json
verify.json
```

Each receipt must:
- Declare `status: pass`
- List artifacts with `sha256` where applicable (screenshots, videos, logs)

If any receipt is missing or failing, the stop hook blocks completion.

---

## Stop Hook Contract

### Behavior

- Exit `2` to block stop and force continuation
- Exit `0` to allow stop
- The hook is responsible for:
  - receipt validation
  - bailout detection
  - emergency stop handling
  - user-facing checklist

### Hook Location

- Script: `.claude/skills/sdlc-loop/hooks/stop-gate.sh`
- Config: `.claude/settings.json` (see SPEC)

### Bailout Mechanism

If you hit a hard blocker (broken MCP, infra failure, missing credentials), output the bailout tag **three times**:

```
<bailout>Reason for human intervention</bailout>
<bailout>Reason for human intervention</bailout>
<bailout>Reason for human intervention</bailout>
```

The hook should detect this, write a notification to `.squad/notifications/`, and allow stop.

### Emergency Stop

If the user types `EMERGENCY STOP`, set `emergency_stop` in the checkpoint and allow stop immediately.

---

## Auto-Commit

When all receipts are valid:
- Run `git status` to confirm changes
- Commit with: `sdlc-loop: <feature summary>`

---

## Notes

- Prefer existing skill workflows over ad-hoc steps.
- Always point to SPEC.md for any missing details.
- Keep outputs reproducible (include commands, versions, and hashes in receipts).
