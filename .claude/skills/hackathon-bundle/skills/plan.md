---
name: hack-plan
description: Design tiered implementation plan with dependency ordering. No coding until the plan is approved.
allowed-tools: [Read, Write, AskUserQuestion, TodoWrite]
---

# Hack Plan Skill

## Purpose

Transform spec + discovery into an executable implementation plan. **Plan in tiers, execute in order.**

## When to Use

- After `/hack-interview` and `/hack-discover`
- Before any implementation work
- When scope feels too big to tackle

---

## Execution Protocol

### Phase 1: Load Context

Read the outputs from previous phases:
- `docs/specs/{feature}.md` — What we're building
- `docs/discovery.md` — How the codebase works

### Phase 2: Identify Work Units

Break the spec into atomic work units:

| Work Unit | Description | Depends On |
|-----------|-------------|------------|
| WU-1 | Create data model | - |
| WU-2 | Add API endpoint | WU-1 |
| WU-3 | Build UI component | WU-2 |
| WU-4 | Wire up integration | WU-2, WU-3 |
| WU-5 | Add real-time sync | WU-4 |

### Phase 3: Assign to Tiers

**Tier 0 (Foundation):** No dependencies, enables everything else
**Tier 1:** Depends only on Tier 0
**Tier 2:** Depends on Tier 0 and Tier 1
**Tier N:** Depends on all previous tiers

```
TIER 0 (parallel)     TIER 1 (parallel)     TIER 2 (parallel)
┌────────────┐        ┌────────────┐        ┌────────────┐
│  WU-1      │───────▶│  WU-2      │───────▶│  WU-4      │
│  Data Model│        │  API       │        │  Integrate │
└────────────┘        └────────────┘        └────────────┘
                      ┌────────────┐        ┌────────────┐
                      │  WU-3      │───────▶│  WU-5      │
                      │  UI        │        │  Real-time │
                      └────────────┘        └────────────┘
```

### Phase 4: Define Verification Criteria

For each work unit, define:
- **Test:** How do we know it works? (unit test, integration test)
- **Verify:** How do we prove it works? (screenshot, curl, demo)

### Phase 5: Write Plan

Output to `docs/plan.md`:

```markdown
# Implementation Plan: {Feature}

**Spec:** docs/specs/{feature}.md
**Created:** {timestamp}

---

## Tier Overview

| Tier | Work Units | Parallel? | Est. Time |
|------|------------|-----------|-----------|
| 0 | WU-1 | N/A | 15 min |
| 1 | WU-2, WU-3 | Yes | 30 min |
| 2 | WU-4, WU-5 | Yes | 30 min |

**Total Estimated:** 1h 15m

---

## Tier 0: Foundation

### WU-1: {Title}

**Goal:** {what this achieves}

**Implementation:**
1. {step}
2. {step}
3. {step}

**Files to touch:**
- `src/models/{model}.ts`

**Test:**
```bash
pnpm test src/models/{model}.test.ts
```

**Verify:**
- Unit tests pass
- Type check passes

---

## Tier 1: Core Features

### WU-2: {Title}
...

### WU-3: {Title}
...

---

## Tier 2: Integration

### WU-4: {Title}
...

---

## Dependencies

```
WU-1 ──▶ WU-2 ──▶ WU-4
              ╲
WU-1 ──▶ WU-3 ──▶ WU-5
```

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| {risk} | {H/M/L} | {what to do} |

---

## Checkpoints

- [ ] Tier 0 complete — foundation works
- [ ] Tier 1 complete — core features work independently
- [ ] Tier 2 complete — everything integrated
- [ ] Demo ready — can show to judges
```

### Phase 6: Get Approval

Before proceeding:
```
AskUserQuestion: "Here's the implementation plan.
Does this tier structure make sense?
Should we adjust scope or ordering?"
```

---

## Hackathon Shortcuts

**When time is tight:**
- Collapse Tier 2 items into Tier 1 if simple
- Mark P2 requirements as "stretch goals"
- Focus on demo scenario path first

**Parallel execution:**
- If two people: split by tier (one does backend, one does frontend)
- If one person: work top-to-bottom through tiers

---

## Output

- `docs/plan.md` — Tiered implementation plan
- TodoWrite populated with work units
- Ready for `/hack-build`
