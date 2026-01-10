# Verification Report: {Feature}

**Date:** {timestamp}
**Tier:** {tier_number}
**Status:** PASS | FAIL | PARTIAL

---

## Verification Checklist

### Tests

- [ ] All tests pass: `pnpm test`
- [ ] Type check passes: `pnpm typecheck`
- [ ] Lint passes: `pnpm lint`

```bash
# Test output
{paste test output here}
```

### Runtime Verification

- [ ] Dev server starts without errors
- [ ] Feature accessible at expected route
- [ ] Console shows 0 errors

---

## Evidence Collection

### Screenshot 1: {Description}

**File:** `/tmp/verify-{tier}-{N}.png`
**What it shows:** {explanation}

```
[Screenshot embedded or path referenced]
```

### Screenshot 2: {Description}

**File:** `/tmp/verify-{tier}-{N}.png`
**What it shows:** {explanation}

---

## API Verification (if applicable)

### Endpoint: {METHOD} {path}

**Request:**
```bash
curl -X {METHOD} http://localhost:3000/{path} \
  -H "Content-Type: application/json" \
  -d '{...}'
```

**Response:**
```json
{
  "status": "success",
  ...
}
```

**Result:** PASS | FAIL

---

## Console Logs

```
{Relevant console output}
```

**Errors Found:** None | {list errors}

---

## Demo Scenario Walkthrough

### Step 1: {Action}
**Expected:** {what should happen}
**Actual:** {what did happen}
**Screenshot:** {path}
**Result:** PASS | FAIL

### Step 2: {Action}
**Expected:** {what should happen}
**Actual:** {what did happen}
**Screenshot:** {path}
**Result:** PASS | FAIL

### Step 3: {Action}
**Expected:** {what should happen}
**Actual:** {what did happen}
**Screenshot:** {path}
**Result:** PASS | FAIL

---

## P0 Requirements Verification

| Requirement | Verified | Evidence |
|-------------|----------|----------|
| {Requirement 1} | PASS/FAIL | Screenshot 1 |
| {Requirement 2} | PASS/FAIL | API response |
| {Requirement 3} | PASS/FAIL | Console output |

---

## Issues Found

### Issue 1 (if any)

**Severity:** P0 | P1 | P2
**Description:** {what's wrong}
**Evidence:** {screenshot or log}
**Fix Required:** Yes | No (can ship without)

---

## Verdict

**Overall Status:** PASS | FAIL | PARTIAL

**PASS Criteria:**
- [x] All P0 requirements verified
- [x] Demo scenario works end-to-end
- [x] No console errors
- [x] Tests pass

**If FAIL:** List blocking issues and return to `/hack-build`

**If PASS:** Tier {N} complete. Proceed to next tier or final demo.

---

## Next Steps

- [ ] {Next action}
- [ ] {Next action}

---

## Verification Captured By

**Agent:** {Claude or human}
**Method:** Chrome DevTools MCP | Playwriter MCP | Manual
**Timestamp:** {ISO timestamp}
