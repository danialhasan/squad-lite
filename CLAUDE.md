# Squad Lite — MongoDB Agentic Orchestration Hackathon

**Event:** MongoDB Agentic Orchestration & Collaboration Hackathon
**Date:** January 10, 2026
**Location:** Shack15, Ferry Building, SF
**Team:** Danial + Shafan

---

## Project Thesis

**Squad Lite** = Minimal viable multi-agent coordination system built on MongoDB Atlas.

Demonstrates:
1. **Prolonged Coordination** (Statement 1) — Agents checkpoint to MongoDB, survive restarts, resume with state
2. **Multi-Agent Collaboration** (Statement 2) — Director + N Specialists coordinate via MongoDB message bus

---

## CRITICAL: Dual-Path Strategy

**We have two specs. Choose based on E2B validation in Hour 0-1.**

| Spec | When to Use | Interface |
|------|-------------|-----------|
| [`docs/SPEC-WEB.md`](docs/SPEC-WEB.md) | E2B validation passes | Web UI + API |
| [`docs/SPEC-CLI.md`](docs/SPEC-CLI.md) | E2B validation fails OR too buggy | CLI + Terminal |

### Decision Flow

```
Hour 0-1: Run E2B Validation
          ├─ All tests pass → Use SPEC-WEB.md (E2B + Vue + Fastify)
          └─ Any test fails → Use SPEC-CLI.md (Local + CLI)

Both paths deliver THE SAME DEMO:
  • Multi-agent coordination via MongoDB
  • Checkpoint/resume on kill/restart
  • Real-time visibility in MongoDB Compass
```

### Run Validation

```bash
pnpm tsx scripts/validate-e2b.ts
```

See [`docs/DEP-GRAPH.md`](docs/DEP-GRAPH.md) for detailed validation steps.

---

## Tech Stack

| Component | Web Approach | CLI Approach |
|-----------|--------------|--------------|
| Runtime | Node.js 20.x + TypeScript | Same |
| Package Manager | pnpm | Same |
| Database | MongoDB Atlas | Same |
| Validation | Zod | Same |
| Agent Execution | **E2B Sandboxes** | **Local Node processes** |
| Backend | **Fastify + WebSocket** | **None** |
| Frontend | **Vue 3 + Vite** | **Terminal + MongoDB Compass** |
| AI SDK | @anthropic-ai/sdk | Same |

---

## Architecture (Shared Core)

Both approaches share the same core systems:

```
┌─────────────────────────────────────────────────────────────┐
│                     COORDINATION LAYER                       │
├─────────────────────────────────────────────────────────────┤
│  Message Bus (src/coordination/messages.ts)     ✅ DONE     │
│  Checkpoints (src/coordination/checkpoints.ts)  ✅ DONE     │
│  Tasks (src/coordination/tasks.ts)              🔴 TODO     │
│  Context (src/coordination/context.ts)          🔴 TODO     │
├─────────────────────────────────────────────────────────────┤
│                      AGENT LAYER                             │
├─────────────────────────────────────────────────────────────┤
│  Base Agent (src/agents/base.ts)                ✅ DONE     │
│  Director (src/agents/director.ts)              🔴 TODO     │
│  Specialist (src/agents/specialist.ts)          🔴 TODO     │
├─────────────────────────────────────────────────────────────┤
│                       DATA LAYER                             │
├─────────────────────────────────────────────────────────────┤
│  MongoDB Connection (src/db/mongo.ts)           ✅ DONE     │
│  Zod Schemas (src/db/mongo.ts)                  ✅ DONE     │
└─────────────────────────────────────────────────────────────┘
```

### Difference: Execution Layer

| Web Approach | CLI Approach |
|--------------|--------------|
| E2B Sandbox Manager | Local Process Manager |
| Fastify API Routes | CLI Commands (Commander.js) |
| Vue Dashboard | Terminal output |
| WebSocket streaming | stdout/stderr |

---

## Demo Script (3 minutes)

**Same for both approaches:**

1. **Start:** Director receives task "Research MongoDB agent coordination"
2. **Show:** MongoDB Compass — `agents` collection shows Director spawning Specialists
3. **Show:** MongoDB Compass — `messages` collection shows coordination in real-time
4. **Watch:** Specialists execute research tasks in parallel
5. **Kill:** One Specialist agent mid-task (Ctrl+C or UI button)
6. **Show:** MongoDB Compass — `checkpoints` shows saved state
7. **Restart:** Specialist loads checkpoint, continues from last action
8. **Complete:** Director aggregates results, outputs summary

**"Wow" moment:** Kill/restart with seamless resume proves MongoDB coordination + persistence

---

## Quick Start

### Prerequisites

```bash
# Clone repo
git clone https://github.com/danialhasan/squad-lite
cd squad-lite

# Install dependencies
pnpm install

# Set up environment
cp .env.example .env
# Edit .env with your keys:
#   MONGODB_URI=mongodb+srv://...
#   ANTHROPIC_API_KEY=sk-ant-...
#   E2B_API_KEY=... (if using Web approach)
```

### Hour 0-1: Validation

```bash
# Test MongoDB connection
pnpm tsx scripts/validate-mongo.ts

# Test E2B (determines Web vs CLI path)
pnpm tsx scripts/validate-e2b.ts
```

### Development

**Web Approach:**
```bash
# Start backend
pnpm run dev:api

# Start frontend (separate terminal)
cd web && pnpm run dev

# Open http://localhost:3000
```

**CLI Approach:**
```bash
# Start Director
pnpm run director --task "Research MongoDB agent coordination"

# Specialists spawn automatically via Director
# Or manually: pnpm run specialist --specialization researcher
```

---

## Project Structure

```
squad-lite/
├── CLAUDE.md                     # This file (start here)
├── package.json
├── tsconfig.json
├── .env.example
│
├── docs/
│   ├── SPEC-WEB.md              # Web approach spec
│   ├── SPEC-CLI.md              # CLI fallback spec
│   ├── DEP-GRAPH.md             # Work breakdown + validation gate
│   └── research/                # E2B, SDK research artifacts
│
├── .claude/
│   └── skills/                  # Behavior contract skills (7 skills)
│       ├── director/SKILL.md
│       ├── specialist/
│       │   ├── researcher/SKILL.md
│       │   ├── writer/SKILL.md
│       │   └── analyst/SKILL.md
│       └── shared/
│           ├── communication/SKILL.md
│           ├── checkpointing/SKILL.md
│           └── coordination/SKILL.md
│
├── src/
│   ├── config.ts                # Environment config
│   ├── db/mongo.ts              # ✅ MongoDB + Schemas
│   ├── coordination/
│   │   ├── messages.ts          # ✅ Message bus
│   │   ├── checkpoints.ts       # ✅ Checkpoint system
│   │   ├── tasks.ts             # 🔴 Task management
│   │   └── context.ts           # 🔴 Context builder
│   ├── agents/
│   │   ├── base.ts              # ✅ Base agent
│   │   ├── director.ts          # 🔴 Director
│   │   └── specialist.ts        # 🔴 Specialist
│   ├── sandbox/                 # Web approach only
│   │   └── manager.ts           # 🔴 E2B integration
│   ├── process/                 # CLI approach only
│   │   └── manager.ts           # 🔴 Local process manager
│   ├── sdk/
│   │   └── runner.ts            # 🔴 Claude SDK wrapper
│   └── api/                     # Web approach only
│       ├── server.ts
│       └── routes/
│
├── web/                         # Web approach only
│   ├── package.json
│   └── src/
│       ├── App.vue
│       └── components/
│
└── scripts/
    ├── validate-e2b.ts          # E2B validation script
    └── validate-mongo.ts        # MongoDB validation script
```

---

## Design Principles

### From Squad (Maintain These)

```typescript
// ✅ Named exports only
export const createAgent = () => {}

// ❌ No default exports
export default function createAgent() {}

// ✅ Factory functions
export const createRunner = (config) => ({...})

// ❌ No classes
class Runner {}

// ✅ Config layer
import { config } from './config.js'

// ❌ No direct env access
process.env.MONGODB_URI
```

### Hackathon-Specific

1. **Happy path only** — No complex error handling
2. **MongoDB is visibility** — Use Compass for judges
3. **3 agents max** — Reliable demo over impressive scale
4. **Checkpoint everything** — Enable the kill/restart demo
5. **Fail fast** — Validate E2B in Hour 0, pivot if needed

---

## Links

- **GitHub:** https://github.com/danialhasan/squad-lite
- **Linear:** https://linear.app/trysquad/team/HACK
- **MongoDB Atlas:** [Cluster Dashboard]
- **E2B Dashboard:** https://e2b.dev/dashboard
- **Hackathon Page:** https://cerebralvalley.ai/e/agentic-orchestration-hackathon

---

## Reading Order for Agents

1. **This file** — Overview + dual-path strategy
2. **[`docs/DEP-GRAPH.md`](docs/DEP-GRAPH.md)** — Work breakdown + validation gate
3. **[`docs/SPEC-WEB.md`](docs/SPEC-WEB.md)** OR **[`docs/SPEC-CLI.md`](docs/SPEC-CLI.md)** — Based on E2B validation
4. **Behavior skills** — `.claude/skills/` for agent protocols

---

_Last updated: 2026-01-10 (v3.0 - Dual-path strategy)_
