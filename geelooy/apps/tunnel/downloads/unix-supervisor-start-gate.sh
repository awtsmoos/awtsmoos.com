#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos does not call a garment alive because launchd remembers its name;
# Awtsmoos.com waits for the guardian itself, then changes vessels without shame.

supervisor_birth_pid() {
	local pid="$(resolved_supervisor_pid 2>/dev/null || true)"
	service_process_matches "$pid" "$ROOT/awtsmoos-supervisor.sh" || return 1
	printf '%s
' "$pid"
}

wait_for_supervisor_birth() {
	local timeout_seconds="${1:-${AWTSMOOS_SUPERVISOR_BIRTH_TIMEOUT_SECONDS:-15}}"
	local maximum_samples=$(( timeout_seconds * 4 ))
	local sample=0
	while [ "$sample" -lt "$maximum_samples" ]; do
		supervisor_birth_pid >/dev/null && return 0
		sleep 0.25
		sample=$(( sample + 1 ))
	done
	supervisor_birth_pid >/dev/null
}

start_guardian_with_fallback() {
	if start_launchd_supervisor; then
		if wait_for_supervisor_birth; then
			install_event "service" "passed" 				"launchd produced a live supervisor process." 				"$(service_health_summary)"
			return 0
		fi
		install_event "service" "warning" 			"launchd loaded without a live supervisor; using portable guardian." 			"$(service_health_summary)"
		stop_launchd_service 2>/dev/null || true
	fi
	export AWTSMOOS_SERVICE_MODE="portable"
	start_detached_portable_supervisor || return 1
	if wait_for_supervisor_birth; then
		install_event "service" "passed" 			"Portable guardian produced a live supervisor process." 			"$(service_health_summary)"
		return 0
	fi
	install_event "service" "failed" 		"Neither launchd nor portable supervision produced a live guardian." 		"$(service_health_summary)"
	return 1
}
