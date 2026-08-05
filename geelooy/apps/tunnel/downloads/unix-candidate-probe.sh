#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

CANDIDATE_PROBE_PID="${CANDIDATE_PROBE_PID:-}"
CANDIDATE_PROBE_PORT="${CANDIDATE_PROBE_PORT:-}"

# The Awtsmoos lets staged code prove registration before predecessor bytes move.
candidate_tunnel_name() {
	node - "$CANDIDATE_ROOT/config.json" <<'NODE'
const fs = require("node:fs");
try {
	const value = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
	process.stdout.write(String(value.tunnelName || ""));
} catch {
	process.exit(1);
}
NODE
}

start_candidate_probe() {
	local receipt="$CANDIDATE_ROOT/connection-receipt.json"
	local pid_file="$CANDIDATE_ROOT/candidate-probe.pid"
	local log_file="$CANDIDATE_ROOT/candidate-probe.log"
	CANDIDATE_PROBE_PORT="${AWTSMOOS_CANDIDATE_LOCAL_API_PORT:-$((47000 + $$ % 1000))}"
	rm -f "$receipt" "$pid_file"
	write_activation_journal "candidate_probe_starting" "$CANDIDATE_ROOT" "$ROOT"
	(
		export AWTSMOOS_INSTALL_ROOT="$CANDIDATE_ROOT"
		export AWTSMOOS_RECOVERY_ROOT="$RECOVERY_ROOT"
		export AWTSMOOS_ACTIVATION_ID CANDIDATE_VERSION
		export AWTSMOOS_RUNTIME_VERSION="$CANDIDATE_VERSION"
		export AWTSMOOS_LOCAL_API=1
		export AWTSMOOS_LOCAL_API_HOST=127.0.0.1
		export AWTSMOOS_LOCAL_API_PORT="$CANDIDATE_PROBE_PORT"
		export AWTSMOOS_DISABLE_SELF_UPDATE=1
		exec "$AWTSMOOS_NODE_BIN" \
			"$CANDIDATE_ROOT/awtsmoos-agent-launcher.cjs" "$CANDIDATE_ROOT"
	) >> "$log_file" 2>&1 &
	CANDIDATE_PROBE_PID=$!
	printf '%s\n' "$CANDIDATE_PROBE_PID" > "$pid_file"
	install_event "candidate-probe" "started" \
		"Staged runtime started with an isolated activation-only local API." \
		"pid=$CANDIDATE_PROBE_PID port=$CANDIDATE_PROBE_PORT"
}

candidate_probe_alive() {
	[ -n "$CANDIDATE_PROBE_PID" ] || return 1
	kill -0 "$CANDIDATE_PROBE_PID" 2>/dev/null || return 1
	ps -p "$CANDIDATE_PROBE_PID" -o command= 2>/dev/null |
		grep -F -- "$CANDIDATE_ROOT/awtsmoos-agent-launcher.cjs" >/dev/null
}

candidate_probe_registered() {
	local tunnel_name="$(candidate_tunnel_name)"
	"$AWTSMOOS_NODE_BIN" "$CANDIDATE_ROOT/scripts/connection-status.cjs" check \
		"$CANDIDATE_ROOT" "$CANDIDATE_PROBE_PID" "$tunnel_name" 30000 \
		"$AWTSMOOS_ACTIVATION_ID" "$CANDIDATE_VERSION" >/dev/null 2>&1
}

candidate_probe_action_ready() {
	curl -fsS --connect-timeout 1 --max-time 4 \
		-H 'content-type: application/json' \
		--data '{"action":"stat","p":"."}' \
		"http://127.0.0.1:${CANDIDATE_PROBE_PORT}/fs" |
		node -e '
			let value="";
			process.stdin.on("data", chunk => value += chunk);
			process.stdin.on("end", () => {
				try {
					const result=JSON.parse(value);
					process.exit(result.ok === true ? 0 : 1);
				} catch { process.exit(1); }
			});
		' >/dev/null
}

wait_for_candidate_probe() {
	local timeout="${AWTSMOOS_CANDIDATE_PROBE_TIMEOUT_SECONDS:-90}"
	local required="${AWTSMOOS_CANDIDATE_PROBE_STABLE_SAMPLES:-4}"
	local sample=0
	local stable=0
	while [ "$sample" -lt $((timeout * 2)) ]; do
		candidate_probe_alive || return 1
		if candidate_probe_registered && candidate_probe_action_ready; then
			stable=$((stable + 1))
			[ "$stable" -ge "$required" ] && return 0
		else
			stable=0
		fi
		sleep 0.5
		sample=$((sample + 1))
	done
	return 1
}

stop_candidate_probe() {
	candidate_probe_alive || return 0
	kill -TERM "$CANDIDATE_PROBE_PID" 2>/dev/null || true
	for _ in 1 2 3 4 5 6 7 8 9 10; do
		kill -0 "$CANDIDATE_PROBE_PID" 2>/dev/null || break
		sleep 0.2
	done
	kill -KILL "$CANDIDATE_PROBE_PID" 2>/dev/null || true
	CANDIDATE_PROBE_PID=""
}
