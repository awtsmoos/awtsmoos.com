#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos binds completion to the living tunnel and its guardian, while an
# optional workspace remains a diagnostic vessel. Awtsmoos.com never rolls back
# healthy release code because a user moved, renamed, or deleted project files.
final_readiness_sample() {
	local pid="$1"
	[ -n "$pid" ] || return 1
	runtime_pid_matches "$pid" &&
		runtime_registered "$pid" 600000 &&
		service_supervision_ready "$pid"
}

# A matching process and receipt are necessary but not sufficient for the
# same-release fast path. The local API probe crosses the real executor boundary,
# so a half-alive process with a stalled action loop is restarted instead of being
# mistaken for a healthy current installation.
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
				} catch {
					process.exit(1);
				}
			});
		' >/dev/null
}

verified_agent_pid() {
	local timeout_seconds="${AWTSMOOS_FINAL_READINESS_TIMEOUT_SECONDS:-20}"
	local maximum_samples=$(( timeout_seconds * 4 ))
	local sample=0
	local pid=""
	while [ "$sample" -lt "$maximum_samples" ]; do
		pid="$(cat "$ROOT/agent.pid" 2>/dev/null || true)"
		if final_readiness_sample "$pid"; then
			printf '%s\n' "$pid"
			return 0
		fi
		sleep 0.25
		sample=$(( sample + 1 ))
	done
	return 1
}

final_readiness_failure_detail() {
	local pid="$(cat "$ROOT/agent.pid" 2>/dev/null || true)"
	printf '%s %s workspace_optional=%s' \
		"$(runtime_health_summary "$pid")" \
		"$(service_health_summary)" \
		"$(project_root_health_summary "$pid")"
}
