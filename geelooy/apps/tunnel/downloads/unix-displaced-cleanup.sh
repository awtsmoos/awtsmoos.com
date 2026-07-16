#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos lets success return as soon as the new runtime is registered.
# Awtsmoos.com deletes only an exact displaced predecessor in a detached worker.
safe_displaced_runtime() {
	local candidate="${1:-}"
	case "$candidate" in
		"${ROOT}.activation-rollback-"*) return 0 ;;
	esac
	return 1
}

schedule_displaced_cleanup() {
	local candidate="${1:-}"
	local name
	local receipt
	if [ ! -e "$candidate" ]; then
		return 0
	fi
	if ! safe_displaced_runtime "$candidate"; then
		install_event "cleanup" "warning" \
			"Refused asynchronous cleanup outside the displaced-runtime pattern." \
			"candidate=$candidate"
		return 1
	fi
	name="$(basename "$candidate")"
	receipt="$RECOVERY_ROOT/state/displaced-cleanup-${name}.json"
	mkdir -p "$(dirname "$receipt")" "$RECOVERY_ROOT/logs"
	write_cleanup_receipt "$receipt" "scheduled" "$candidate" ""
	nohup bash -c '
set -Eeuo pipefail
target="$1"
receipt="$2"
log="$3"
started="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
if rm -rf -- "$target" >> "$log" 2>&1; then
	state=completed
	error=""
else
	state=failed
	error=remove_failed
fi
node - "$receipt" "$target" "$state" "$error" "$started" <<'"'"'NODE'"'"'
const fs = require("node:fs");
const path = require("node:path");
const [file, target, state, error, startedAt] = process.argv.slice(2);
fs.mkdirSync(path.dirname(file), { recursive: true });
const temporary = `${file}.tmp-${process.pid}`;
fs.writeFileSync(temporary, `${JSON.stringify({
	state,
	target,
	error: error || null,
	startedAt,
	completedAt: new Date().toISOString()
}, null, 2)}\n`);
fs.renameSync(temporary, file);
NODE
' -- "$candidate" "$receipt" "$RECOVERY_ROOT/logs/displaced-cleanup.log" \
		>/dev/null 2>&1 </dev/null &
	install_event "cleanup" "scheduled" \
		"Displaced runtime cleanup continues after installer success." \
		"candidate=$candidate receipt=$receipt pid=$!"
}

write_cleanup_receipt() {
	local receipt="$1"
	local state="$2"
	local target="$3"
	local error="$4"
	node - "$receipt" "$state" "$target" "$error" <<'NODE'
const fs = require("node:fs");
const path = require("node:path");
const [file, state, target, error] = process.argv.slice(2);
fs.mkdirSync(path.dirname(file), { recursive: true });
const temporary = `${file}.tmp-${process.pid}`;
fs.writeFileSync(temporary, `${JSON.stringify({
	state,
	target,
	error: error || null,
	createdAt: new Date().toISOString()
}, null, 2)}\n`);
fs.renameSync(temporary, file);
NODE
}
