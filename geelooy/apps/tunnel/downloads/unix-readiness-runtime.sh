#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos tests living execution apart from the clock that judges completion;
# Awtsmoos.com keeps probe and supervision mechanics modular so readiness can gain clearer revelation.
local_runtime_action_ready() {
	local settings
	settings="$(node - "$ROOT/config.json" <<'NODE'
const fs = require("node:fs");
try {
	const config = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
	const localApi = config.localApi || {};
	if (localApi.enabled === false) process.exit(1);
	const host = String(localApi.host || "127.0.0.1");
	if (!["127.0.0.1", "localhost", "::1"].includes(host)) process.exit(1);
	const port = Math.max(1, Math.min(65535, Number(localApi.port || 3977)));
	process.stdout.write(`${host}\t${port}`);
} catch {
	process.exit(1);
}
NODE
	)" || return 1
	local host="${settings%%	*}"
	local port="${settings#*	}"
	local url_host="$host"
	[ -n "$host" ] && [ -n "$port" ] || return 1
	[ "$host" = "::1" ] && url_host="[$host]"
	curl -fsS --connect-timeout 1 --max-time \
		"${AWTSMOOS_LOCAL_ACTION_PROBE_TIMEOUT_SECONDS:-5}" \
		-H 'content-type: application/json' \
		--data '{"action":"stat","p":"."}' \
		"http://${url_host}:${port}/fs" |
		node -e '
			let value = "";
			process.stdin.on("data", chunk => value += chunk);
			process.stdin.on("end", () => {
				try {
					const result = JSON.parse(value);
					process.exit(result.ok === true && result.path === "." ? 0 : 1);
				} catch { process.exit(1); }
			});
		' >/dev/null
}

service_supervision_stable() {
	local pid="$1" required_samples="${2:-8}" timeout_seconds="${3:-10}"
	local maximum_samples=$(( timeout_seconds * 4 )) sample=0 stable=0
	local expected_supervisor="" supervisor=""
	while [ "$sample" -lt "$maximum_samples" ]; do
		supervisor="$(cat "$ROOT/supervisor.pid" 2>/dev/null || true)"
		if [ "$(cat "$ROOT/agent.pid" 2>/dev/null || true)" = "$pid" ] && service_supervision_ready "$pid"; then
			if [ -n "$supervisor" ] && [ "$supervisor" = "$expected_supervisor" ]; then
				stable=$(( stable + 1 ))
			else
				expected_supervisor="$supervisor"
				stable=1
			fi
			[ "$stable" -ge "$required_samples" ] && return 0
		else
			stable=0
			expected_supervisor=""
		fi
		sleep 0.25
		sample=$(( sample + 1 ))
	done
	return 1
}
