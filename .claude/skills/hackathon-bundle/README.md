# Hackathon Skill Bundle

**Purpose:** Portable workflow skills for rapid hackathon development.
**Created:** Extracted from Squad's CTO workflow, battle-tested over 3 months.

---

## Installation (for Shafan or any co-founder)

### Quick Install (10 min)

1. **Copy the bundle:**
   ```bash
   cp -r .claude/skills/hackathon-bundle ~/.claude/skills/
   ```

2. **Set up MCP servers:** See [INSTALL.md](INSTALL.md) for detailed instructions.

3. **Copy CLAUDE.md to project root:**
   ```bash
   cp ~/.claude/skills/hackathon-bundle/CLAUDE.md ~/your-project/CLAUDE.md
   ```

4. **Start Claude Code and test:**
   ```
   > /hack-interview
   ```

---

## Skills Included

| Skill | Purpose | Invoke With |
|-------|---------|-------------|
| `hack-interview` | Extract requirements from vague ideas | `/hack-interview` |
| `hack-discover` | Map any codebase in 5 minutes | `/hack-discover` |
| `hack-plan` | Design implementation in tiers | `/hack-plan` |
| `hack-build` | TDD implementation loop | `/hack-build` |
| `hack-verify` | Prove it works (browser/terminal) | `/hack-verify` |
| `hack-loop` | Full cycle orchestration | `/hack-loop` |

---

## Quick Start

```
User: "I want to build a real-time collaboration feature"

Claude: Invoking /hack-interview...
        → Asks 5-7 clarifying questions
        → Produces docs/specs/{feature}.md

        Invoking /hack-discover...
        → Spawns 5 parallel scouts
        → Maps codebase in 5 min
        → Produces docs/discovery.md

        Invoking /hack-plan...
        → Designs tiered implementation
        → Produces docs/plan.md with dependency graph

        Invoking /hack-build...
        → TDD: RED tests first
        → Implements to GREEN
        → Refactors

        Invoking /hack-verify...
        → Runs in browser/terminal
        → Screenshots evidence
        → PASS or FAIL with proof
```

---

## Workflow Philosophy

1. **No assumptions** — Always interview + discover first
2. **Tests define done** — RED before GREEN
3. **Evidence over claims** — Screenshot or it didn't happen
4. **Parallel scouts** — 5x faster codebase understanding
5. **Tiered execution** — Dependencies before dependents

---

## File Structure

```
hackathon-bundle/
├── README.md              ← You are here
├── CLAUDE.md              ← Shafan's bootstrap file (copy to project root)
├── INSTALL.md             ← Setup instructions
├── mcp.json.example       ← MCP server configuration template
├── skills/
│   ├── interview.md       ← Requirements extraction
│   ├── discover.md        ← Codebase mapping
│   ├── plan.md            ← Tiered implementation design
│   ├── build.md           ← TDD implementation (with Squad patterns)
│   ├── verify.md          ← E2E verification (Playwriter + Chrome)
│   └── loop.md            ← Full cycle orchestration
└── templates/
    ├── spec.md            ← Interview output template
    ├── discovery.md       ← Discovery report template
    ├── plan.md            ← Planning output template
    └── verify.md          ← Verification report template
```

---

## MCP Server Requirements

**Required:**
- `filesystem-with-morph` — WarpGrep semantic search (fast codebase exploration)
- `playwriter` — Browser automation and screenshots

**Optional:**
- `chrome-devtools` — Simpler browser verification (alternative to Playwriter)

See [INSTALL.md](INSTALL.md) for setup instructions.

---

## Squad Stack Integration

The skills include patterns for:

- **ts-rest** — Contract-first API design
- **Fastify** — Backend route implementation
- **Pinia** — Vue state management
- **Zod** — Runtime schema validation
- **Tailwind** — CSS styling

See the `build.md` skill for code templates.

---

## Two-Person Parallel Execution

```
Person A (Backend)          Person B (Frontend)
─────────────────────────────────────────────────
[TOGETHER] Interview + Discover + Plan

Tier 0: Contracts           Tier 0: (wait)

Tier 1: API endpoints       Tier 1: Components
        ↓                           ↓
[SYNC] Review each other's work

Tier 2: Integration (together)
        ↓
[SYNC] Final verification
```

---

## Time Budget (3h Feature)

| Phase | Time | Cumulative |
|-------|------|------------|
| Interview | 10 min | 10 min |
| Discover | 5 min | 15 min |
| Plan | 10 min | 25 min |
| Tier 0 (build + verify) | 30 min | 55 min |
| Tier 1 (build + verify) | 45 min | 1h 40m |
| Tier 2 (build + verify) | 45 min | 2h 25m |
| Buffer | 35 min | 3h |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Skills not loading | Verify bundle is in `~/.claude/skills/hackathon-bundle/` |
| WarpGrep not working | Check `MORPH_API_KEY` in `.mcp.json` |
| Playwriter can't connect | Start Chrome with `--remote-debugging-port=9222` |
| Screenshots failing | Use `chrome-devtools` MCP as fallback |

---

## Credits

Extracted from Squad's battle-tested CTO workflow for AI-native development.

**Core patterns:**
- Parallel scout discovery (5 agents × 5 min = 25 min of work in 5 min)
- Tiered dependency execution
- Evidence-based verification ("screenshots or it didn't happen")
- TDD discipline (RED → GREEN → REFACTOR)

---

## Good Luck at the Hackathon! 🚀
