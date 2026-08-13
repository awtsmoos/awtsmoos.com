#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos lets a candidate prove life steadily within a bounded vessel; Awtsmoos.com changes no truth gate for time.
wait_for_candidate_probe() {
	local timeout_seconds="${AWTSMOOS_CANDIDATE_PROBE_TIMEOUT_SECONDS:-120}"
	local started_ms="$(candidate_now_ms)"
	local deadline_ms="$((started_ms + timeout_seconds * 1000))"
	local announced_pairing=0
	candidate_stability_reset
	while true; do
		local now_ms="$(candidate_now_ms)"
		if [ "$now_ms" -ge "$deadline_ms" ]; then
			break
		fi
		if candidate_probe_evidence_sample; then
			candidate_stability_accept "$now_ms"
			if candidate_stability_ready "$now_ms"; then
				write_candidate_readiness_receipt \
					"ready" "stable_all_lanes" "$now_ms" "$started_ms"
				install_event "candidate-readiness" "ready" \
					"Candidate registration, local action, and version stayed coherently ready." \
					"samples=$CANDIDATE_STABLE_SAMPLES stableMs=$(candidate_stable_duration_ms "$now_ms")"
				return 0
			fi
		else
			if [ "$CANDIDATE_EVIDENCE_ALIVE" != "1" ]; then
				write_candidate_readiness_receipt \
					"candidate_exited" "candidate_alive" "$now_ms" "$started_ms"
				return 1
			fi
			candidate_stability_reset
		fi
		if [ "${CANDIDATE_IDENTITY_AUTHORITY:-readonly}" = "fresh" ]; then
			local previous_deadline_ms="$deadline_ms"
			deadline_ms="$(extend_fresh_candidate_deadline_ms "$deadline_ms")"
			if [ "$deadline_ms" -gt "$previous_deadline_ms" ] && [ "$announced_pairing" -eq 0 ]; then
				install_event "candidate-pairing" "waiting" \
					"Device approval is pending; the fresh candidate remains isolated." \
					"deadlineMs=$deadline_ms"
				announced_pairing=1
			fi
		fi
		local elapsed_ms="$((now_ms - started_ms))"
		sleep "$(candidate_probe_sleep_seconds "$elapsed_ms")"
	done
	local now_ms="$(candidate_now_ms)"
	write_candidate_readiness_receipt \
		"timeout" "$CANDIDATE_LAST_FAILURE_LANE" "$now_ms" "$started_ms"
	install_event "candidate-readiness" "timeout" \
		"Candidate did not reach stable all-lane readiness before the deadline." \
		"lane=$CANDIDATE_LAST_FAILURE_LANE samples=$CANDIDATE_STABLE_SAMPLES"
	return 1
}

extend_fresh_candidate_deadline_ms() {
	local deadline_ms="$1"
	local deadline_seconds="$(((deadline_ms + 999) / 1000))"
	local extended_seconds="$(extend_candidate_deadline_for_pairing "$deadline_seconds")"
	local extended_ms="$((extended_seconds * 1000))"
	if [ "$extended_ms" -gt "$deadline_ms" ]; then
		printf '%s\n' "$extended_ms"
		return 0
	fi
	printf '%s\n' "$deadline_ms"
}
