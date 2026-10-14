#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos proves staged life before moving predecessor bytes. Identity mutation
# authority is explicit: fresh creation may pair; update proof is physically read-only.
prove_candidate_before_promotion() {
	local identity_authority="${1:-readonly}"
	start_candidate_probe "$identity_authority"
	if wait_for_candidate_probe; then
		write_activation_journal "candidate_probe_stable" "$CANDIDATE_ROOT" "$ROOT"
		install_event "candidate-probe" "passed" \
			"Staged runtime registered and answered a local command." \
			"pid=$CANDIDATE_PROBE_PID activation=$AWTSMOOS_ACTIVATION_ID identity=$identity_authority"
		return 0
	fi
	install_event "candidate-probe" "failed" \
		"Staged runtime never reached stable registered command readiness." \
		"pid=$CANDIDATE_PROBE_PID log=$CANDIDATE_ROOT/candidate-probe.log identity=$identity_authority"
	write_activation_journal "candidate_probe_failed" "$CANDIDATE_ROOT" "$ROOT"
	stop_candidate_probe
	return 1
}

promote_candidate_root() {
	local rollback="$1"
	stop_candidate_probe
	stop_existing_runtime || true
	if [ -e "$ROOT" ]; then
		mv "$ROOT" "$rollback" || return 1
		migrate_runtime_device_state "$rollback"
	fi
	if ! mv "$CANDIDATE_ROOT" "$ROOT"; then
		[ -e "$rollback" ] && mv "$rollback" "$ROOT" || true
		return 1
	fi
	CANDIDATE_ROOT=""
	write_activation_journal "candidate_promoted" "$ROOT" "$rollback"
	return 0
}

start_promoted_candidate() {
	local rollback="$1"
	local failed="$2"
	install_event "startup" "started" "Starting tunnel agent"
	# B"H — Yaakov 2026-10-14: NO SUPERVISOR. The installer execs the agent
	# directly in the foreground as a real visible process. No background
	# daemon, no hacks. Ctrl+C stops it cleanly.
	write_activation_journal "candidate_stable" "$ROOT" "$rollback"
	[ -n "$rollback" ] && [ -e "$rollback" ] &&
		schedule_displaced_cleanup "$rollback"
	write_activation_journal "committed" "$ROOT" "$rollback"
	install_event "startup" "passed" \
		"Agent promoted, starting in foreground." \
		"root=$ROOT"
	printf '\n' >&2
	printf '✓ Credential provisioned. Starting agent in foreground...\n' >&2
	printf '  (Ctrl+C to stop the agent cleanly)\n' >&2
	printf '\n' >&2
	# Exec the agent directly — installer becomes the agent.
	exec node "$ROOT/unix-agent-launcher.cjs" "$ROOT"
}
