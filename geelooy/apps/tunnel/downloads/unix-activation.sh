#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# B"H — Yaakov 2026-10-14: Beautiful stack trace on any error.
# If this component is sourced, the main script's trap applies.
# If run standalone, this ensures we always see the full error.
if ! trap -p ERR >/dev/null 2>&1 || ! trap -p ERR | grep -q "STACK TRACE"; then
  trap '{
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
	install_progress 65 "Pairing this machine (installer-direct)"
	# B"H — the installer does pairing directly: creates the request, shows
	# the approval card, polls for approval, consumes, and provisions the
	# credential into the candidate root. Instant and reliable.
	if ! direct_pairing_flow "${AWTSMOOS_TUNNEL_NAME:-}"; then
		install_fail "pairing" \
			"Installer-direct pairing failed." \
			"Check the log for details."
	fi
	# B"H — direct pairing succeeded and provisioned the credential.
	# Skip the candidate pairing probe entirely — the agent is already
	# paired. Go straight to promotion.
	install_progress 69 "Pairing complete — promoting agent"
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
		# B"H — Yaakov 2026-10-14: Show full probe log (stack trace) on failure.
		# The candidate-probe.log contains the actual error; surface it.
		local probe_log_path="$CANDIDATE_ROOT/candidate-probe.log"
		local probe_log_content="(no probe log found at $probe_log_path)"
		if [ -f "$probe_log_path" ]; then
			probe_log_content="$(tail -100 "$probe_log_path" 2>/dev/null)"
		fi
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
	prg_ok "Registered candidate promoted"
	start_promoted_candidate "$rollback" "$failed"
}

activate_release_candidate() {
	install_rescue_runtime
	if skip_start_requested; then
		prepare_without_activation
		return 0
	fi
	if [ -f "$ROOT/main.js" ]; then
		activate_update
	else
		activate_fresh
	fi
}
