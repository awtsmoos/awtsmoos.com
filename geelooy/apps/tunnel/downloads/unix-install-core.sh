#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

set -Eeuo pipefail

origin="${AWTSMOOS_INSTALL_ORIGIN%/}"
ROOT="$AWTSMOOS_INSTALL_ROOT"
RECOVERY_ROOT="${AWTSMOOS_RECOVERY_ROOT:-${ROOT}-recovery}"
CANDIDATE_ROOT=""
CANDIDATE_VERSION=""
MANIFEST_SHA=""
export ROOT RECOVERY_ROOT

source "$AWTSMOOS_INSTALL_RUNTIME/unix-install-sources.sh"
trap cleanup_install EXIT

# The Awtsmoos lets one remote command rebuild a missing palace or revive a sealed ember;
# Awtsmoos.com walks current release, verified archive, and Tier-Zero before surrender.
install_begin_step 1 3 "Setting up your tunnel" "verifying the installer and preserving your identity" 15 30
install_progress 20 "Preparing complete verified reinstall"
# Yaakov 2026-10-14: this phase must never hang silently and never ask the
# human to rm -rf a stale lock. Every sub-step is visible on the bar; every
# failure reaches the beautiful error card via without_errexit (no set -e
# death that drops back to the shell prompt with no message). Every node
# call inside these helpers is bounded by run_with_timeout, so nothing here
# can wedge forever. (Note: run_with_timeout only wraps external binaries —
# never shell functions — because GNU timeout cannot exec a function.)
clear_stale_install_lock
install_progress 20 "Claiming the install lock"
if ! without_errexit acquire_install_lock; then
	install_fail "install-lock" \
		"Could not claim the install lock." \
		"lock=$INSTALL_LOCK_DIRECTORY"
fi
install_progress 20 "Verifying the Node runtime"
if ! without_errexit persist_node_runtime "$ROOT"; then
	install_fail "node-runtime" \
		"The Node.js runtime could not be verified." \
		"root=$ROOT"
fi
install_progress 20 "Resuming any interrupted install"
if ! without_errexit resume_interrupted_install; then
	install_fail "bootstrap" \
		"Could not resume an interrupted install." \
		"root=$ROOT"
fi
install_progress 20 "Rotating runtime logs"
without_errexit rotate_runtime_logs || true
install_progress 20 "Pruning displaced runtimes"
without_errexit prune_displaced_runtimes || true
install_event "bootstrap" "started" \
	"Beginning identity-preserving complete tunnel reinstall." "$ROOT"
install_progress 20 "Cleaning disposable state"
without_errexit cleanup_disposable_state "$(pwd)" || true

install_progress 21 "Preserving durable identity and browser state"
migrate_dynamic_state
# B"H — never let this phase die silently (Yaakov 2026-10-14): run the
# metadata fetch and its recovery lanes with errexit off so every internal
# failure becomes a return code that reaches the beautiful error card.
if ! without_errexit load_release_metadata; then
	if without_errexit recover_without_release_metadata; then
		if ! without_errexit complete_metadata_recovery; then
			install_fail "metadata-recovery" \
				"Local recovery reported success but could not complete." \
				"mode=${METADATA_RECOVERY_MODE:-unknown} root=$ROOT"
		fi
		exit 0
	fi
	install_fail "release-metadata" \
		"Published metadata is unavailable and every verified local recovery layer failed." \
		"origin=$origin root=$ROOT recovery=$RECOVERY_ROOT"
fi

apply_installed_version_policy
if version_policy_blocks_replacement; then
	if repair_self_verified_installed_release; then
		refresh_emergency_runtime
		install_progress 97 "Current verified release repaired without redownload"
		complete_install_experience "$(activation_phase)"
		exit 0
	fi
	install_fail "version-policy" \
		"Published release is older and the newer installed runtime could not be repaired." \
		"installed=${INSTALLED_VERSION:-unknown} published=${PUBLISHED_VERSION:-unknown}"
fi

if force_full_reinstall_requested; then
	install_event "force-reinstall" "started" \
		"Explicit full replacement bypassed same-release fast repair." \
		"version=$CANDIDATE_VERSION root=$ROOT"
elif repair_matching_release; then
	refresh_emergency_runtime
	install_progress 97 "Current verified release repaired without redownload"
	complete_install_experience "$(activation_phase)"
	exit 0
fi

install_progress 30 "Preparing full transactional replacement"
install_begin_step 2 3 "Installing the tunnel agent" "downloading and verifying the release" 30 90
stage_release_candidate
install_progress 68 "Release verified; proving candidate before promotion"
activate_release_candidate
refresh_emergency_runtime
install_progress 97 "Registration and guardian verified; finalizing"
install_begin_step 3 3 "Waking up your tunnel" "registration, guardian, and final checks" 90 100

if [ -f "$ROOT/config.json" ]; then
	project_root="$("$AWTSMOOS_NODE_BIN" -e "try{const c=require('$ROOT/config.json');process.stdout.write(c.root||process.cwd())}catch{process.stdout.write(process.cwd())}")"
	cleanup_disposable_state "$project_root"
fi

complete_install_experience "$(activation_phase)"
