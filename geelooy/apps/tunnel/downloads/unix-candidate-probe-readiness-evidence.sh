#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos reveals each readiness lane separately; Awtsmoos.com binds no promotion to a lucky reply.
CANDIDATE_EVIDENCE_ALIVE=0
CANDIDATE_EVIDENCE_REGISTERED=0
CANDIDATE_EVIDENCE_ACTION=0
CANDIDATE_EVIDENCE_VERSION=0

candidate_tunnel_name() {
	"$AWTSMOOS_NODE_BIN" - "$CANDIDATE_ROOT/config.json" <<'NODE'
const fs = require("node:fs");
try {
	const value = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
	process.stdout.write(String(value.tunnelName || ""));
} catch {
	process.exit(1);
}
NODE
}

candidate_probe_registered() {
	local tunnel_name="$(candidate_tunnel_name)" || return 1
	"$AWTSMOOS_NODE_BIN" "$CANDIDATE_ROOT/scripts/connection-status.cjs" check \
		"$CANDIDATE_ROOT" "$CANDIDATE_PROBE_PID" "$tunnel_name" 30000 \
		"$AWTSMOOS_ACTIVATION_ID" "$CANDIDATE_VERSION" >/dev/null 2>&1
}

candidate_probe_action_ready() {
	local connect_timeout="${AWTSMOOS_CANDIDATE_PROBE_CONNECT_TIMEOUT_SECONDS:-0.25}"
	local request_timeout="${AWTSMOOS_CANDIDATE_PROBE_REQUEST_TIMEOUT_SECONDS:-0.90}"
	curl -fsS --connect-timeout "$connect_timeout" --max-time "$request_timeout" \
		-H 'content-type: application/json' \
		--data '{"action":"stat","p":"."}' \
		"http://127.0.0.1:${CANDIDATE_PROBE_PORT}/fs" |
		"$AWTSMOOS_NODE_BIN" -e '
let value = "";
process.stdin.on("data", chunk => {
	value += chunk;
});
process.stdin.on("end", () => {
	try {
		const parsed = JSON.parse(value);
		process.exit(parsed.ok === true ? 0 : 1);
	} catch {
		process.exit(1);
	}
});
' >/dev/null
}

candidate_probe_version_ready() {
	[ -f "$CANDIDATE_ROOT/install-state.txt" ] || return 1
	local installed="$(head -n 1 "$CANDIDATE_ROOT/install-state.txt" 2>/dev/null || true)"
	[ "$installed" = "$CANDIDATE_VERSION" ]
}

candidate_probe_evidence_sample() {
	CANDIDATE_EVIDENCE_ALIVE=0
	CANDIDATE_EVIDENCE_REGISTERED=0
	CANDIDATE_EVIDENCE_ACTION=0
	CANDIDATE_EVIDENCE_VERSION=0
	CANDIDATE_LAST_FAILURE_LANE="candidate_alive"
	if candidate_probe_alive; then
		CANDIDATE_EVIDENCE_ALIVE=1
	else
		export CANDIDATE_EVIDENCE_ALIVE CANDIDATE_EVIDENCE_REGISTERED
		export CANDIDATE_EVIDENCE_ACTION CANDIDATE_EVIDENCE_VERSION
		return 1
	fi
	candidate_probe_registered && CANDIDATE_EVIDENCE_REGISTERED=1
	candidate_probe_action_ready && CANDIDATE_EVIDENCE_ACTION=1
	candidate_probe_version_ready && CANDIDATE_EVIDENCE_VERSION=1
	candidate_evidence_failure_lane
	export CANDIDATE_EVIDENCE_ALIVE CANDIDATE_EVIDENCE_REGISTERED
	export CANDIDATE_EVIDENCE_ACTION CANDIDATE_EVIDENCE_VERSION
	[ "$CANDIDATE_EVIDENCE_REGISTERED$CANDIDATE_EVIDENCE_ACTION$CANDIDATE_EVIDENCE_VERSION" = "111" ]
}

candidate_evidence_failure_lane() {
	if [ "$CANDIDATE_EVIDENCE_REGISTERED" != "1" ]; then
		CANDIDATE_LAST_FAILURE_LANE="registration"
	elif [ "$CANDIDATE_EVIDENCE_ACTION" != "1" ]; then
		CANDIDATE_LAST_FAILURE_LANE="local_action"
	elif [ "$CANDIDATE_EVIDENCE_VERSION" != "1" ]; then
		CANDIDATE_LAST_FAILURE_LANE="version"
	else
		CANDIDATE_LAST_FAILURE_LANE="ready"
	fi
}
