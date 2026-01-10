# Implementation Plan: {Feature}

**Spec:** docs/specs/{feature}.md
**Discovery:** docs/discovery.md
**Created:** {timestamp}
**Status:** DRAFT | APPROVED

---

## Tier Overview

| Tier | Work Units | Parallel? | Est. Time |
|------|------------|-----------|-----------|
| 0 | WU-1 | N/A | 15 min |
| 1 | WU-2, WU-3 | Yes | 30 min |
| 2 | WU-4 | N/A | 20 min |

**Total Estimated:** 1h 5m

---

## Dependency Graph

```
TIER 0 (Foundation)     TIER 1 (Features)      TIER 2 (Integration)
┌────────────────┐      ┌────────────────┐      ┌────────────────┐
│  WU-1          │─────▶│  WU-2          │─────▶│  WU-4          │
│  {description} │      │  {description} │      │  {description} │
└────────────────┘      └────────────────┘      └────────────────┘
                        ┌────────────────┐
                        │  WU-3          │─────▶ (also WU-4)
                        │  {description} │
                        └────────────────┘
```

---

## Tier 0: Foundation

### WU-1: {Title}

**Goal:** {What this achieves}

**Depends On:** None (foundation)

**Implementation:**
1. {Step 1}
2. {Step 2}
3. {Step 3}

**Files to Touch:**
- `packages/contracts/src/{file}.ts`
- `services/backend/src/modules/{module}/`

**Test:**
```bash
pnpm test packages/contracts/src/{file}.test.ts
```

**Verify:**
- [ ] Types compile
- [ ] Tests pass
- [ ] Contract is importable

**Est. Time:** 15 min

---

## Tier 1: Core Features

### WU-2: {Title}

**Goal:** {What this achieves}

**Depends On:** WU-1

**Implementation:**
1. {Step 1}
2. {Step 2}
3. {Step 3}

**Files to Touch:**
- `services/backend/src/api/{route}.ts`
- `services/backend/src/modules/{module}/`

**Test:**
```bash
pnpm test services/backend/src/modules/{module}/__tests__/
```

**Verify:**
- [ ] API returns expected response
- [ ] Tests pass
- [ ] curl verification works

**Est. Time:** 15 min

---

### WU-3: {Title}

**Goal:** {What this achieves}

**Depends On:** WU-1

**Implementation:**
1. {Step 1}
2. {Step 2}
3. {Step 3}

**Files to Touch:**
- `apps/desktop/ui/src/components/{component}.vue`
- `apps/desktop/ui/src/stores/{store}.ts`

**Test:**
```bash
pnpm test apps/desktop/ui/src/components/{component}.test.ts
```

**Verify:**
- [ ] Component renders
- [ ] Interacts correctly
- [ ] Screenshot captured

**Est. Time:** 15 min

---

## Tier 2: Integration

### WU-4: {Title}

**Goal:** {What this achieves}

**Depends On:** WU-2, WU-3

**Implementation:**
1. {Step 1}
2. {Step 2}
3. {Step 3}

**Files to Touch:**
- `apps/desktop/ui/src/views/{view}.vue`
- Integration between frontend and backend

**Test:**
```bash
pnpm test
```

**Verify:**
- [ ] End-to-end flow works
- [ ] Demo scenario runs
- [ ] Screenshot of working feature

**Est. Time:** 20 min

---

## Parallel Execution (2-Person Split)

```
Person A (Backend)          Person B (Frontend)
─────────────────────────────────────────────────
[TOGETHER] Interview + Discover + Plan

Tier 0: WU-1 (both wait)

Tier 1: WU-2 (API)          Tier 1: WU-3 (Component)
        ↓                           ↓
[SYNC] Review each other's work

Tier 2: WU-4 (Integration - together)
        ↓
[SYNC] Final verification
```

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| {Risk 1} | H/M/L | {Strategy} |
| {Risk 2} | H/M/L | {Strategy} |

---

## Checkpoints

- [ ] **Tier 0 complete** — Foundation works, types compile
- [ ] **Tier 1 complete** — Features work independently
- [ ] **Tier 2 complete** — Everything integrated
- [ ] **Demo ready** — Can show to judges

---

## Bailout Options

If stuck > 30 min:

1. **Simplify scope** — Move to P2, ship what works
2. **Ask for help** — Sync with teammate
3. **Pivot approach** — Different implementation strategy
4. **Ship MVP** — Working demo > perfect code

---

## Approval

[ ] Plan reviewed by all team members
[ ] Dependencies are clear
[ ] Time estimates are realistic
[ ] Ready to proceed to `/hack-build`
