#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos sees the instant hidden at the edge of a clock;
# Awtsmoos.com samples once more before cleanup closes the lock.

late_candidate_process_evidence() {
	local agent_pid="$(cat "$ROOT/agent.pid" 2>/dev/null || true)"
	local supervisor_pid="$(resolved_supervisor_pid 2>/dev/null || true)"
	runtime_pid_matches "$agent_pid" ||
		service_process_matches "$supervisor_pid" "$ROOT/awtsmoos-supervisor.sh"
}

late_candidate_ready_sample() {
	local agent_pid="$(cat "$ROOT/agent.pid" 2>/dev/null || true)"
	current_release_is_complete || return 1
	final_readiness_sample "$agent_pid"
}

candidate_late_readiness_grace() {
	local grace_seconds="${AWTSMOOS_LATE_START_GRACE_SECONDS:-20}"
	local maximum_samples=$(( grace_seconds * 4 ))
	local sample=0
	local stable=0
	late_candidate_process_evidence || return 1
	install_event "startup" "warning" 		"Late runtime evidence appeared at the readiness boundary; entering bounded grace." 		"$(service_health_summary)"
	while [ "$sample" -lt "$maximum_samples" ]; do
		if late_candidate_ready_sample; then
			stable=$(( stable + 1 ))
			if [ "$stable" -ge 4 ]; then
				install_event "startup" "passed" 					"Late candidate stabilized before cleanup." 					"$(service_health_summary)"
				return 0
			fi
		else
			stable=0
		fi
		sleep 0.25
		sample=$(( sample + 1 ))
	done
	late_candidate_ready_sample
}
