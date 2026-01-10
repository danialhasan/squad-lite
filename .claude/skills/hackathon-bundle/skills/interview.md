---
name: hack-interview
description: Extract requirements from vague hackathon ideas through targeted questions. Produces a clear spec before any code is written.
allowed-tools: [Read, Write, AskUserQuestion, TodoWrite]
---

# Hack Interview Skill

## Purpose

Transform "I want to build X" into a clear, implementable spec. **No code until requirements are clear.**

## When to Use

- Starting any new hackathon feature
- When user describes what they want vaguely
- Before `/hack-discover` and `/hack-plan`

---

## Execution Protocol

### Phase 1: Opening Questions

Ask these using `AskUserQuestion` tool:

1. **What are we building?** (let them describe in their own words)
2. **Who is the user?** (target audience, persona)
3. **What's the one thing it MUST do?** (core value prop)
4. **What's the demo scenario?** (how will you show this to judges?)
5. **What tech constraints exist?** (must use X, can't use Y)

### Phase 2: Drill Down

Based on answers, ask follow-up questions:

**For UI features:**
- What's the user flow? (step by step)
- What data needs to persist vs ephemeral?
- What happens on error?

**For backend features:**
- What's the API contract? (input → output)
- What external services are involved?
- What's the latency budget?

**For AI features:**
- What model/API are you using?
- What's the prompt strategy?
- How do you handle rate limits / errors?

### Phase 3: Write Spec

Output to `docs/specs/{feature-name}.md`:

```markdown
# {Feature Name} Spec

## Overview
{One paragraph summary}

## User Story
As a {persona}, I want to {action} so that {benefit}.

## Demo Scenario
{Exactly how this will be demonstrated to judges}

## Requirements

### Must Have (P0)
- [ ] {requirement}
- [ ] {requirement}

### Should Have (P1)
- [ ] {requirement}

### Nice to Have (P2)
- [ ] {requirement}

## Technical Approach
{High-level how this will be built}

## Unknowns / Risks
- {risk or unknown}

## Success Criteria
- [ ] {How we know it's done}
```

---

## Anti-Patterns

| Don't | Do Instead |
|-------|------------|
| Start coding on vague ideas | Interview until spec is clear |
| Ask yes/no questions | Ask open-ended questions |
| Accept "it should just work" | Get specific error handling requirements |
| Skip the demo scenario | Always clarify how judges will see this |

---

## Output

- `docs/specs/{feature}.md` — Clear spec document
- Ready for `/hack-discover`

---

## Example

**User:** "I want to build a multiplayer whiteboard"

**Interview questions:**
1. Real-time sync or turn-based?
2. How many simultaneous users?
3. What tools on the whiteboard? (draw, text, shapes, images)
4. Persistence: Do boards save? How long?
5. Demo scenario: How will you show multiplayer to judges?

**Resulting spec:**
```markdown
# Multiplayer Whiteboard Spec

## Overview
Real-time collaborative whiteboard supporting 2-10 users drawing simultaneously.

## Demo Scenario
Two laptops side by side. Draw on one, see it instantly on the other.

## Requirements
### P0
- [ ] Real-time cursor sync (< 100ms latency)
- [ ] Freehand drawing with color picker
- [ ] Share via link (no auth required for demo)

### P1
- [ ] Undo/redo per user
- [ ] Clear canvas button

## Technical Approach
- WebSocket for real-time sync
- Canvas API for drawing
- Simple room ID in URL for sharing
```
