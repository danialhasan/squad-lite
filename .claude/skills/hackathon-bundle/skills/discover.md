---
name: hack-discover
description: Rapidly map any codebase using 5 parallel scout agents. Produces architecture understanding in ~5 minutes.
allowed-tools: [Task, Read, Glob, Grep, Bash, mcp__filesystem-with-morph__warpgrep_codebase_search]
---

# Hack Discover Skill

## Purpose

Understand any codebase in 5 minutes using parallel scouts. **Never assume you know the codebase — always discover first.**

## When to Use

- Starting work on unfamiliar codebase
- After pulling a hackathon starter template
- Before `/hack-plan`

---

## Execution Protocol

### Phase 1: Spawn 5 Parallel Scouts

Use `Task` tool to spawn 5 agents simultaneously:

```
Task(subagent_type="Explore", prompt="Scout 1: Business Purpose - ...")
Task(subagent_type="Explore", prompt="Scout 2: Tech Stack - ...")
Task(subagent_type="Explore", prompt="Scout 3: Architecture - ...")
Task(subagent_type="Explore", prompt="Scout 4: Data Models - ...")
Task(subagent_type="Explore", prompt="Scout 5: Build & Test - ...")
```

**All scouts should use WarpGrep for semantic search:**
```
mcp__filesystem-with-morph__warpgrep_codebase_search
  search_string: "find the main entry point"
  repo_path: "/path/to/project"
```

### Scout Prompts

**Scout 1 — Business Purpose:**
```
Discover the business purpose of this project.
Use warp_grep to search for:
- README and documentation
- Product descriptions
- User-facing features

Extract: What problem does this solve? Who uses it?
Output: One paragraph summary + bullet points
```

**Scout 2 — Tech Stack:**
```
Discover the technology stack.
Use warp_grep to search for:
- package.json, requirements.txt, Cargo.toml, go.mod
- Build configurations (vite, webpack, tsconfig)
- Framework usage patterns

Extract: Languages, frameworks, databases, key dependencies
Output: Bulleted list with versions
```

**Scout 3 — Architecture:**
```
Discover the architecture patterns.
Use warp_grep to search for:
- Entry points (main, index, app)
- API routes and handlers
- Service/module boundaries

Extract: Monorepo? Microservices? MVC? Event-driven?
Output: ASCII diagram + explanation
```

**Scout 4 — Data Models:**
```
Discover data models and state management.
Use warp_grep to search for:
- Type definitions and interfaces
- Database schemas and migrations
- State management (Redux, Pinia, Zustand)

Extract: Key entities, relationships, persistence strategy
Output: List of models with fields
```

**Scout 5 — Build & Test:**
```
Discover build and test setup.
Use warp_grep to search for:
- Test files and test utilities
- CI/CD configurations
- Build scripts

Extract: Test framework, coverage, how to run
Output: Commands to build, test, run
```

### Phase 2: Synthesize Discovery Report

After scouts return, write to `docs/discovery.md`:

```markdown
# Discovery Report

**Project:** {name}
**Discovered:** {timestamp}

## Business Purpose
{Scout 1 findings}

## Tech Stack
{Scout 2 findings}

## Architecture
{Scout 3 findings}

## Data Models
{Scout 4 findings}

## Build & Test
{Scout 5 findings}

## Quick Commands
- Build: `{command}`
- Test: `{command}`
- Run: `{command}`

## Patterns to Maintain
- {pattern discovered that should be followed}

## Red Flags / Tech Debt
- {things to be careful about}
```

---

## Fallback: No WarpGrep Available

If WarpGrep MCP isn't available, use manual discovery:

```bash
# Find entry points
ls -la src/ app/ lib/

# Find package manager
cat package.json 2>/dev/null || cat requirements.txt 2>/dev/null

# Find tests
find . -name "*.test.*" -o -name "*.spec.*" | head -20

# Find types/schemas
find . -name "*.d.ts" -o -name "schema*" | head -20
```

---

## Time Budget

| Phase | Time |
|-------|------|
| Spawn scouts | 30 sec |
| Scout execution (parallel) | 3 min |
| Synthesis | 1 min |
| **Total** | **~5 min** |

---

## Output

- `docs/discovery.md` — Full discovery report
- Ready for `/hack-plan`
