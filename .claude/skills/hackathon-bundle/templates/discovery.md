# Discovery Report

**Project:** {name}
**Discovered:** {timestamp}
**Scout Duration:** ~{X} minutes

---

## Business Purpose

{Scout 1 findings}

**Problem:** {What problem does this solve?}
**Users:** {Who uses it?}
**Value:** {Why does it matter?}

---

## Tech Stack

{Scout 2 findings}

| Category | Technology | Version |
|----------|------------|---------|
| Language | TypeScript | 5.x |
| Frontend | Vue 3 | 3.x |
| State | Pinia | 2.x |
| Backend | Fastify | 4.x |
| API | ts-rest | latest |
| Database | Supabase | - |
| Styling | Tailwind CSS | 3.x |
| Build | Vite | 5.x |
| Test | Vitest | 1.x |

**Key Dependencies:**
- {dep1}: {purpose}
- {dep2}: {purpose}

---

## Architecture

{Scout 3 findings}

### Diagram

```
┌─────────────────────────────────────────────┐
│                  Frontend                    │
│  Vue 3 + Pinia + Tailwind                   │
└─────────────────┬───────────────────────────┘
                  │ ts-rest client
                  ▼
┌─────────────────────────────────────────────┐
│                  Backend                     │
│  Fastify + ts-rest                          │
└─────────────────┬───────────────────────────┘
                  │ Supabase client
                  ▼
┌─────────────────────────────────────────────┐
│                 Database                     │
│  Supabase (PostgreSQL + RLS)                │
└─────────────────────────────────────────────┘
```

### Key Boundaries

| Boundary | Location | Purpose |
|----------|----------|---------|
| Contracts | `packages/contracts/` | API types, shared schemas |
| Frontend | `apps/desktop/ui/` | Vue components, stores |
| Backend | `services/backend/` | API routes, business logic |

---

## Data Models

{Scout 4 findings}

### Key Entities

| Entity | Location | Purpose |
|--------|----------|---------|
| {Entity1} | `packages/contracts/src/{file}.ts` | {purpose} |
| {Entity2} | `services/backend/src/modules/{x}/` | {purpose} |

### Schema Patterns

```typescript
// Example discovered pattern
const exampleSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  // ...
})
```

---

## Build & Test

{Scout 5 findings}

### Quick Commands

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Run tests
pnpm test

# Type check
pnpm typecheck

# Lint
pnpm lint

# Build for production
pnpm build
```

### Test Setup

- **Framework:** Vitest
- **Location:** `**/*.test.ts` or `__tests__/` directories
- **Run specific:** `pnpm test {file}`

---

## Entry Points

| Purpose | File |
|---------|------|
| Frontend app | `apps/desktop/ui/src/main.ts` |
| Backend server | `services/backend/src/server.ts` |
| API routes | `services/backend/src/api/routes.ts` |
| Contracts | `packages/contracts/src/index.ts` |

---

## Patterns to Maintain

{Discovered conventions that new code should follow}

- [ ] Named exports only (no default exports)
- [ ] Factory functions (no classes)
- [ ] ts-rest for API contracts
- [ ] Zod for runtime validation
- [ ] Pinia stores for state
- [ ] Tailwind for styling

---

## Red Flags / Tech Debt

{Things to be careful about}

- {Issue 1}: {why it matters}
- {Issue 2}: {workaround}

---

## Ready for Planning

Discovery complete. Proceed to `/hack-plan`.
