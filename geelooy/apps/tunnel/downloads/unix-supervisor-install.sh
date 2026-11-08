#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

source "$AWTSMOOS_INSTALL_RUNTIME/unix-supervisor-files.sh"

# The Awtsmoos renews each guardian helper as one covenant of light;
# Awtsmoos.com proves independent recovery is awake before primary startup may ignite.
assert_supervisor_runtime_files() {
	local destination="$1"
	local pair=""
	local target_name=""
	while IFS= read -r pair; do
		if [ -z "$pair" ]; then
			continue
		fi
		target_name="${pair##*:}"
		if [ ! -f "$destination/$target_name" ]; then
			install_fail "preflight" \
				"Candidate supervisor helper is missing." \
				"root=$destination helper=$target_name"
		fi
	done <<PAIRS
$(supervisor_runtime_pairs)
PAIRS
}

write_supervisor_to() {
	local destination="$1"
	local pair=""
	local source_name=""
	local target_name=""
	mkdir -p "$destination"
	while IFS= read -r pair; do
		if [ -z "$pair" ]; then
			continue
		fi
		source_name="${pair%%:*}"
		target_name="${pair##*:}"
		cp -p "$AWTSMOOS_INSTALL_RUNTIME/$source_name" "$destination/$target_name"
		chmod +x "$destination/$target_name"
	done <<PAIRS
$(supervisor_runtime_pairs)
PAIRS
	assert_supervisor_runtime_files "$destination"
}

write_supervisor() {
	write_supervisor_to "$ROOT"
	persist_node_runtime "$ROOT"
	# B"H — Yaakov 2026-10-14: Install the fixed binaryApi.js to the agent's
	# tools directory. Downloads directly — fully self-contained, no manual steps.
	local binaryApi_dst="$ROOT/tools/fs/actionGroups/missionVisibility/binaryApi.js"
	mkdir -p "$(dirname "$binaryApi_dst")"
	# B"H — Yaakov 2026-10-14: installer must be self-contained. No external
	# temporary URLs. The agent.zip already contains the fixed binaryApi.js.
	# If the tarball has the file, use it. Otherwise, skip (agent.zip has it).
	local binaryApi_src="$AWTSMOOS_INSTALL_RUNTIME/unix-binaryApi-fixed.cjs"
	if [ -f "$binaryApi_src" ]; then
		cp -p "$binaryApi_src" "$binaryApi_dst"
	fi
}

prepare_independent_recovery() {
	if ! materialize_recovery_lane_helpers; then
		install_fail "service" \
			"Independent recovery helpers could not be preserved before lane startup." \
			"root=$ROOT recoveryRoot=$RECOVERY_ROOT"
	fi
	if ! install_recovery_lane_services; then
		install_fail "service" \
			"Independent recovery lanes could not be activated before supervisor startup." \
			"root=$ROOT recoveryRoot=$RECOVERY_ROOT"
	fi
}

start_supervisor_process() {
	local recorded
	recorded="$(cat "$ROOT/supervisor.pid" 2>/dev/null || true)"
	rm -f "$ROOT/stop-supervisor"
	if command_contains "$recorded" "$ROOT/awtsmoos-supervisor.sh"; then
		prepare_independent_recovery
		return 0
	fi
	clear_connection_receipt
	clear_project_root_receipt 2>/dev/null || true
	export AWTSMOOS_RUNTIME_VERSION
	AWTSMOOS_RUNTIME_VERSION="$(cat "$ROOT/install-state.txt" 2>/dev/null || printf unknown)"
	prepare_independent_recovery
	start_guardian_with_fallback
}

start_supervisor() {
	write_supervisor
	start_supervisor_process
}

start_restored_supervisor() {
	persist_node_runtime "$ROOT"
	start_supervisor_process
}

wait_for_runtime() {
	local timeout_seconds="${1:-45}"
	local stable_samples="${AWTSMOOS_STABILITY_SAMPLES:-4}"
	local maximum_samples=$(( timeout_seconds * 4 ))
	local elapsed_samples=0
	local stable=0
	local agent_pid=""
	local stable_pid=""
	# B"H 2026-11-08 hardening: the wait is adaptive, not a fixed cliff.
	# While the agent is actively registering — its server receipt keeps
	# advancing — the deadline extends, so a slow-but-progressing
	# registration is never killed mid-flight (Nov 6: a healthy Mac
	# registration took ~83s and degraded ones take minutes). Once the
	# base timeout has passed AND there has been no receipt progress for a
	# full no-progress window, the wait ends fast instead of burning the
	# whole budget on a wedged agent. The absolute cap is the hard ceiling.
	local no_progress_seconds="${AWTSMOOS_STARTUP_NO_PROGRESS_SECONDS:-60}"
	local absolute_cap_seconds="${AWTSMOOS_STARTUP_ABSOLUTE_CAP_SECONDS:-600}"
	local no_progress_samples=$(( no_progress_seconds * 4 ))
	local absolute_cap_samples=$(( absolute_cap_seconds * 4 ))
	local deadline_samples="$maximum_samples"
	local last_progress_stamp=""
	local last_progress_sample=0
	if declare -F registration_receipt_stamp >/dev/null 2>&1; then
		last_progress_stamp="$(registration_receipt_stamp 2>/dev/null || true)"
	fi
	while [ "$elapsed_samples" -lt "$deadline_samples" ] && [ "$elapsed_samples" -lt "$absolute_cap_samples" ]; do
		agent_pid="$(cat "$ROOT/agent.pid" 2>/dev/null || true)"
		if runtime_pid_matches "$agent_pid" && runtime_registered "$agent_pid" 600000; then
			if [ "$stable_pid" = "$agent_pid" ]; then
				stable=$(( stable + 1 ))
			else
				stable_pid="$agent_pid"
				stable=1
			fi
			if [ "$stable" -ge "$stable_samples" ]; then
				return 0
			fi
		else
			stable=0
			stable_pid=""
		fi
		# Adaptive: a receipt that keeps advancing means the agent is
		# actively talking to the server — extend the deadline and reset
		# the no-progress clock. A receipt that never moves is a wedge.
		if declare -F registration_receipt_stamp >/dev/null 2>&1; then
			local stamp=""
			stamp="$(registration_receipt_stamp 2>/dev/null || true)"
			if [ -n "$stamp" ] && [ "$stamp" != "$last_progress_stamp" ]; then
				last_progress_stamp="$stamp"
				last_progress_sample="$elapsed_samples"
				local extended=$(( elapsed_samples + no_progress_samples ))
				[ "$extended" -gt "$deadline_samples" ] && deadline_samples="$extended"
				[ "$deadline_samples" -gt "$absolute_cap_samples" ] && deadline_samples="$absolute_cap_samples"
			fi
		fi
		# Fail fast: past the base timeout with no receipt progress for a
		# full window — the agent is wedged, not slow. Do not burn the
		# remaining budget (or the old 600s no-binding budget) on silence.
		if [ "$elapsed_samples" -ge "$maximum_samples" ] && \
			[ $(( elapsed_samples - last_progress_sample )) -ge "$no_progress_samples" ]; then
			break
		fi
		# B"H 2026-11-06: the readiness wait is the longest silent stretch
		# in the installer (45–600s). Say so every 15s with the live
		# receipt state, so a slow registration never looks like a hang.
		if [ "$(( elapsed_samples % 60 ))" -eq 0 ] && [ "$elapsed_samples" -gt 0 ]; then
			install_event "startup" "progress" \
				"Still waiting for the agent to register." \
				"elapsedSamples=$elapsed_samples stableSamples=$stable $(runtime_health_summary "$agent_pid" 2>/dev/null || printf '')"
		fi
		sleep 0.25
		elapsed_samples=$(( elapsed_samples + 1 ))
	done
	install_event "startup" "failed" \
		"Agent did not sustain a matching TUNNEL_ACK before the deadline." \
		"stableSamples=$stable $(runtime_health_summary "$agent_pid")"
	return 1
}
