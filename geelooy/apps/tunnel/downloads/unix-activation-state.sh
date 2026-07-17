#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

AWTSMOOS_ACTIVATION_ID="${AWTSMOOS_ACTIVATION_ID:-activation-$(date -u +%Y%m%dT%H%M%SZ)-$$}"
export AWTSMOOS_ACTIVATION_ID

# The Awtsmoos renews package, identity, workspace, and guardian truth atomically.
# Awtsmoos.com gives every activation one stable ID and waits for the candidate's
# exact root receipt before deciding that registration is durable enough to commit.

skip_start_requested() {
	[ "${AWTSMOOS_SKIP_START:-}" = "1" ] ||
		[ "${AWTSMOOS_SKIP_START:-}" = "true" ]
}

write_activation_journal() {
	local phase="$1"
	local candidate="$2"
	local rollback="${3:-}"
	local journal="$RECOVERY_ROOT/transactions/install-current.json"
	mkdir -p "$(dirname "$journal")"
	node - "$journal" "$phase" "$candidate" "$rollback" \
		"$CANDIDATE_VERSION" "$AWTSMOOS_ACTIVATION_ID" <<'NODE'
const fs = require("node:fs");
const path = require("node:path");
const [file, phase, candidate, rollback, version, activationId] = process.argv.slice(2);
const temporary = `${file}.${process.pid}.${Date.now()}.tmp`;
const value = {
	schemaVersion: 2,
	activationId,
	at: new Date().toISOString(),
	phase,
	candidate,
	rollback,
	version
};
let descriptor;
try {
	descriptor = fs.openSync(temporary, "wx", 0o600);
	fs.writeFileSync(descriptor, `${JSON.stringify(value, null, 2)}\n`);
	fs.fsyncSync(descriptor);
} finally {
	if (descriptor !== undefined) fs.closeSync(descriptor);
}
fs.renameSync(temporary, file);
try {
	const directory = fs.openSync(path.dirname(file), "r");
	try { fs.fsyncSync(directory); } finally { fs.closeSync(directory); }
} catch {}
NODE
}

current_release_is_complete() {
	[ -f "$ROOT/main.js" ] || return 1
	[ "$(cat "$ROOT/install-state.txt" 2>/dev/null || true)" = "$CANDIDATE_VERSION" ] || return 1
	[ "$(cat "$ROOT/install-manifest.sha256" 2>/dev/null | awk '{print $1}')" = "$MANIFEST_SHA" ] || return 1
	runtime_probe_compatible "$ROOT"
}

candidate_is_stably_active() {
	current_release_is_complete || return 1
	local startup_timeout="${AWTSMOOS_STARTUP_TIMEOUT_SECONDS:-45}"
	local root_timeout="${AWTSMOOS_PROJECT_ROOT_TIMEOUT_SECONDS:-30}"
	local agent_pid=""
	if [ ! -f "$ROOT/device-binding.json" ] &&
		[ -z "${AWTSMOOS_STARTUP_TIMEOUT_SECONDS:-}" ]; then
		startup_timeout=600
	fi
	wait_for_runtime "$startup_timeout" || return 1
	agent_pid="$(cat "$ROOT/agent.pid" 2>/dev/null || true)"
	if ! wait_for_project_root_readiness "$agent_pid" "$root_timeout" 600000; then
		install_event "startup" "failed" \
			"Agent registered but could not prove project-root readiness." \
			"pid=${agent_pid:-missing} $(project_root_health_summary)"
		return 1
	fi
	if ! wait_for_service_supervision 30; then
		install_event "startup" "failed" \
			"Agent was temporary; durable supervisor ownership was not proven." \
			"$(service_health_summary)"
		return 1
	fi
	if ! current_release_is_complete; then
		install_event "startup" "failed" \
			"Runtime identity changed while waiting for candidate readiness." \
			"expectedVersion=$CANDIDATE_VERSION actualVersion=$(cat "$ROOT/install-state.txt" 2>/dev/null || printf missing)"
		return 1
	fi
	install_event "startup" "passed" \
		"Candidate sustained registration, root, and guardian readiness." \
		"pid=$agent_pid $(project_root_health_summary) $(service_health_summary)"
	return 0
}

prepare_without_activation() {
	local prepared="${ROOT}.prepared-${CANDIDATE_VERSION}-$(date -u +%Y%m%dT%H%M%SZ)"
	mv "$CANDIDATE_ROOT" "$prepared"
	write_activation_journal "prepared_not_activated" "$prepared" ""
	install_event "activate" "prepared" \
		"Verified update preserved without stopping the active tunnel." "$prepared"
}
