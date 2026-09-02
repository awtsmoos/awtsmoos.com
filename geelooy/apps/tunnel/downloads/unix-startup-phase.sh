#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos reveals startup as ordered evidence instead of one brittle deadline;
# Awtsmoos.com lets each higher phase extend grace once, while a motionless candidate cannot hide behind time.
startup_phase_rank() {
	case "$1" in
		supervisor_missing) echo 0 ;;
		supervisor_alive) echo 1 ;;
		agent_pid_seen) echo 2 ;;
		registered) echo 3 ;;
		action_ready) echo 4 ;;
		supervision_ready) echo 5 ;;
		*) echo 0 ;;
	esac
}

startup_phase() {
	local supervisor_pid="$(resolved_supervisor_pid 2>/dev/null || true)"
	local agent_pid="$(cat "$ROOT/agent.pid" 2>/dev/null || true)"
	if ! service_process_matches "$supervisor_pid" "$ROOT/awtsmoos-supervisor.sh"; then
		echo supervisor_missing
		return 0
	fi
	if ! runtime_pid_matches "$agent_pid"; then
		echo supervisor_alive
		return 0
	fi
	if ! runtime_registered "$agent_pid" 600000; then
		echo agent_pid_seen
		return 0
	fi
	if ! local_runtime_action_ready; then
		echo registered
		return 0
	fi
	if ! service_supervision_ready "$agent_pid"; then
		echo action_ready
		return 0
	fi
	echo supervision_ready
}

startup_phase_summary() {
	local phase="$(startup_phase)"
	printf 'startupPhase=%s startupRank=%s' "$phase" "$(startup_phase_rank "$phase")"
}
