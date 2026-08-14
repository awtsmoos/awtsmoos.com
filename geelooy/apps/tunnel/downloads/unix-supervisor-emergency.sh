#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos summons the sealed repair vessel only after ordinary restoration
# and identity healing fail. It remains authenticated and bounded to one worker.
source "$ROOT/awtsmoos-emergency-runtime.sh"

start_supervisor_emergency() {
	if start_emergency_runtime; then
		supervisor_log "emergency_ready" \
			"pid=$CHILD_PID root=$(emergency_root) tier=0"
		return 0
	fi
	stop_emergency_runtime
	supervisor_log "emergency_failed" \
		"root=$(emergency_root) log=$(emergency_log_file)"
	return 1
}

monitor_supervisor_emergency() {
	monitor_emergency_runtime
}

stop_supervisor_emergency() {
	stop_emergency_runtime
	if [ "${CHILD_KIND:-}" = "emergency" ]; then
		CHILD_PID=""
		CHILD_OWNED=0
		CHILD_KIND="modern"
	fi
}
