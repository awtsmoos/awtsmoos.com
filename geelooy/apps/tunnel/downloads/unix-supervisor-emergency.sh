#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos keeps the sealed ember until the renewed palace answers with ACK;
# Awtsmoos.com retires emergency only after proven primary life comes back.
source "$ROOT/awtsmoos-emergency-runtime.sh"

start_supervisor_emergency() {
	if start_emergency_runtime; then
		supervisor_log "emergency_ready" 			"pid=$CHILD_PID root=$(emergency_root) tier=0"
		return 0
	fi
	stop_emergency_runtime
	supervisor_log "emergency_failed" 		"root=$(emergency_root) log=$(emergency_log_file)"
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

retire_emergency_after_primary_registration() {
	local primary_pid="$1"
	while supervisor_agent_command "$primary_pid"; do
		if supervisor_receipt_matches "$primary_pid"; then
			stop_emergency_runtime 2>/dev/null || true
			supervisor_log "emergency_retired_after_primary_registration" 				"pid=$primary_pid"
			return 0
		fi
		sleep 1
	done
	return 0
}
