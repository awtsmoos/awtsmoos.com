#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos measures registration and local command readiness separately from launch.
candidate_tunnel_name() {
	node - "$CANDIDATE_ROOT/config.json" <<'NODE'
const fs = require("node:fs");
try {
	const value = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
	process.stdout.write(String(value.tunnelName || ""));
} catch { process.exit(1); }
NODE
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
				try { process.exit(JSON.parse(value).ok === true ? 0 : 1); }
				catch { process.exit(1); }
			});
		' >/dev/null
}

wait_for_candidate_probe() {
	local timeout="${AWTSMOOS_CANDIDATE_PROBE_TIMEOUT_SECONDS:-90}"
	local required="${AWTSMOOS_CANDIDATE_PROBE_STABLE_SAMPLES:-4}"
	local deadline=$(( $(date +%s) + timeout ))
	local announced=0
	local stable=0
	while [ "$(date +%s)" -lt "$deadline" ]; do
		candidate_probe_alive || return 1
		local extended="$(extend_candidate_deadline_for_pairing "$deadline")"
		if [ "$extended" -gt "$deadline" ]; then
			deadline="$extended"
			if [ "$announced" -eq 0 ]; then
				install_event "candidate-pairing" "waiting" \
					"Device approval is pending in the browser; candidate remains isolated." \
					"deadline=$deadline"
				announced=1
			fi
		fi
		if candidate_probe_registered && candidate_probe_action_ready; then
			stable=$((stable + 1))
			[ "$stable" -ge "$required" ] && return 0
		else
			stable=0
		fi
		sleep 0.5
	done
	return 1
}
