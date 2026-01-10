#!/usr/bin/env bash
# SDLC Loop Stop Gate
# Exit 0 = allow stop, Exit 2 = block stop (continue)

set -euo pipefail

log() {
  echo "[sdlc-loop] $*" >&2
}

# Required receipts (defined early for use in bailout notifications)
REQUIRED_RECEIPTS=(
  "interview.json"
  "discover.json"
  "plan.json"
  "build.json"
  "backend.json"
  "e2e.json"
  "verify.json"
)

# Allow emergency stop via env flag
if [[ "${SDLC_EMERGENCY_STOP:-}" == "true" ]]; then
  log "Emergency stop flag detected. Allowing termination."
  exit 0
fi

RECEIPT_ROOT=".squad/receipts"
if [[ ! -d "$RECEIPT_ROOT" ]]; then
  # No receipts directory means no active loop
  exit 0
fi

ACTIVE_CHECKPOINT=$(find "$RECEIPT_ROOT" -name "CHECKPOINT.json" -mmin -60 2>/dev/null | head -1 || true)
if [[ -z "$ACTIVE_CHECKPOINT" ]]; then
  # No active checkpoint, allow stop
  exit 0
fi

SESSION_DIR=$(dirname "$ACTIVE_CHECKPOINT")

# Emergency stop stored in checkpoint
if command -v jq >/dev/null 2>&1; then
  if jq -e '.emergency_stop == true' "$ACTIVE_CHECKPOINT" >/dev/null 2>&1; then
    log "Emergency stop requested in checkpoint. Allowing termination."
    exit 0
  fi

  # Loop detection: 10+ consecutive failures = auto-bailout
  CONSECUTIVE_FAILURES=$(jq -r '.consecutive_failures // 0' "$ACTIVE_CHECKPOINT" 2>/dev/null || echo "0")
  if [[ "$CONSECUTIVE_FAILURES" -ge 10 ]]; then
    LAST_ERROR=$(jq -r '.last_error // "unknown"' "$ACTIVE_CHECKPOINT" 2>/dev/null || echo "unknown")

    log "🚨 LOOP DETECTED: $CONSECUTIVE_FAILURES consecutive failures"
    log "Last error: $LAST_ERROR"

    # Write auto-bailout notification
    NOTIFY_DIR=".squad/notifications"
    mkdir -p "$NOTIFY_DIR"
    TS=$(date -u +%Y%m%dT%H%M%SZ)

    cat > "$NOTIFY_DIR/auto-bailout-$TS.md" <<EOF
# 🚨 AUTO-BAILOUT (Loop Detected)

**Timestamp:** $TS
**Session:** $SESSION_DIR
**Consecutive Failures:** $CONSECUTIVE_FAILURES

## Repeated Error

The following error occurred $CONSECUTIVE_FAILURES times:

\`\`\`
$LAST_ERROR
\`\`\`

## Required Human Action

This indicates a systemic issue that cannot be resolved autonomously.

Possible causes:
- Infrastructure failure (services not running)
- MCP connection issues
- Missing credentials or permissions
- Fundamental misunderstanding of requirements

Please investigate and fix the underlying issue.

## How to Resume

After fixing the issue:
\`\`\`bash
/sdlc-loop --resume
\`\`\`

Checkpoint: $ACTIVE_CHECKPOINT
EOF

    # Sound alert (macOS)
    if command -v afplay &>/dev/null; then
      afplay /System/Library/Sounds/Sosumi.aiff 2>/dev/null &
    fi

    log "Auto-bailout notification: $NOTIFY_DIR/auto-bailout-$TS.md"
    exit 0
  fi
fi

# Bailout detection: check recent output or session logs
OUTPUT_FILE=""
for candidate in "${SDLC_BAILOUT_LOG:-}" "${SDLC_LAST_OUTPUT:-}" "${CLAUDE_OUTPUT_PATH:-}" "$SESSION_DIR/bailout.log" "$SESSION_DIR/output.log" "$SESSION_DIR/claude-output.log"; do
  if [[ -n "${candidate:-}" && -f "$candidate" ]]; then
    OUTPUT_FILE="$candidate"
    break
  fi
done

if [[ -n "$OUTPUT_FILE" ]]; then
  BAILOUT_COUNT=$(grep -c "<bailout>" "$OUTPUT_FILE" 2>/dev/null || echo 0)
  if [[ "$BAILOUT_COUNT" -ge 3 ]]; then
    REASON=$(grep -o "<bailout>[^<]*</bailout>" "$OUTPUT_FILE" 2>/dev/null | head -1 | sed 's/<[^>]*>//g' || true)
    REASON=${REASON:-"unknown blocker"}

    NOTIFY_DIR=".squad/notifications"
    mkdir -p "$NOTIFY_DIR"
    TS=$(date -u +%Y%m%dT%H%M%SZ)
    NOTIFY_FILE="$NOTIFY_DIR/bailout-$TS.md"

    {
      echo "# 🚨 BAILOUT NOTIFICATION"
      echo ""
      echo "**Timestamp:** $TS"
      echo "**Session:** $(basename "$SESSION_DIR")"
      echo "**Reason:** $REASON"
      echo ""
      echo "## Context"
      echo ""
      if command -v jq >/dev/null 2>&1; then
        CURRENT_PHASE=$(jq -r '.current_phase // "unknown"' "$ACTIVE_CHECKPOINT" 2>/dev/null || echo "unknown")
        echo "- Phase: $CURRENT_PHASE"
      fi
      echo "- Bailout triggered by agent after encountering hard blocker"
      echo ""
      echo "## Receipts Collected Before Bailout"
      echo ""
      for r in "${REQUIRED_RECEIPTS[@]}"; do
        if [[ -f "$SESSION_DIR/$r" ]]; then
          echo "- ✅ $r"
        else
          echo "- ⬜ $r (blocked)"
        fi
      done
      echo ""
      echo "## Required Human Action"
      echo ""
      echo "1. Review the bailout reason above"
      echo "2. Address the underlying issue:"
      echo "   - Check MCP connections (Electron, Chrome DevTools, Rube)"
      echo "   - Verify services are running (backend on 3003, Electron app)"
      echo "   - Check credentials and environment variables"
      echo "3. Resume when ready: \`/sdlc-loop --resume\`"
      echo ""
      echo "## Checkpoint"
      echo ""
      echo "Checkpoint saved at:"
      echo "\`\`\`"
      echo "$ACTIVE_CHECKPOINT"
      echo "\`\`\`"
    } > "$NOTIFY_FILE"

    log "Bailout triggered: $REASON"
    log "Notification written to $NOTIFY_FILE"
    exit 0
  fi
fi

# Validate receipts
ALL_PASS=true
MISSING_RECEIPTS=()

sha256_file() {
  local path="$1"
  if command -v shasum >/dev/null 2>&1; then
    shasum -a 256 "$path" | awk '{print $1}'
  elif command -v sha256sum >/dev/null 2>&1; then
    sha256sum "$path" | awk '{print $1}'
  else
    echo ""
  fi
}

log "SDLC loop completion gate check"

for receipt in "${REQUIRED_RECEIPTS[@]}"; do
  RECEIPT_PATH="$SESSION_DIR/$receipt"

  if [[ ! -f "$RECEIPT_PATH" ]]; then
    log "[MISS] $receipt (missing)"
    ALL_PASS=false
    MISSING_RECEIPTS+=("$receipt")
    continue
  fi

  STATUS="unknown"
  if command -v jq >/dev/null 2>&1; then
    STATUS=$(jq -r '.status // "unknown"' "$RECEIPT_PATH" 2>/dev/null || echo "unknown")
  fi

  if [[ "$STATUS" != "pass" ]]; then
    log "[FAIL] $receipt (status: $STATUS)"
    ALL_PASS=false
    MISSING_RECEIPTS+=("$receipt")
    continue
  fi

  # Optional artifact hash verification
  if command -v jq >/dev/null 2>&1; then
    if jq -e '.artifacts and (.artifacts | length > 0)' "$RECEIPT_PATH" >/dev/null 2>&1; then
      while IFS=$'\t' read -r artifact_path artifact_hash; do
        [[ -z "${artifact_path:-}" ]] && continue
        if [[ ! -f "$artifact_path" ]]; then
          log "[FAIL] $receipt artifact missing: $artifact_path"
          ALL_PASS=false
          MISSING_RECEIPTS+=("$receipt")
          continue
        fi
        if [[ -n "${artifact_hash:-}" ]]; then
          computed=$(sha256_file "$artifact_path")
          if [[ -z "$computed" || "$computed" != "$artifact_hash" ]]; then
            log "[FAIL] $receipt artifact hash mismatch: $artifact_path"
            ALL_PASS=false
            MISSING_RECEIPTS+=("$receipt")
            continue
          fi
        fi
      done < <(jq -r '.artifacts[] | [.path, (.hash // "")] | @tsv' "$RECEIPT_PATH")
    fi
  fi

  log "[OK] $receipt"

done

if $ALL_PASS; then
  echo "" >&2
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
  echo "✅ ALL RECEIPTS VALID. SDLC loop complete!" >&2
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
  echo "" >&2
  echo "Ready to auto-commit changes." >&2
  echo "" >&2
  exit 0
fi

# Enhanced diagnostic output
echo "" >&2
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
echo "❌ CANNOT STOP - Missing or invalid receipts" >&2
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
echo "" >&2
echo "Required actions to complete:" >&2
echo "" >&2

for missing in "${MISSING_RECEIPTS[@]}"; do
  case "$missing" in
    interview.json)
      echo "  → Run /interview to gather requirements" >&2
      echo "     Creates: docs/specs/{feature}.md + interview.json" >&2
      echo "" >&2
      ;;
    discover.json)
      echo "  → Run /squad-discover to analyze codebase" >&2
      echo "     Uses: 5 parallel WarpGrep scouts" >&2
      echo "" >&2
      ;;
    plan.json)
      echo "  → Run /squad-collab for implementation planning" >&2
      echo "     Creates: plan.json with approach + dependencies" >&2
      echo "" >&2
      ;;
    build.json)
      echo "  → Run build skill based on scope:" >&2
      echo "     - /frontend-build for Vue features" >&2
      echo "     - /backend-build for API features" >&2
      echo "     - /fullstack-build for complete features" >&2
      echo "" >&2
      ;;
    backend.json)
      echo "  → Run backend tests:" >&2
      echo "     \$ cd services/backend && pnpm test" >&2
      echo "     If tests fail, ANALYZE and FIX before continuing" >&2
      echo "" >&2
      ;;
    e2e.json)
      echo "  → Run E2E tests with video recording:" >&2
      echo "     \$ cd apps/desktop/e2e-playwright" >&2
      echo "     \$ VIDEO=on npx playwright test" >&2
      echo "     If tests fail, ANALYZE Playwright output and FIX" >&2
      echo "" >&2
      ;;
    verify.json)
      echo "  → Run /verify for Electron MCP verification" >&2
      echo "     Includes human review of video recordings" >&2
      echo "" >&2
      ;;
  esac
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
echo "⚠️  DO NOT STOP until all receipts show ✅" >&2
echo "" >&2
echo "Progress saved to: $SESSION_DIR/" >&2
echo "" >&2
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
echo "ESCAPE HATCHES:" >&2
echo "  - Type 'EMERGENCY STOP' to abort immediately" >&2
echo "  - Output <bailout> tag 3 times for hard blockers" >&2
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2

# Exit 2 = block stop, force continuation
exit 2
