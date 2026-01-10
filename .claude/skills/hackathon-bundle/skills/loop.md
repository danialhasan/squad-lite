---
name: hack-loop
description: Full hackathon development cycle orchestration. Sequences interview → discover → plan → build → verify with checkpoints.
allowed-tools: [Read, Write, Bash, Task, TodoWrite, AskUserQuestion, Skill]
---

# Hack Loop Skill

## Purpose

**Orchestrate the full hackathon development cycle.** Sequences all skills in order with checkpoints. Cannot stop until verified.

## When to Use

- Starting a new hackathon feature end-to-end
- When you want full automation with guardrails
- To ensure nothing gets skipped

---

## Execution DAG

```
┌───────────────────────────────────────────────────────────────┐
│                      HACKATHON LOOP                           │
│                                                               │
│   /hack-interview ─────▶ spec.md                              │
│          │                                                    │
│          ▼                                                    │
│   /hack-discover ──────▶ discovery.md                         │
│          │                                                    │
│          ▼                                                    │
│   /hack-plan ──────────▶ plan.md (with tiers)                 │
│          │                                                    │
│          ▼                                                    │
│   ┌──────────────────────────────────────────┐                │
│   │  FOR EACH TIER:                          │                │
│   │                                          │                │
│   │  /hack-build (parallel work units)       │                │
│   │          │                               │                │
│   │          ▼                               │                │
│   │  /hack-verify (tier checkpoint)          │                │
│   │          │                               │                │
│   │          ▼                               │                │
│   │  TIER COMPLETE? ──NO──▶ FIX & RETRY      │                │
│   │          │                               │                │
│   │         YES                              │                │
│   └──────────┼───────────────────────────────┘                │
│              │                                                │
│              ▼                                                │
│   ALL TIERS COMPLETE? ──NO──▶ NEXT TIER                       │
│              │                                                │
│             YES                                               │
│              │                                                │
│              ▼                                                │
│   DEMO READY ✓                                                │
└───────────────────────────────────────────────────────────────┘
```

---

## Execution Protocol

### Phase 1: Interview (5-10 min)

```
Skill("hack-interview")
```

**Checkpoint:** `docs/specs/{feature}.md` exists with:
- [ ] Clear problem statement
- [ ] Demo scenario defined
- [ ] P0 requirements listed

### Phase 2: Discover (5 min)

```
Skill("hack-discover")
```

**Checkpoint:** `docs/discovery.md` exists with:
- [ ] Tech stack identified
- [ ] Architecture mapped
- [ ] Build/run commands known

### Phase 3: Plan (10 min)

```
Skill("hack-plan")
```

**Checkpoint:** `docs/plan.md` exists with:
- [ ] Work units defined
- [ ] Tiers assigned
- [ ] Dependencies mapped
- [ ] User approved plan

### Phase 4: Build + Verify Loop

```
FOR each tier in plan:
  FOR each work_unit in tier (parallel if possible):
    Skill("hack-build", work_unit)
  END

  Skill("hack-verify", tier)

  IF verification fails:
    FIX issues
    RE-VERIFY
  END

  LOG tier checkpoint
END
```

**Per-Tier Checkpoint:**
- [ ] All work unit tests GREEN
- [ ] Integration verified
- [ ] Screenshot evidence captured
- [ ] Ready for next tier

### Phase 5: Demo Ready

**Final Checkpoint:**
- [ ] All tiers complete
- [ ] Full verification report
- [ ] Demo scenario runnable
- [ ] No console errors

---

## Checkpoint System

Track progress in `docs/checkpoint.json`:

```json
{
  "feature": "agent-collaboration-bus",
  "started_at": "2026-01-10T09:00:00Z",
  "current_phase": "build",
  "current_tier": 1,
  "checkpoints": {
    "interview": { "status": "complete", "artifact": "docs/specs/agent-collab.md" },
    "discover": { "status": "complete", "artifact": "docs/discovery.md" },
    "plan": { "status": "complete", "artifact": "docs/plan.md" },
    "tier_0": { "status": "complete", "verified_at": "2026-01-10T10:15:00Z" },
    "tier_1": { "status": "in_progress" }
  }
}
```

### Resuming After Break

If session interrupted:
1. Read `docs/checkpoint.json`
2. Resume from `current_phase` / `current_tier`
3. Don't re-do completed phases

---

## Time Budget (Sample)

| Phase | Time | Cumulative |
|-------|------|------------|
| Interview | 10 min | 10 min |
| Discover | 5 min | 15 min |
| Plan | 10 min | 25 min |
| Tier 0 (build + verify) | 30 min | 55 min |
| Tier 1 (build + verify) | 45 min | 1h 40m |
| Tier 2 (build + verify) | 45 min | 2h 25m |
| Buffer | 35 min | 3h |

**Hackathon is 9am-8pm = 11 hours. Plan for 3 major features.**

---

## Parallel Execution (2-Person Team)

```
Person A (Backend)          Person B (Frontend)
─────────────────────────────────────────────────
[TOGETHER] Interview
[TOGETHER] Discover
[TOGETHER] Plan

Tier 0: Data models         Tier 0: UI scaffolding
        ↓                           ↓
Tier 1: API endpoints       Tier 1: Components
        ↓                           ↓
[SYNC] Integration checkpoint
        ↓
Tier 2: WebSocket           Tier 2: Real-time UI
        ↓                           ↓
[SYNC] Final verification
```

---

## Bailout Conditions

If stuck for > 30 min on same issue:

```
OPTIONS:
1. Simplify scope (move to P2)
2. Ask for human help
3. Pivot approach
4. Ship what works
```

**Hackathon rule: Working demo > perfect code**

---

## Agentic Orchestration Focus

**For this hackathon specifically:**

```
Build agents that:
├── COMMUNICATE — message passing, protocols
├── SHARE CONTEXT — state synchronization
├── COORDINATE — task assignment, handoffs
└── COLLABORATE — joint problem solving

Demo should show:
├── Multiple agents working together
├── Real-time communication
├── Context shared across agents
└── Complex goal achieved collaboratively
```

---

## Output

- Complete feature with verified demo
- All artifacts in `docs/`
- Ready for judges
