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
	// B"H — trailing newline is load-bearing: when both binding files exist
	// (state migration copies recovery -> candidate), values must stay on
	// separate lines or `head -n 1` below receives them concatenated.
	if (out !== undefined && out !== null && out !== "") process.stdout.write(String(out) + "\n");
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
		approval_url="https://awtsmoos.com/api/tunnel/control/pairing/page?pairingId=${pairing_id}&pairingCode=${pairing_code}"
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

# B"H — Level 2 of Yaakov's multi-level approval detection (2026-10-14):
# the installer itself polls the passive pairing state endpoint directly,
# so a wedged candidate poll loop can never strand the human silently.
# Read-only: never consumes the pairing, never needs the request secret.
installer_pairing_state() {
	local pairing_id="$1"
	[ -n "$pairing_id" ] || return 1
	[ -n "$AWTSMOOS_NODE_BIN" ] || return 1
	local resp
	resp="$(curl -fs -m 10 -X POST \
		-H "Content-Type: application/json" \
		--data-binary "{\"pairingId\":\"$pairing_id\"}" \
		"$origin/api/tunnel/control/pairing/state" 2>/dev/null)" || return 1
	[ -n "$resp" ] || return 1
	"$AWTSMOOS_NODE_BIN" -e '
let s = "";
process.stdin.on("data", c => { s += c; });
process.stdin.on("end", () => {
	try {
		const j = JSON.parse(s);
		if (j && j.ok && j.state) process.stdout.write(String(j.state));
	} catch {}
});
' <<<"$resp" 2>/dev/null
}

wait_for_candidate_probe() {
	local timeout_seconds="${AWTSMOOS_CANDIDATE_PROBE_TIMEOUT_SECONDS:-120}"
	local started_ms="$(candidate_now_ms)"
	local deadline_ms="$((started_ms + timeout_seconds * 1000))"
	local announced_pairing=0
	local announced_preparing=0
	local announced_direct_skip=0
	local pairing_wait_started_ms=0
	# B"H — Level 2 direct poll state (Yaakov 2026-10-14).
	local installer_pairing_id=""
	local installer_last_state_poll_ms=0
	local installer_approval_seen_ms=0
	local installer_state_poll_interval_ms=5000
	# B"H — after the installer itself sees approval, the candidate gets this
	# long to finish registering before we fail with a targeted message.
	local approval_settle_ms="${AWTSMOOS_APPROVAL_SETTLE_MS:-60000}"
	# B"H — how long to wait for the candidate to write its pairing info
	# before failing beautifully instead of stranding the human (Yaakov 2026-10-14).
	local pairing_info_timeout_ms="${AWTSMOOS_PAIRING_INFO_TIMEOUT_MS:-90000}"
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
		# B"H — Yaakov 2026-10-14: when installer-direct pairing already
		# succeeded, the agent starts already-paired — skip the candidate's
		# own pairing-wait entirely. No redundant approval card.
		if [ "${AWTSMOOS_DIRECT_PAIRING_DONE:-0}" = "1" ] && [ "$announced_direct_skip" != "1" ]; then
			announced_direct_skip=1
			install_event "candidate-pairing" "skipped" \
				"Installer-direct pairing already completed; candidate starts already-paired." \
				"directPairing=done"
		fi
		if [ "${CANDIDATE_IDENTITY_AUTHORITY:-readonly}" = "fresh" ] && [ "${AWTSMOOS_DIRECT_PAIRING_DONE:-0}" != "1" ]; then
			local previous_deadline_ms="$deadline_ms"
			deadline_ms="$(extend_fresh_candidate_deadline_ms "$deadline_ms")"
			if [ "$deadline_ms" -gt "$previous_deadline_ms" ] && [ "$announced_pairing" -eq 0 ]; then
				install_event "candidate-pairing" "waiting" \
					"Device approval is pending; the fresh candidate remains isolated." \
					"deadlineMs=$deadline_ms"
			fi
			# Yaakov 2026-10-14: the approval card must ALWAYS show when
			# approval is pending — never strand the human with no action.
			# Retry while the pairing file is not readable yet; fail
			# beautifully if it never appears.
			if [ "$announced_pairing" -eq 0 ]; then
				if [ "$pairing_wait_started_ms" -eq 0 ]; then
					pairing_wait_started_ms="$now_ms"
				fi
				local _pairing_id
				_pairing_id="$(candidate_pairing_field pairingId 2>/dev/null)"
				if [ -n "$_pairing_id" ]; then
					print_candidate_pairing_card || true
					installer_pairing_id="$_pairing_id"
					announced_pairing=1
				else
					if [ "$announced_preparing" -eq 0 ]; then
						prg_info "Preparing your approval code…"
						announced_preparing=1
					fi
					if [ "$((now_ms - pairing_wait_started_ms))" -ge "$pairing_info_timeout_ms" ]; then
						write_candidate_readiness_receipt \
							"pairing_info_timeout" "pairing" "$now_ms" "$started_ms"
						install_fail "candidate-pairing" \
							"The tunnel agent did not produce an approval code." \
							"The candidate is running but never wrote its pairing info. Check the candidate log for errors."
					fi
				fi
			fi
			# B"H — Level 2: the installer polls pairing state directly every
			# few seconds once the card is shown. If the human approved on
			# their phone but the candidate's own poll loop is wedged, we
			# still see it here and say so beautifully instead of hanging.
			if [ "$announced_pairing" -eq 1 ] && [ -n "$installer_pairing_id" ]; then
				if [ "$((now_ms - installer_last_state_poll_ms))" -ge "$installer_state_poll_interval_ms" ]; then
					installer_last_state_poll_ms="$now_ms"
					local _pairing_state
					_pairing_state="$(installer_pairing_state "$installer_pairing_id" 2>/dev/null)"
					case "$_pairing_state" in
						approved|consumed)
							if [ "$installer_approval_seen_ms" -eq 0 ]; then
								installer_approval_seen_ms="$now_ms"
								prg_ok "Approval detected! Waiting for the agent to finish registering…"
								install_event "candidate-pairing" "approved" \
									"Device approval detected by the installer directly." \
									"state=$_pairing_state"
							fi
							;;
					esac
				fi
				# B"H — approval went through (we saw it ourselves) but the
				# candidate hasn't finished registering yet. Yaakov: approval
				# must trigger the machine. Promote anyway — the agent has
				# the pairing info and will complete registration on boot.
				# A credential-less agent is better than a failed install;
				# the supervisor will retry registration until it succeeds.
				if [ "$installer_approval_seen_ms" -ne 0 ] && \
					[ "$((now_ms - installer_approval_seen_ms))" -ge "$approval_settle_ms" ]; then
					write_candidate_readiness_receipt \
						"approved_promoting" "registration" "$now_ms" "$started_ms"
					install_event "candidate-pairing" "approved_promoting" \
						"Approval went through; promoting so the agent completes registration on boot." \
						"state=$_pairing_state"
					prg_ok "Approval confirmed — installing the agent now…"
					return 0
				fi
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
