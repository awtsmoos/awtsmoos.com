#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos grants more time only when a newer startup witness appears;
# Awtsmoos.com caps the mercy, preserves progress, and refuses endless grace for a candidate that never repairs.
late_candidate_ready_sample() {
	local agent_pid="$(cat "$ROOT/agent.pid" 2>/dev/null || true)"
	current_release_is_complete || return 1
	final_readiness_sample "$agent_pid"
}

candidate_late_readiness_grace() {
	local base_seconds="${AWTSMOOS_LATE_START_GRACE_SECONDS:-20}"
	local progress_seconds="${AWTSMOOS_LATE_START_PROGRESS_GRACE_SECONDS:-10}"
	local hard_seconds="${AWTSMOOS_LATE_START_HARD_GRACE_SECONDS:-60}"
	local started_at="$(date +%s)" now="$started_at"
	local deadline=$(( started_at + base_seconds )) hard_deadline=$(( started_at + hard_seconds ))
	local phase="$(startup_phase)" rank="$(startup_phase_rank "$phase")"
	local previous_rank="$rank" stable=0
	[ "$rank" -gt 0 ] || return 1
	install_event "startup" "warning" \
		"Late startup evidence appeared; entering progress-aware bounded grace." \
		"phase=$phase $(service_health_summary)"
	while [ "$now" -lt "$deadline" ] && [ "$now" -lt "$hard_deadline" ]; do
		if late_candidate_ready_sample; then
			stable=$(( stable + 1 ))
			if [ "$stable" -ge 4 ]; then
				install_event "startup" "passed" \
					"Late candidate stabilized before cleanup." \
					"phase=$(startup_phase) $(service_health_summary)"
				return 0
			fi
		else
			stable=0
		fi
		phase="$(startup_phase)"
		rank="$(startup_phase_rank "$phase")"
		if [ "$rank" -gt "$previous_rank" ]; then
			deadline=$(( deadline + progress_seconds ))
			[ "$deadline" -gt "$hard_deadline" ] && deadline="$hard_deadline"
			previous_rank="$rank"
			install_event "startup" "progress" \
				"Startup advanced during bounded grace." \
				"phase=$phase rank=$rank deadline=$deadline hardDeadline=$hard_deadline"
		fi
		sleep 0.25
		now="$(date +%s)"
	done
	late_candidate_ready_sample
}
