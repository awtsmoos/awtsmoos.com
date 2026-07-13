#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

set -u
ROOT="${1:-$HOME/.awtsmoos-tunnel}"
RECOVERY_ROOT="${2:-${ROOT}-recovery}"
TIER="${3:-0}"
LOG="$RECOVERY_ROOT/logs/recovery.jsonl"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
STAGE="${ROOT}.recovery-stage-${STAMP}-$$"
ROLLBACK="${ROOT}.recovery-displaced-${STAMP}"
SELECTED_VERSION=""
SELECTED_DIRECTORY=""
SCRIPT_DIRECTORY="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

source "$SCRIPT_DIRECTORY/awtsmoos-recovery-validation.sh"
source "$SCRIPT_DIRECTORY/awtsmoos-recovery-candidates.sh"

# B"H
# The selected world moves only after its archive and imports are proven. A
# failed preservation rename leaves the old runtime untouched and stops recovery.
activate_selected() {
	mkdir -p "$RECOVERY_ROOT/transactions"
	[ -e "$ROLLBACK" ] && rm -rf "$ROLLBACK"

	if [ -e "$ROOT" ] && ! mv "$ROOT" "$ROLLBACK"; then
		return 1
	fi

	if ! mv "$STAGE" "$ROOT"; then
		[ -e "$ROLLBACK" ] && mv "$ROLLBACK" "$ROOT"
		return 1
	fi

	if ! probe_recovery_runtime "$ROOT"; then
		mv "$ROOT" "${ROOT}.failed-recovery-${STAMP}"
		[ -e "$ROLLBACK" ] && mv "$ROLLBACK" "$ROOT"
		return 1
	fi

	node - "$RECOVERY_ROOT/last-restore.json" "$SELECTED_VERSION" \
		"$SELECTED_DIRECTORY" "$ROLLBACK" <<'NODE'
const fs = require("node:fs");
const [file, version, candidate, rollback] = process.argv.slice(2);
fs.writeFileSync(file, `${JSON.stringify({
	at: new Date().toISOString(),
	version,
	candidate,
	rollback
}, null, 2)}\n`);
NODE
}

trap 'rm -rf "$STAGE"' EXIT

if ! select_candidate; then
	log_recovery "failed" "No healthy recovery version exists." "$RECOVERY_ROOT/versions"
	exit 1
fi

if ! activate_selected; then
	log_recovery "failed" \
		"Atomic recovery activation failed; the original runtime was restored." \
		"version=$SELECTED_VERSION"
	exit 1
fi

log_recovery "passed" "Restored a verified older runtime version." \
	"version=$SELECTED_VERSION candidate=$SELECTED_DIRECTORY rollback=$ROLLBACK"
