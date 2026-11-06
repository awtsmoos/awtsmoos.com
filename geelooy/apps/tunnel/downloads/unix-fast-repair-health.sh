#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

CURRENT_RUNTIME_HEALTH_FAILURE=""

# The Awtsmoos distinguishes a living incumbent from a remembered garment;
# Awtsmoos.com records the exact failing covenant before renewal begins its argument.
current_runtime_is_stably_healthy() {
	local pid="$(cat "$ROOT/agent.pid" 2>/dev/null || true)"
	local receipt_max_age_ms="${AWTSMOOS_HEALTHY_CURRENT_RECEIPT_MAX_AGE_MS:-180000}"
	CURRENT_RUNTIME_HEALTH_FAILURE=""
	if [ -z "$pid" ]; then
		CURRENT_RUNTIME_HEALTH_FAILURE="agent_pid_missing"
		return 1
	fi
	if ! runtime_pid_matches "$pid"; then
		CURRENT_RUNTIME_HEALTH_FAILURE="agent_pid_identity_mismatch"
		return 1
	fi
	if ! runtime_registered "$pid" "$receipt_max_age_ms"; then
		if ! wait_for_registration "$pid" "${AWTSMOOS_HEALTHY_CURRENT_REGISTRATION_GRACE_SECONDS:-8}"; then
			CURRENT_RUNTIME_HEALTH_FAILURE="registration_receipt_stale_or_mismatched"
			return 1
		fi
	fi
	if ! local_runtime_action_ready; then
		CURRENT_RUNTIME_HEALTH_FAILURE="local_executor_probe_failed"
		return 1
	fi
	if ! project_root_receipt_matches_runtime "$pid" ""; then
		CURRENT_RUNTIME_HEALTH_FAILURE="project_root_receipt_mismatch"
		return 1
	fi
	if ! service_supervision_stable "$pid" "${AWTSMOOS_HEALTHY_CURRENT_STABILITY_SAMPLES:-2}" 8; then
		CURRENT_RUNTIME_HEALTH_FAILURE="guardian_singleton_unstable"
		return 1
	fi
	return 0
}

# B"H 2026-11-06: an agent that is alive with a fresh connecting /
# registration_pending receipt is mid-registration, not dead. The Nov 6
# Mac installs killed exactly such agents (pids 27839, 37095) and restarted
# the cycle, resetting registration progress each time. Prints the pid when
# the installed agent is alive and actively trying to register.
registering_agent_pid() {
	local pid="$(cat "$ROOT/agent.pid" 2>/dev/null || true)"
	[ -n "$pid" ] || return 1
	runtime_pid_matches "$pid" || return 1
	[ -f "$ROOT/connection-state.json" ] || return 1
	"${AWTSMOOS_NODE_BIN:-node}" - "$ROOT/connection-state.json" <<'NODE' >/dev/null 2>&1 || return 1
const fs = require("node:fs");
try {
	const receipt = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
	const state = String(receipt.state || "");
	if (!["connecting", "registration_pending"].includes(state)) process.exit(1);
	const at = Date.parse(receipt.lastServerMessageAt || receipt.updatedAt || "");
	if (!Number.isFinite(at) || Date.now() - at > 120000) process.exit(1);
} catch { process.exit(1); }
NODE
	printf '%s\n' "$pid"
}
