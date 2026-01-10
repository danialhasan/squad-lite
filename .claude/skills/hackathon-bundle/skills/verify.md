---
name: hack-verify
description: Prove features work from user/judge perspective. Screenshots and evidence required.
allowed-tools: [Read, Write, Bash, TodoWrite, mcp__playwriter__*, mcp__chrome-devtools__*]
---

# Hack Verify Skill

## Purpose

**Prove it works. Screenshots or it didn't happen.** Tests passing isn't enough — demonstrate the actual user experience.

## When to Use

- After `/hack-build` completes a tier
- Before marking any feature "done"
- Before demo prep

---

## Core Philosophy

```
┌─────────────────────────────────────────────────────────────┐
│                     VERIFICATION                            │
│                                                             │
│   Tests Pass ───▶ Manual Verify ───▶ Screenshot ───▶ DONE  │
│                                                             │
│   "It works in tests" is not proof.                         │
│   "Here's a screenshot" is proof.                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Execution Protocol

### Phase 1: Define Verification Steps

From the spec, list what needs to be proven:

```markdown
## Verification: Agent Collaboration Bus

1. **Agent Registration**
   - Start server
   - Connect 3 agents via WebSocket
   - Verify all show as connected

2. **Message Broadcasting**
   - Agent 1 sends message
   - Agents 2 and 3 receive it
   - Agent 1 doesn't receive own message

3. **Context Sync**
   - Agent 1 updates shared context
   - All agents see updated context
   - Verify via API or WebSocket
```

### Phase 2: Execute Verification

**For Web Apps (use Chrome DevTools MCP):**

```typescript
// Navigate to app
mcp__chrome-devtools__new_page({ url: 'http://localhost:3000' })

// Take snapshot of page structure
mcp__chrome-devtools__take_snapshot()

// Interact with UI
mcp__chrome-devtools__click({ uid: 'connect-button' })
mcp__chrome-devtools__fill({ uid: 'agent-name-input', value: 'Agent-1' })

// Screenshot evidence
mcp__chrome-devtools__take_screenshot({ filePath: '/tmp/verify-001-connected.png' })

// Check console for errors
mcp__chrome-devtools__list_console_messages()
```

**For Terminal/Backend:**

```bash
# Start server in background
pnpm dev &

# Test endpoints
curl -X POST http://localhost:3000/agents/register -d '{"id": "agent-1"}'
curl http://localhost:3000/agents | jq .

# Capture output as evidence
curl http://localhost:3000/agents > /tmp/verify-agents.json
```

**For Advanced Browser Automation (Playwriter MCP):**

```javascript
// Use Playwriter for complex interactions
mcp__playwriter__execute({
  code: `
    // Navigate and wait for load
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    // Get accessibility snapshot (find interactive elements)
    const snapshot = await accessibilitySnapshot({ page });
    console.log(snapshot);

    // Interact using aria-ref from snapshot
    await page.locator('aria-ref=e5').click();
    await page.locator('aria-ref=e12').fill('test input');

    // Screenshot with labels
    await screenshotWithAccessibilityLabels({ page });
  `
})

// Check for console errors
mcp__playwriter__execute({
  code: `
    const logs = await getLatestLogs({ page, search: /error/i });
    console.log('Errors:', logs);
  `
})
```

**Playwriter vs Chrome DevTools:**
- **Playwriter:** Full Playwright API, better for complex flows, network interception
- **Chrome DevTools:** Simpler, good for basic screenshots and clicks

### Phase 3: Evidence Collection

For each verification step, capture:

| Evidence Type | How | Example |
|---------------|-----|---------|
| Screenshot | `take_screenshot()` | UI state proof |
| API Response | `curl > file.json` | Backend behavior |
| Console Output | `list_console_messages()` | Error detection |
| Logs | `cat server.log` | Event sequence |

### Phase 4: Verification Report

Write to `docs/verify-{feature}.md`:

```markdown
# Verification Report: Agent Collaboration

**Date:** {timestamp}
**Status:** PASS | FAIL

## Evidence

### 1. Agent Registration
**Screenshot:** /tmp/verify-001-connected.png
**Result:** PASS - 3 agents shown as connected

### 2. Message Broadcasting
**Screenshot:** /tmp/verify-002-messages.png
**API Response:**
```json
{
  "messages": [
    { "from": "agent-1", "to": "broadcast", "received_by": ["agent-2", "agent-3"] }
  ]
}
```
**Result:** PASS

### 3. Context Sync
**Screenshot:** /tmp/verify-003-context.png
**Result:** PASS

## Console Errors
None detected.

## Verdict
**PASS** — Feature verified from user perspective.
```

---

## Hackathon Demo Prep

**For judging day, pre-capture:**

1. **Golden path video/screenshots**
   - Happy path from start to finish
   - Clear, labeled screenshots
   - Terminal output captured

2. **Error handling proof**
   - Show what happens on error
   - Show recovery behavior

3. **Performance evidence** (if applicable)
   - Latency measurements
   - Concurrent user handling

---

## Common Verification Patterns

### Multi-Agent Scenarios

```
Browser 1          Browser 2          Server
────────────────────────────────────────────
Connect ──────────────────────────▶ Register
                   Connect ────────▶ Register
Send msg ─────────────────────────▶ Broadcast
                   ◀─────────────── Receive msg
Screenshot ───────▶ Screenshot ───▶ Evidence
```

### WebSocket Testing

```bash
# Terminal 1: Server
pnpm dev

# Terminal 2: WebSocket client (wscat)
wscat -c ws://localhost:3000
> {"type": "register", "id": "agent-1"}

# Terminal 3: Another client
wscat -c ws://localhost:3000
> {"type": "register", "id": "agent-2"}

# Send message from agent-1, verify agent-2 receives
```

### API Flow Testing

```bash
# Create resources
curl -X POST localhost:3000/contexts -d '{"name": "shared"}'

# Update from one agent
curl -X PUT localhost:3000/contexts/shared -d '{"state": "updated"}'

# Verify from another agent
curl localhost:3000/contexts/shared | jq .state
# Expected: "updated"
```

---

## Anti-Patterns

| Don't | Do Instead |
|-------|------------|
| "Tests pass, ship it" | Screenshot working in browser/terminal |
| Skip error case verification | Show what happens on failure |
| Trust console.log | Capture actual output |
| Verify once, assume forever | Re-verify after each tier |

---

## Output

- `docs/verify-{feature}.md` — Verification report with evidence
- Screenshots in `/tmp/verify-*/`
- Ready for demo or next tier
