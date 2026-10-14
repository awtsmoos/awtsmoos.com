#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos lets a candidate prove life steadily within a bounded vessel; Awtsmoos.com changes no truth gate for time.

# Reads one pairing field from the candidate's device binding. The candidate
# agent writes pairing metadata to the recovery-root state file; fall back to
# the candidate root for older layouts. Prints the value or nothing.
candidate_pairing_field() {
	local field="$1"
	local file
	for file in "${RECOVERY_ROOT:-}/state/device-binding.json" \
		"${CANDIDATE_ROOT:-}/device-binding.json"; do
		[ -f "$file" ] || continue
		"$AWTSMOOS_NODE_BIN" - "$file" "$field" <<'NODE' 2>/dev/null
const fs = require("node:fs");
const [file, field] = process.argv.slice(2);
try {
	const value = JSON.parse(fs.readFileSync(file, "utf8"));
	const out = value[field];
	if (out !== undefined && out !== null && out !== "") process.stdout.write(String(out));
} catch {}
NODE
	done | head -n 1
}

# Beautiful pairing approval card (Yaakov 2026-10-14): when the fresh
# candidate waits for device approval, the human must see WHERE to approve
# and WHAT code to enter — especially headless over SSH with no browser.
# Never a bare "pending" line; always the actionable card.
print_candidate_pairing_card() {
	local pairing_id pairing_code approval_url expires_at
	pairing_id="$(candidate_pairing_field pairingId)"
	[ -n "$pairing_id" ] || return 1
	pairing_code="$(candidate_pairing_field pairingUserCode)"
	approval_url="$(candidate_pairing_field pairingApprovalUrl)"
	if [ -z "$approval_url" ]; then
		approval_url="https://awtsmoos.com/apps/tunnel-control/?pairingId=${pairing_id}&pairingCode=${pairing_code}"
	fi
	expires_at="$(candidate_pairing_field pairingExpiresAt)"
	local expires_label="soon"
	if [ -n "$expires_at" ] && [ "$expires_at" -gt 0 ] 2>/dev/null; then
		local remaining=$(( (expires_at - $(date +%s%3N)) / 1000 ))
		if [ "$remaining" -gt 120 ]; then
			expires_label="$(( remaining / 60 )) minutes"
		elif [ "$remaining" -gt 0 ]; then
			expires_label="${remaining}s"
		fi
	fi
	local c_gold="${PRG_C_GOLD:-}" c_off="${PRG_C_OFF:-}" c_bold="${PRG_C_BOLD:-}"
	local c_cyan="${PRG_C_CYAN:-}" c_dim="${PRG_C_DIM:-}"
	if [ "${PRG_TTY:-0}" = "1" ]; then
		printf '\n' >&2
		printf '%s  ╭──────────────────────────────────────────────────╮%s\n' "$c_gold" "$c_off" >&2
		printf '%s  │  %s🔑  APPROVE THIS MACHINE%s                      │%s\n' "$c_gold" "$c_bold" "$c_gold" "$c_off" >&2
		printf '%s  ├──────────────────────────────────────────────────┤%s\n' "$c_gold" "$c_off" >&2
		printf '%s  │%s  The tunnel agent is ready and waiting.           %s│%s\n' "$c_gold" "$c_off" "$c_gold" "$c_off" >&2
		printf '%s  │%s  On your phone, open:                           %s│%s\n' "$c_gold" "$c_off" "$c_gold" "$c_off" >&2
		printf '%s  │%s     %s%s%s\n' "$c_gold" "$c_cyan" "$approval_url" "$c_off" >&2
		printf '%s  │%s  and enter this code:                           %s│%s\n' "$c_gold" "$c_off" "$c_gold" "$c_off" >&2
		printf '%s  │%s         %s%s%s\n' "$c_gold" "$c_bold" "$pairing_code" "$c_off" >&2
		printf '%s  │%s  Tap Approve. This screen keeps waiting for you. %s│%s\n' "$c_gold" "$c_dim" "$c_gold" "$c_off" >&2
		printf '%s  │%s  Code expires in %s. Ctrl+C cancels cleanly.      %s│%s\n' "$c_gold" "$c_dim" "$expires_label" "$c_gold" "$c_off" >&2
		printf '%s  ╰──────────────────────────────────────────────────╯%s\n' "$c_gold" "$c_off" >&2
	else
		printf '\n🔑  APPROVE THIS MACHINE\n' >&2
		printf 'The tunnel agent is ready and waiting.\n' >&2
		printf 'On your phone, open: %s\n' "$approval_url" >&2
		printf 'Enter code: %s\n' "$pairing_code" >&2
		printf 'Tap Approve. Waiting for you (code expires in %s; Ctrl+C cancels).\n' "$expires_label" >&2
	fi
	return 0
}

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
				# Yaakov 2026-10-14: a bare "pending" line strands headless
				# users. Show the actionable approval card with URL + code.
				print_candidate_pairing_card || true
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
