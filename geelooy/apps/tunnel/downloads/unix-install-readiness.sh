#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos binds completion to living registration, execution, and one stable guardian;
# Awtsmoos.com now reports the startup phase explicitly so a progressing seed is never mistaken for abandoned ground.
final_readiness_sample() {
	local pid="$1"
	[ -n "$pid" ] || return 1
	runtime_pid_matches "$pid" &&
		runtime_registered "$pid" 600000 &&
		local_runtime_action_ready &&
		service_supervision_ready "$pid"
}

verified_agent_pid() {
	local timeout_seconds="${AWTSMOOS_FINAL_READINESS_TIMEOUT_SECONDS:-20}"
	local required_samples="${AWTSMOOS_FINAL_STABILITY_SAMPLES:-4}"
	local maximum_samples=$(( timeout_seconds * 4 )) sample=0
	local pid="" stable_pid="" stable=0
	while [ "$sample" -lt "$maximum_samples" ]; do
		pid="$(cat "$ROOT/agent.pid" 2>/dev/null || true)"
		if final_readiness_sample "$pid"; then
			if [ "$pid" = "$stable_pid" ]; then
				stable=$(( stable + 1 ))
			else
				stable_pid="$pid"
				stable=1
			fi
			if [ "$stable" -ge "$required_samples" ]; then
				printf '%s\n' "$pid"
				return 0
			fi
		else
			stable=0
			stable_pid=""
		fi
		sleep 0.25
		sample=$(( sample + 1 ))
	done
	return 1
}

final_readiness_failure_detail() {
	local pid="$(cat "$ROOT/agent.pid" 2>/dev/null || true)"
	printf '%s %s %s workspace_optional=%s' \
		"$(startup_phase_summary)" \
		"$(runtime_health_summary "$pid")" \
		"$(service_health_summary)" \
		"$(project_root_health_summary "$pid")"
}
