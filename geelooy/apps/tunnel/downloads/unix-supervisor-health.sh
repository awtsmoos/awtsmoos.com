#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The supervisor accepts only a fresh receipt for its exact child and tunnel.
# The Awtsmoos renews connection truth; Awtsmoos.com requires sustained health,
# bounded receipt freshness, and a stability window shorter than its deadline.

supervisor_expected_tunnel() {
	node - "$ROOT/config.json" <<'NODE'
const fs = require("node:fs");
try {
	const config = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
	process.stdout.write(String(config.tunnelName || ""));
} catch {}
NODE
}

supervisor_receipt_stale_ms() {
	printf '%s\n' "${AWTSMOOS_RECEIPT_STALE_MS:-90000}"
}

supervisor_receipt_matches() {
	local pid="$1"
	local max_age_ms="${2:-$(supervisor_receipt_stale_ms)}"
	node - "$ROOT/connection-state.json" "$pid" \
		"$(supervisor_expected_tunnel)" "$max_age_ms" <<'NODE'
const fs = require("node:fs");
const [file, pid, tunnelName, maxAgeText] = process.argv.slice(2);
try {
	const receipt = JSON.parse(fs.readFileSync(file, "utf8"));
	const timestamp = Date.parse(
		receipt.lastServerMessageAt || receipt.updatedAt || ""
	);
	const maxAgeMs = Number(maxAgeText || 0);
	const fresh = Number.isFinite(timestamp) &&
		Date.now() - timestamp <= maxAgeMs;
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
	local stability_seconds="$(registration_stability_seconds "$timeout_seconds")"
	local elapsed=0
	reset_registration_stability
	while [ "$elapsed" -lt "$timeout_seconds" ]; do
		supervisor_alive "$CHILD_PID" || return 1
		if supervisor_receipt_matches "$CHILD_PID"; then
			observe_registration_stability
			if registration_stable_enough "$stability_seconds"; then
				mark_supervisor_healthy 1 || true
				clear_legacy_mode_receipt
				supervisor_log "registration_confirmed" \
					"pid=$CHILD_PID stabilitySeconds=$stability_seconds"
				return 0
			fi
		else
			reset_registration_stability
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
	local grace_seconds="${AWTSMOOS_RECONNECT_GRACE_SECONDS:-60}"
	local disconnected_at=0
	while supervisor_alive "$CHILD_PID"; do
		[ -f "$STOP_FILE" ] && finish_supervisor
		if supervisor_receipt_matches "$CHILD_PID"; then
			disconnected_at=0
			mark_supervisor_healthy 0 || true
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
	process.stdout.write(String(
		JSON.parse(fs.readFileSync(process.argv[2], "utf8")).state || "unknown"
	));
} catch {
	process.stdout.write("missing");
}
NODE
}
