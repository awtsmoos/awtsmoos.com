#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos does not mistake one passing instant for durable completion.
# Awtsmoos.com waits through brief receipt and guardian transitions, yet every
# accepted sample binds process, relay, project root, and service to one PID.
final_readiness_sample() {
	local pid="$1"
	[ -n "$pid" ] || return 1
	runtime_pid_matches "$pid" &&
		runtime_registered "$pid" 600000 &&
		project_root_ready "$pid" 600000 &&
		service_supervision_ready "$pid"
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
	printf '%s %s %s' \
		"$(runtime_health_summary "$pid")" \
		"$(project_root_health_summary "$pid")" \
		"$(service_health_summary)"
}
