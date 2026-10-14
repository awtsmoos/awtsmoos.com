#!/usr/bin/env bash
# B"H — CSS deploy gate (Yaakov 2026-10-14)
#
# Runs the IDENTICAL CSS validator before every deploy. Refuses the deploy
# only if it would ADD validator errors above the committed baseline.
# Warnings are reported separately and NEVER block.
# This gate never changes page styling on its own — it only blocks and reports.
#
# Usage: css-deploy-gate.sh [--json]
#   Exit 0: deploy may proceed.  Exit 1: deploy refused (errors added).
#   On infrastructure failure (validator crash, missing files) it FAILS OPEN
#   with a loud warning — a broken gate must never block all deploys.

set -uo pipefail

REPO="$(cd "$(dirname "$0")/../.." && pwd)"
VALIDATOR="$HOME/workspace/site-audit/css-validator.py"
BASELINE_FILE="$REPO/scripts/production/css-gate-baseline.json"
STATE_DIR="$HOME/workspace/.jarvis/css-deploy-gate"
STATE_FILE="$STATE_DIR/state.json"
OUT="$(mktemp)"
trap 'rm -f "$OUT"' EXIT

warn() { echo "B\"H CSS_GATE_WARN $1" >&2; }

mkdir -p "$STATE_DIR"

# ---- Run the validator (identical tool, identical checks, every run) ----
if [ ! -f "$VALIDATOR" ]; then
	warn "validator missing at $VALIDATOR — failing open"
	exit 0
fi
if ! python3 "$VALIDATOR" "$REPO/geelooy/" >"$OUT" 2>&1; then
	validator_failed=1
else
	validator_failed=0
fi

# Parse counts from the report. Expected lines:
#   Errors: 141 | Warnings: 10273
#   ## TYPE (count)
err_line="$(grep -E '^Errors: [0-9]+ \| Warnings: [0-9]+' "$OUT" | head -1 || true)"
if [ -z "$err_line" ]; then
	warn "validator output unparseable — failing open"
	exit 0
fi
errors="$(echo "$err_line" | sed -E 's/^Errors: ([0-9]+).*/\1/')"
warnings="$(echo "$err_line" | sed -E 's/.*Warnings: ([0-9]+).*/\1/')"

# Normalize absolute repo paths to repo-relative for readable output
sed -i "s|$REPO/||g" "$OUT"

# Per-type counts for the breakdown (errors only for the block verdict;
# warnings tracked separately and never block)
ERROR_TYPES="CONTRAST_RISK HARDCODED_LIGHT_TEXT HIDDEN_SPECIFICITY_WAR MISSING_EXPLICIT_COLOR NO_IMPORTANT OUTLINE_NONE UNDEFINED_CSS_VAR GRADIENT_TEXT_RISK DEAD_SELECTOR"
by_type="$(grep -E '^## [A-Z_]+ \([0-9]+\)' "$OUT" | sed -E 's/^## ([A-Z_]+) \(([0-9]+)\)/\1=\2/' | tr '\n' ' ')"
by_type_errors="$(echo "$by_type" | tr ' ' '\n' | grep -v '^$' | while IFS='=' read -r t c; do
	case " $ERROR_TYPES " in *" $t "*) echo "$t=$c";; esac; done | tr '\n' ' ')"
by_type_warnings="$(echo "$by_type" | tr ' ' '\n' | grep -v '^$' | while IFS='=' read -r t c; do
	case " $ERROR_TYPES " in *" $t "*) ;; *) echo "$t=$c";; esac; done | tr '\n' ' ')"

# ---- Baseline ----
baseline_errors=0
if [ -f "$BASELINE_FILE" ]; then
	baseline_errors="$(python3 -c "import json;print(json.load(open('$BASELINE_FILE')).get('errors',0))" 2>/dev/null || echo 0)"
fi

# ---- Consecutive-block state ----
blocks=0
if [ -f "$STATE_FILE" ]; then
	blocks="$(python3 -c "import json;print(json.load(open('$STATE_FILE')).get('consecutive_blocks',0))" 2>/dev/null || echo 0)"
fi
save_state() {
	python3 - "$STATE_FILE" "$1" "$2" <<'EOF'
import json, sys
p, blocks, errs = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
try:
    d = json.load(open(p))
except Exception:
    d = {}
d['consecutive_blocks'] = blocks
d['last_errors'] = errs
json.dump(d, open(p, 'w'), indent=1)
EOF
}

# ---- Verdict ----
if [ "$errors" -le "$baseline_errors" ]; then
	save_state 0 "$errors"
	echo "B\"H CSS_GATE_PASS errors=$errors baseline=$baseline_errors warnings=$warnings"
	if [ "${1:-}" = "--json" ]; then python3 -c "
import json; print(json.dumps({'pass': True, 'errors': $errors, 'baseline': $baseline_errors, 'warnings': $warnings, 'by_type': '$by_type'.split()}))"; fi
	exit 0
fi

# BLOCKED: errors added above baseline
blocks=$((blocks + 1))
save_state "$blocks" "$errors"

echo "B\"H CSS_GATE_BLOCKED errors=$errors baseline=$baseline_errors added=$((errors - baseline_errors)) attempt=$blocks" >&2
echo "--- Files with errors (first 30) ---" >&2
grep -E '^  geelooy/' "$OUT" | head -30 >&2
echo "--- Per-check breakdown (errors) ---" >&2
echo "$by_type_errors" | tr ' ' '\n' | grep -v '^$' >&2
echo "--- Warnings (informational, never block) ---" >&2
echo "$by_type_warnings" | tr ' ' '\n' | grep -v '^$' >&2

if [ "$blocks" -ge 3 ]; then
	echo "--- FULL per-check detail (3rd consecutive block — handing back) ---" >&2
	grep -E '^## [A-Z_]+ \([0-9]+\)' "$OUT" >&2
	awk '/^## /{t=$0} /^  geelooy\//{print t " :: " $0}' "$OUT" | head -100 >&2
	# Reset so the next attempt starts a fresh 3-count
	save_state 0 "$errors"
fi

exit 1
