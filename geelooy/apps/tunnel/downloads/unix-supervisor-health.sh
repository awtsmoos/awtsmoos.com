#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The supervisor accepts only a receipt for its exact child and tunnel name.
# The Awtsmoos renews connection truth; Awtsmoos.com grants reconnect grace
# without punishing an acknowledged tunnel merely because it is quietly idle.

supervisor_expected_tunnel() {
	node - "$ROOT/config.json" <<'NODE'
const fs = require("node:fs");
try {
	const config = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
	process.stdout.write(String(config.tunnelName || ""));
} catch {}
NODE
}

supervisor_receipt_matches() {
	local pid="$1"
	local max_age_ms="${2:-0}"
	node - "$ROOT/connection-state.json" "$pid" \
		"$(supervisor_expected_tunnel)" "$max_age_ms" <<'NODE'
const fs = require("node:fs");
const [file, pid, tunnelName, maxAgeText] = process.argv.slice(2);
try {
	const receipt = JSON.parse(fs.readFileSync(file, "utf8"));
	const timestamp = Date.parse(receipt.lastServerMessageAt || receipt.updatedAt || "");
	const maxAgeMs = Number(maxAgeText || 0);
	const fresh = !maxAgeMs || (
		Number.isFinite(timestamp) && Date.now() - timestamp <= maxAgeMs
	);
	const matches = receipt.state === "registered" &&
		Number(receipt.pid) === Number(pid) &&
		receipt.tunnelName === tunnelName &&
		fresh;
	process.exit(matches ? 0 : 1);
} catch {
	process.exit(1);
}
NODE
}

wait_child_registration() {
	local timeout_seconds="${AWTSMOOS_REGISTRATION_TIMEOUT_SECONDS:-45}"
	local elapsed=0
	while [ "$elapsed" -lt "$timeout_seconds" ]; do
		supervisor_alive "$CHILD_PID" || return 1
		if supervisor_receipt_matches "$CHILD_PID" 600000; then
			supervisor_log "registration_confirmed" "pid=$CHILD_PID"
			return 0
		fi
		[ -f "$STOP_FILE" ] && finish_supervisor
		sleep 1
		elapsed=$(( elapsed + 1 ))
	done
	supervisor_log "registration_timeout" \
		"pid=$CHILD_PID state=$(supervisor_receipt_state)"
	return 1
}

monitor_registered_child() {
	local grace_seconds="${AWTSMOOS_RECONNECT_GRACE_SECONDS:-120}"
	local disconnected_at=0
	while supervisor_alive "$CHILD_PID"; do
		[ -f "$STOP_FILE" ] && finish_supervisor
		if supervisor_receipt_matches "$CHILD_PID" 0; then
			disconnected_at=0
		else
			[ "$disconnected_at" -gt 0 ] || disconnected_at="$(date +%s)"
			if [ $(( $(date +%s) - disconnected_at )) -ge "$grace_seconds" ]; then
				supervisor_log "registration_lost" \
					"pid=$CHILD_PID graceSeconds=$grace_seconds state=$(supervisor_receipt_state)"
				return 2
			fi
		fi
		sleep 2
	done
	return 1
}

supervisor_receipt_state() {
	node - "$ROOT/connection-state.json" <<'NODE'
const fs = require("node:fs");
try {
	process.stdout.write(String(JSON.parse(fs.readFileSync(process.argv[2], "utf8")).state || "unknown"));
} catch {
	process.stdout.write("missing");
}
NODE
}
