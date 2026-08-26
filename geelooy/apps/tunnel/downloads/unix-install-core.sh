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
install_progress 20 "Preparing complete verified reinstall"
acquire_install_lock
persist_node_runtime "$ROOT"
resume_interrupted_install
rotate_runtime_logs
prune_displaced_runtimes
install_event "bootstrap" "started" \
	"Beginning identity-preserving complete tunnel reinstall." "$ROOT"
cleanup_disposable_state "$(pwd)"

install_progress 21 "Preserving durable identity and browser state"
migrate_dynamic_state
if ! load_release_metadata; then
	if recover_without_release_metadata; then
		complete_metadata_recovery
		exit 0
	fi
	install_fail "release-metadata" \
		"Published metadata is unavailable and every verified local recovery layer failed." \
		"origin=$origin root=$ROOT recovery=$RECOVERY_ROOT"
fi

apply_installed_version_policy
if version_policy_blocks_replacement; then
	if repair_matching_release; then
		refresh_emergency_runtime
		install_progress 97 "Current verified release repaired without redownload"
		complete_install_experience "$(activation_phase)"
		exit 0
	fi
	install_fail "version-policy" \
		"Published release is older and the newer installed runtime could not be repaired." \
		"installed=$INSTALLED_VERSION published=$PUBLISHED_VERSION"
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
stage_release_candidate
install_progress 68 "Release verified; proving candidate before promotion"
activate_release_candidate
refresh_emergency_runtime
install_progress 97 "Registration and guardian verified; finalizing"

if [ -f "$ROOT/config.json" ]; then
	project_root="$("$AWTSMOOS_NODE_BIN" -e "try{const c=require('$ROOT/config.json');process.stdout.write(c.root||process.cwd())}catch{process.stdout.write(process.cwd())}")"
	cleanup_disposable_state "$project_root"
fi

complete_install_experience "$(activation_phase)"
