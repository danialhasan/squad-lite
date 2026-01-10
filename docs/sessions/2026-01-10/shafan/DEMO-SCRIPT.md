# Squad Lite Demo Script (3 minutes)

**Event:** MongoDB Agentic Orchestration Hackathon
**Date:** January 10, 2026 - Judging at 5 PM
**Demo URL:** https://web-eta-seven-31.vercel.app?mock=true

---

## Setup (Before Judges Arrive)

- [ ] Open https://web-eta-seven-31.vercel.app?mock=true (mock mode for reliable demo)
- [ ] Open MongoDB Compass connected to Atlas cluster
- [ ] Show `agents`, `messages`, `checkpoints` collections in Compass
- [ ] Reset demo state (click "Reset Demo")

---

## Demo Flow

### [0:00 - 0:30] Introduction

> "Squad Lite demonstrates prolonged multi-agent coordination using MongoDB Atlas. Agents checkpoint their state to MongoDB, enabling kill/restart with seamless resume."

---

### [0:30 - 1:00] Spawn Director

1. Click **"Spawn Director"**
2. Show: Agent card appears with status `idle`, sandbox `active`
3. Point to MongoDB Compass: New document in `agents` collection

---

### [1:00 - 1:30] Submit Task

1. Type in task input: **"Research MongoDB agent coordination patterns"**
2. Click **"Submit Task"**
3. Watch:
   - Director status → `working`
   - Director output: "Analyzing task...", "Decomposing into subtasks..."
   - Two Specialist agents spawn (researcher, writer)
   - Messages flow: Director → Specialists (task assignments)

---

### [1:30 - 2:00] Show Coordination

1. Point to **Messages feed**: Task messages flowing between agents
2. Point to **Checkpoints timeline**: Checkpoints being created as agents progress
3. Point to MongoDB Compass:
   - `messages` collection showing coordination
   - `checkpoints` collection showing state persistence

---

### [2:00 - 2:30] Kill & Restart (The "Wow" Moment)

1. Find a Specialist that's `working`
2. Click **"Kill"** button
3. Show:
   - Agent status → `error`, sandbox → `killed`
   - New checkpoint created (shows in timeline with red highlight)
   - MongoDB Compass: Checkpoint document with saved state
4. Click **"Restart"** button
5. Show:
   - Agent status → `idle`, sandbox → `active`
   - Output: "[Resume] Loading checkpoint... Restored context successfully."
   - Agent continues from where it left off

---

### [2:30 - 3:00] Completion

1. Watch Specialists complete and send results back to Director
2. Messages feed: Result messages flowing Specialists → Director
3. Director output: "Aggregating specialist results...", "Task completed successfully!"
4. Final checkpoint shows task complete

> "MongoDB enables true agent persistence - kill any agent, restart it, and it resumes exactly where it left off. This is prolonged coordination at scale."

---

## Key Talking Points

| Feature | MongoDB Role |
|---------|--------------|
| Agent State | `agents` collection tracks all agent metadata |
| Coordination | `messages` collection as real-time message bus |
| Persistence | `checkpoints` collection enables kill/restart resume |
| Visibility | MongoDB Compass shows everything happening in real-time |

---

## Hackathon Statements Demonstrated

### Statement 1: Prolonged Coordination
> Agents checkpoint to MongoDB, survive restarts, resume with state

**Evidence:** Kill/restart demo shows checkpoint → resume flow

### Statement 2: Multi-Agent Collaboration
> Director + N Specialists coordinate via MongoDB message bus

**Evidence:** Messages feed shows real-time coordination between agents

---

## MongoDB Collections to Show in Compass

```
squad-lite-db/
├── agents        # Agent documents with status, sandboxId, type
├── messages      # Director ↔ Specialist coordination messages
└── checkpoints   # State snapshots for resume capability
```

### Sample Documents to Highlight

**agents:**
```json
{
  "agentId": "abc123...",
  "type": "specialist",
  "specialization": "researcher",
  "status": "working",
  "sandboxId": "sbx_xyz789",
  "sandboxStatus": "active",
  "parentId": "director-id..."
}
```

**checkpoints:**
```json
{
  "checkpointId": "cp_123...",
  "agentId": "abc123...",
  "phase": "analysis_complete",
  "summary": {
    "goal": "Research MongoDB patterns",
    "completed": ["Data gathering", "Initial processing"],
    "pending": ["Final synthesis"]
  }
}
```

---

## Fallback Plans

| If This Happens | Do This |
|-----------------|---------|
| Mock mode not working | Refresh page with `?mock=true` |
| WebSocket disconnects | Show "MOCK MODE" badge, continue demo |
| Agent spawn fails | Click Reset, try again |
| Compass slow | Skip Compass, focus on UI feeds |
| Page unresponsive | Have backup tab ready |

---

## Post-Demo Q&A Prep

**Q: Why MongoDB over other databases?**
> Document model perfectly matches agent state. Change streams enable real-time coordination. Atlas scales without ops overhead.

**Q: How does checkpoint/resume work?**
> On kill, agent serializes current context to checkpoint document. On restart, loads checkpoint and continues from saved state.

**Q: What's the latency like?**
> MongoDB Atlas provides single-digit ms latency. Message bus updates in real-time via change streams.

**Q: Can this scale beyond 3 agents?**
> Yes - MongoDB handles the coordination. We limited to 3 for demo clarity, but architecture supports N agents.

---

## Timing Checklist

- [ ] 0:00 - Start intro
- [ ] 0:30 - Spawn director
- [ ] 1:00 - Submit task
- [ ] 1:30 - Show coordination
- [ ] 2:00 - Kill/restart demo
- [ ] 2:30 - Show completion
- [ ] 3:00 - Wrap up

---

*Last updated: 2026-01-10*
