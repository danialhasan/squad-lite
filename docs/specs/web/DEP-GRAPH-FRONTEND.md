# Frontend Dependency Graph — Human-Verifiable Tasks

**Approach:** Component-driven development with visual verification
**Developer:** Frontend engineer (Danial or Shafan)
**Verification:** Human checks UI, interactions, and real-time updates

---

## Verification Strategy

**Frontend tasks require human verification because:**
1. **Visual design** — Does it look good? Are colors/spacing right?
2. **Interactions** — Do buttons work? Are animations smooth?
3. **Real-time updates** — Do WebSocket events update UI correctly?
4. **UX flow** — Is the demo flow intuitive?

**Gate:** Human manually verifies each component before moving to next.

---

## Tier 0: Setup (30 min)

| Component | File | Verification |
|-----------|------|--------------|
| Vue project scaffold | `web/package.json`, `web/vite.config.ts` | ✅ `pnpm dev` runs |
| TypeScript config | `web/tsconfig.json` | ✅ No compile errors |
| Import API contract types | `web/src/types.ts` | ✅ Types available |

**Setup tasks:**
- [ ] Create `web/` directory
- [ ] `pnpm create vite web --template vue-ts`
- [ ] `pnpm add @ts-rest/core` (client)
- [ ] Import contract: `import type { ApiContract } from '../../src/contracts/api.contract'`
- [ ] `pnpm dev` - Verify dev server runs

**Human verification:**
- [ ] Open http://localhost:5173
- [ ] See default Vite + Vue page
- [ ] No console errors

---

## Tier 1: Core Components (Hours 1-3)

### WP1-FE: API Client Setup (30 min)

**File:** `web/src/api/client.ts`
**Dependencies:** Contract types

**Tasks:**
- [ ] Set up `@ts-rest/core` client
- [ ] Configure base URL (http://localhost:3001)
- [ ] Create typed API client from contract
- [ ] Export client for components

**Code:**
```typescript
import { initClient } from '@ts-rest/core'
import type { ApiContract } from '../../../src/contracts/api.contract'

export const api = initClient<ApiContract>({
  baseUrl: 'http://localhost:3001',
  baseHeaders: {},
})
```

**Human verification:**
- [ ] TypeScript autocomplete works for `api.agents.spawn()`
- [ ] No type errors in IDE

---

### WP2-FE: WebSocket Client (30 min)

**File:** `web/src/api/websocket.ts`
**Dependencies:** WebSocket contract

**Tasks:**
- [ ] Create WebSocket connection to `ws://localhost:3001/ws`
- [ ] Type events with `WsEvent` from contract
- [ ] Expose event listeners
- [ ] Handle reconnection

**Code:**
```typescript
import type { WsEvent } from '../../../src/contracts/websocket.contract'

export const createWsClient = (onEvent: (event: WsEvent) => void) => {
  const ws = new WebSocket('ws://localhost:3001/ws')

  ws.onmessage = (msg) => {
    const event: WsEvent = JSON.parse(msg.data)
    onEvent(event)
  }

  return ws
}
```

**Human verification:**
- [ ] WebSocket connects (check browser DevTools Network tab)
- [ ] Events logged to console
- [ ] Reconnects if server restarts

---

### WP3-FE: Agent Card Component (45 min)

**File:** `web/src/components/AgentCard.vue`
**Dependencies:** API types

**Tasks:**
- [ ] Display agent ID (truncated), type, status
- [ ] Show sandbox status with color coding
- [ ] Show last heartbeat time
- [ ] Add [Kill] button
- [ ] Add [Restart] button (if killed)

**Human verification:**
- [ ] Card displays agent info correctly
- [ ] Status colors:
  - `idle` = gray
  - `working` = blue (pulsing)
  - `error`/`killed` = red
  - `completed` = green
- [ ] Buttons work (click triggers API call)
- [ ] Card updates in real-time when status changes
- [ ] Looks good visually (spacing, colors, typography)

---

### WP4-FE: Message Feed Component (45 min)

**File:** `web/src/components/MessageFeed.vue`
**Dependencies:** WebSocket, message types

**Tasks:**
- [ ] Display messages in chronological order
- [ ] Show from/to agents (truncated IDs)
- [ ] Show message type with icon
- [ ] Auto-scroll to latest message
- [ ] Highlight priority messages

**Human verification:**
- [ ] Messages appear in real-time (no refresh needed)
- [ ] Message types have different colors/icons:
  - `task` = blue → icon
  - `result` = green ✓ icon
  - `status` = yellow info icon
  - `error` = red ✗ icon
- [ ] Auto-scroll works smoothly
- [ ] Readable and not cluttered

---

### WP5-FE: Checkpoint Timeline Component (30 min)

**File:** `web/src/components/CheckpointTimeline.vue`
**Dependencies:** WebSocket, checkpoint types

**Tasks:**
- [ ] Display checkpoints as timeline
- [ ] Show agent ID, phase, timestamp
- [ ] Highlight "kill" checkpoints
- [ ] Show resumePointer.nextAction on hover

**Human verification:**
- [ ] Checkpoints appear in timeline as they're created
- [ ] Kill checkpoint highlighted/badged differently
- [ ] Hover shows full checkpoint summary
- [ ] Timeline is chronological (newest at top)
- [ ] Looks clean and professional

---

## Tier 2: Integration & Demo (Hours 3-4.5)

### WP6-FE: Demo Controls (30 min)

**File:** `web/src/components/DemoControls.vue`
**Dependencies:** API client

**Tasks:**
- [ ] [Spawn Director] button → POST /api/agents
- [ ] Task input field + [Submit] button
- [ ] [Reset Demo] button - clear MongoDB

**Human verification:**
- [ ] Spawn button works (agent appears)
- [ ] Submit button sends task (agents start working)
- [ ] Reset button clears demo state
- [ ] Buttons disabled while loading
- [ ] Loading spinners appear
- [ ] Success/error toasts show

---

### WP7-FE: Main Dashboard Layout (45 min)

**File:** `web/src/App.vue`
**Dependencies:** All components

**Tasks:**
- [ ] Header with title + controls
- [ ] Left panel: Agent cards grid
- [ ] Right panel: Message feed + checkpoint timeline
- [ ] Responsive layout
- [ ] Dark mode (optional)

**Human verification:**
- [ ] Layout looks professional
- [ ] Components positioned correctly
- [ ] Responsive on different screen sizes
- [ ] No layout shifting when content updates
- [ ] Smooth transitions when agents spawn/die

---

### WP8-FE: Stdout Streaming Panel (30 min)

**File:** `web/src/components/OutputPanel.vue`
**Dependencies:** WebSocket agent:output events

**Tasks:**
- [ ] Display real-time stdout from sandboxes
- [ ] Separate panels for each agent
- [ ] Auto-scroll to latest output
- [ ] Color code stderr (red)

**Human verification:**
- [ ] Stdout appears immediately (no lag)
- [ ] Output panels easy to read (monospace font)
- [ ] Stderr is red and clearly different
- [ ] Auto-scroll doesn't jump unexpectedly
- [ ] Can scroll up to see history

---

## Tier 3: Polish (Hours 4.5-5.5)

### WP9-FE: Demo Polish (1 hour)

**No new files, just refinement**

**Tasks:**
- [ ] Add loading states everywhere
- [ ] Add error messages for failed operations
- [ ] Improve visual design (spacing, colors)
- [ ] Add demo instructions on screen
- [ ] Test full flow 5 times

**Human verification checklist:**
- [ ] Demo runs smoothly start to finish
- [ ] All buttons work reliably
- [ ] Real-time updates don't lag
- [ ] UI doesn't freeze or glitch
- [ ] Error states handled gracefully
- [ ] Looks professional for judges
- [ ] **Can demo confidently in front of audience**

---

## Human Verification Protocol

### Per-Component Checklist

For each component, verify:

1. **Visual Design**
   - [ ] Matches design intent
   - [ ] Colors/spacing consistent
   - [ ] Typography readable
   - [ ] Icons/badges appropriate

2. **Interactions**
   - [ ] Buttons click correctly
   - [ ] Forms submit properly
   - [ ] Hover states work
   - [ ] Loading states appear

3. **Real-time Updates**
   - [ ] Data appears immediately
   - [ ] No need to refresh
   - [ ] Transitions are smooth
   - [ ] No flickering or jumping

4. **Error Handling**
   - [ ] Errors displayed clearly
   - [ ] User knows what went wrong
   - [ ] Can recover from errors
   - [ ] No console errors

### Demo Run Verification

Run full demo flow and verify:

1. **Start:** Spawn director via UI
   - [ ] Agent card appears immediately
   - [ ] Sandbox ID shown
   - [ ] Status shows "idle"

2. **Task:** Submit research task
   - [ ] Task input accepts text
   - [ ] Submit button triggers request
   - [ ] Loading state appears briefly
   - [ ] Success feedback shown

3. **Coordination:** Watch specialists spawn
   - [ ] 2 new agent cards appear within 10s
   - [ ] Status changes to "working"
   - [ ] Messages appear in feed
   - [ ] Stdout streams in output panels

4. **Kill:** Click kill on specialist
   - [ ] Confirm dialog appears
   - [ ] Agent status changes to "killed"
   - [ ] Checkpoint appears in timeline
   - [ ] Restart button becomes available

5. **Restart:** Click restart
   - [ ] New agent card appears
   - [ ] Shows "resuming from checkpoint" message
   - [ ] Output continues where it left off
   - [ ] Task completes

6. **Complete:** Final result displayed
   - [ ] Director shows aggregated result
   - [ ] All agents show "completed"
   - [ ] Timeline shows full history

**If any step fails:** Fix before moving to next tier.

---

## Timeline (Frontend Only)

```
Hour 0-0.5:   Tier 0 (Setup)
Hour 0.5-3:   Tier 1 (Core Components)
Hour 3-4.5:   Tier 2 (Integration & Demo)
Hour 4.5-5.5: Tier 3 (Polish)
```

**Total:** ~5.5 hours for full frontend with human verification

---

## Success Criteria (Frontend)

- [ ] All components render without errors
- [ ] API client calls backend successfully
- [ ] WebSocket receives and displays events
- [ ] Demo controls work (spawn, submit, kill, restart)
- [ ] Real-time updates appear instantly
- [ ] UI looks professional for judges
- [ ] **Human can confidently demo in < 3 minutes**

**Definition of done:** Frontend works smoothly through full demo flow with human watching.

---

_Frontend dependency graph with human verification gates._
