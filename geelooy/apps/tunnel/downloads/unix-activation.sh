#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# B"H — Yaakov 2026-10-14: Beautiful stack trace on any error.
# If this component is sourced, the main script's trap applies.
# If run standalone, this ensures we always see the full error.
if ! trap -p ERR >/dev/null 2>&1 || ! trap -p ERR | grep -q "STACK TRACE"; then
  trap '{
    trap - ERR  # Prevent infinite recursion
    echo "" >&2
    echo "✨ ═══════════════════════════════════════════ ✨" >&2
    echo "   STACK TRACE — exactly where it broke" >&2
    echo "✨ ═══════════════════════════════════════════ ✨" >&2
    echo "   Failed: $BASH_COMMAND" >&2
    echo "" >&2
    echo "   Call chain (newest first):" >&2
    local i=0 line func src
    while IFS= read -r line; do
      echo "     → $line" >&2
    done < <(caller 0 2>/dev/null; i=1; while caller $i 2>/dev/null; do i=$((i + 1)); done)
    echo "✨ ═══════════════════════════════════════════ ✨" >&2
    echo "" >&2
  }' ERR
fi

# Activation proves staged life before any predecessor path is displaced. Fresh install
# alone grants explicit identity creation authority; update probes remain read-only.
#
# B"H — Yaakov 2026-10-14: fresh installs use installer-direct pairing. The
# installer completes the pairing ceremony itself (instant, reliable) and
# provisions the credential; the candidate starts already-paired with no
# pairing poll in the critical path.
activate_fresh() {
	local stamp="$(date -u +%Y%m%dT%H%M%SZ)"
	local displaced=""
	local failed="${ROOT}.failed-${CANDIDATE_VERSION}-${stamp}-$$"
	mkdir -p "$(dirname "$ROOT")"
	install_progress 65 "Pairing a new authorized tunnel identity"
	# B"H — the installer does pairing directly: creates the request, shows
	# the approval card, polls for approval, consumes, and provisions the
	# credential into the candidate root. Instant and reliable.
	if ! direct_pairing_flow "${AWTSMOOS_TUNNEL_NAME:-}"; then
		install_fail "pairing" \
			"Installer-direct pairing failed." \
			"Check the log for details."
	fi
	# A previously installed agent can have an invalid/revoked credential.
	# Never accept a skipped pairing as success or redispatch that credential
	# after promoting the new runtime. The user must approve a fresh binding.
	if [ "${AWTSMOOS_PAIRING_SKIPPED:-0}" = "1" ] ||
		[ ! -s "$(direct_pairing_provision_file)" ]; then
		install_fail "pairing" \
			"New device approval did not produce an authorized credential." \
			"The former tunnel was left unchanged. Retry pairing while signed in."
	fi
	# A successful pairing response alone is not proof that the installed
	# agent boots, registers, and performs a real local file action.
	install_progress 69 "Pairing complete — verifying the candidate agent"
	if ! prove_candidate_before_promotion fresh; then
		install_fail "candidate-probe" \
			"Paired candidate failed startup or command readiness; live state preserved." \
			"candidate=$CANDIDATE_ROOT root=$ROOT"
	fi
	if [ -e "$ROOT" ]; then
		displaced="${ROOT}.incomplete-${stamp}-$$"
	fi
	install_progress 78 "Promoting paired runtime"
	if ! promote_candidate_root "$displaced"; then
		install_fail "activate" \
			"Could not promote the paired candidate." \
			"candidate=$CANDIDATE_ROOT root=$ROOT"
	fi
	prg_ok "Paired runtime promoted"
	start_promoted_candidate "$displaced" "$failed"
	return 0
}

activate_update() {
	local stamp="$(date -u +%Y%m%dT%H%M%SZ)"
	local rollback="${ROOT}.activation-rollback-${stamp}-$$"
	local failed="${ROOT}.failed-${CANDIDATE_VERSION}-${stamp}-$$"
	install_progress 69 "Proving candidate while predecessor remains recoverable"
	write_activation_journal "predecessor_preserved" "$CANDIDATE_ROOT" "$ROOT"
	if ! prove_candidate_before_promotion readonly; then
		# B"H — Yaakov 2026-10-14 STANDING RULE: Installer ALWAYS shows the
		# agent's real output (same as `node main.js`), but better formatted.
		# Print the probe log directly — do not rely on the error card.
		local probe_log_path="$CANDIDATE_ROOT/candidate-probe.log"
		local probe_log_content="(no probe log found at $probe_log_path)"
		if [ -f "$probe_log_path" ]; then
			probe_log_content="$(tail -100 "$probe_log_path" 2>/dev/null)"
		fi
		# Old credentials cannot be repaired by restarting the same candidate.
		if printf '%s' "$probe_log_content" | grep -Fq 'invalid_device_credential'; then
			printf '\n  Credential rejected by Awtsmoos.com.\n' >&2
			printf '  Retry without --reuse-identity to approve a fresh device.\n' >&2
		fi
		# Direct output: ALWAYS show the real agent messages.
		echo "" >&2
		echo "✨ ═══════════════════════════════════════════════════ ✨" >&2
		echo "   AGENT OUTPUT — exactly what 'node main.js' printed" >&2
		echo "✨ ═══════════════════════════════════════════════════ ✨" >&2
		echo "$probe_log_content" >&2
		echo "✨ ═══════════════════════════════════════════════════ ✨" >&2
		echo "" >&2
		install_fail "candidate-probe" \
			"Candidate failed before predecessor displacement; predecessor was restored." \
			"candidate=$CANDIDATE_ROOT root=$ROOT probe_log_path=$probe_log_path probe_log: $probe_log_content"
	fi
	install_progress 78 "Promoting registered candidate atomically"
	if ! promote_candidate_root "$rollback"; then
		install_fail "activate" \
			"Candidate promotion failed; predecessor path was restored." \
			"candidate=$CANDIDATE_ROOT root=$ROOT rollback=$rollback"
	fi
	start_promoted_candidate "$rollback" "$failed"
}

activate_release_candidate() {
	install_rescue_runtime
	if skip_start_requested; then
		prepare_without_activation
		return 0
	fi
	# A normal reinstall means a NEW device registration, not reuse of old
	# authorization. Old credentials may be revoked (invalid_device_credential),
	# in which case a readonly update would wait and fail indefinitely. The new
	# binding is obtained with user approval BEFORE the predecessor is touched.
	# Retaining old runtime files is independent of reusing old authorization.
	# An intentionally reused, rejected credential may fail; the caller must
	# explicitly opt in to --reuse-identity, never merely --keep-old-tunnels.
	if [ -f "$ROOT/main.js" ] && [ "${AWTSMOOS_REUSE_IDENTITY:-0}" = "1" ]; then
		install_event "identity" "preserved" "Reusing existing authorization by explicit --reuse-identity request."
		activate_update
	else
		if [ -f "$ROOT/main.js" ]; then
			install_event "identity" "fresh" "Reinstall requires fresh account approval; old credential will not be reused."
			prg_info "Renewing authorization with a fresh pairing code."
		fi
		activate_fresh
	fi
}
