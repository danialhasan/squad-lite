# {Feature Name} Spec

**Created:** {timestamp}
**Author:** {user}
**Status:** DRAFT | APPROVED

---

## Overview

{One paragraph summary of what we're building and why}

## User Story

As a {persona},
I want to {action},
So that {benefit}.

## Demo Scenario

**Setup:** {What needs to be in place before demo}

**Steps:**
1. {Step 1 - what user does}
2. {Step 2 - what happens}
3. {Step 3 - outcome}

**Expected Result:** {What judges/audience should see}

---

## Requirements

### P0 — Must Have (Demo Blockers)

- [ ] {Requirement 1}
- [ ] {Requirement 2}
- [ ] {Requirement 3}

### P1 — Should Have (Polish)

- [ ] {Requirement}

### P2 — Nice to Have (Stretch Goals)

- [ ] {Requirement}

---

## Technical Approach

### Architecture

```
{ASCII diagram or description}
```

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Vue 3 + Pinia + Tailwind |
| Backend | Fastify + ts-rest |
| Database | Supabase (PostgreSQL) |
| Auth | {approach} |

### Key Components

1. **{Component 1}:** {purpose}
2. **{Component 2}:** {purpose}

---

## API Contract (if applicable)

```typescript
// Define endpoints using ts-rest pattern
const contract = {
  {endpoint}: {
    method: '{METHOD}',
    path: '/{path}',
    body: z.object({ ... }),
    responses: {
      200: z.object({ ... }),
    },
  },
}
```

---

## Data Model (if applicable)

```typescript
// Zod schema for runtime validation
const {Entity}Schema = z.object({
  id: z.string().uuid(),
  // ...
})
```

---

## Unknowns & Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| {Risk 1} | H/M/L | {What to do} |

---

## Success Criteria

How we know it's done:

- [ ] P0 requirements complete
- [ ] Demo scenario works end-to-end
- [ ] Tests pass
- [ ] No console errors
- [ ] Code follows design rules

---

## Out of Scope

Explicitly NOT building:
- {Thing 1}
- {Thing 2}
