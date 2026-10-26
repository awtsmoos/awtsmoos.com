#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# B"H — Diagnostic locations only. Shell commands can carry pairing
# credentials; never interpolate BASH_COMMAND into failed-install output.
if ! trap -p ERR >/dev/null 2>&1; then
  trap '{
    trap - ERR  # Prevent infinite recursion
    echo "" >&2
    echo "✨ ═══════════════════════════════════════════ ✨" >&2
    echo "   STACK TRACE — exactly where it broke" >&2
    echo "✨ ═══════════════════════════════════════════ ✨" >&2
    echo "   Failed installer operation; source locations follow." >&2
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
	# B"H — the exact staged tunnelName is the relay registration identity.
	# Never pair under hostname/Awtsmoos when config uses another registered name.
	local pairing_tunnel_name
	pairing_tunnel_name="$("$AWTSMOOS_NODE_BIN" - "$CANDIDATE_ROOT/config.json" <<'NODE'
const fs = require("node:fs");
try {
  const config = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
  const name = String(config.tunnelName || "");
  if (!/^[A-Za-z0-9._:@-]{1,160}$/.test(name)) process.exit(1);
  process.stdout.write(name);
} catch { process.exit(1); }
NODE
)" || install_fail "pairing" "Candidate tunnel name is invalid." "The staged runtime has no valid tunnelName."
	[ -n "$pairing_tunnel_name" ] || install_fail "pairing" "Candidate tunnel name missing." "Cannot authorize a different device name."
	if ! direct_pairing_flow "$pairing_tunnel_name"; then
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
	# Read the approved credential AND its corresponding private key from the
	# staged agent's own store before stopping the working predecessor.
	if ! AWTSMOOS_INSTALL_ROOT="$CANDIDATE_ROOT" AWTSMOOS_RECOVERY_ROOT="$RECOVERY_ROOT" \
		"$AWTSMOOS_NODE_BIN" - "$CANDIDATE_ROOT" "$RECOVERY_ROOT" <<'NODE'
const path = require("node:path");
const [root, recovery] = process.argv.slice(2);
const Identity = require(path.join(root, "lib/deviceIdentity/index.js"));
const options = { installRoot: root, recoveryRoot: recovery };
const metadata = Identity.Metadata.read(options);
const state = Identity.load(options);
const privateKey = metadata?.deviceId && Identity.SecureStore.read(metadata.deviceId, "private-key");
const coherent = privateKey && Identity.KeyCoherence.inspect(metadata, privateKey);
if (!state.ok || !coherent?.ok) process.exit(73);
NODE
	then
		install_fail "identity-reuse" \
			"Staged runtime cannot read the already-approved key and credential." \
			"The healthy predecessor was preserved; no new pairing was requested."
	fi
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

# Reuse an incumbent only when the agent is currently verified and registered.
# --reinstall/--clean/--keep-old-tunnels preserve their explicit fresh-pair behavior.
# An unhealthy or revoked credential cannot bypass account approval.
verified_identity_reuse_allowed() {
	[ -f "$ROOT/main.js" ] || return 1
	[ "${AWTSMOOS_REUSE_IDENTITY:-0}" = "1" ] && return 0
	[ "${AWTSMOOS_EXPLICIT_REINSTALL:-0}" = "1" ] && return 1
	[ "${AWTSMOOS_INSTALL_CLEAN:-0}" = "1" ] && return 1
	[ "${AWTSMOOS_KEEP_OLD_TUNNELS:-0}" = "1" ] && return 1
	declare -F current_runtime_is_stably_healthy >/dev/null 2>&1 || return 1
	current_runtime_is_stably_healthy
}

activate_release_candidate() {
	install_rescue_runtime
	if skip_start_requested; then
		prepare_without_activation
		return 0
	fi
	# Healthy incumbents use their already-approved device binding. Explicit
	# fresh reinstall and unhealthy/revoked incumbents still require user approval.
	# The staged candidate is fully proved before the predecessor is touched.
	if verified_identity_reuse_allowed; then
		install_event "identity" "preserved" \
			"A healthy, registered existing device keeps its authorization without another approval delay." \
			"root=$ROOT mode=${AWTSMOOS_INSTALL_MODE:-full}"
		prg_ok "Verified existing authorization: skipping unnecessary re-pairing."
		activate_update
	else
		if [ -f "$ROOT/main.js" ]; then
			install_event "identity" "fresh" "Reinstall requires fresh account approval; old credential will not be reused."
			prg_info "Renewing authorization with a fresh pairing code."
		fi
		activate_fresh
	fi
}
