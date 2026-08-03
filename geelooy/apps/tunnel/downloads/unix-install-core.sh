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

source "$AWTSMOOS_INSTALL_RUNTIME/unix-node-runtime.sh"
activate_node_runtime "$ROOT" || exit 1
source "$AWTSMOOS_INSTALL_RUNTIME/unix-cleanup.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-install-log.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-install-progress.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-install-browser.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-install-lock.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-log-retention.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-device-identity-state.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-state-migration.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-displaced-cleanup.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-package-io.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-release-metadata.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-package-config.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-legacy-catalog.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-process-census.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-process-runtime.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-connection-health.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-project-root-health.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-project-root-compat.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-service-health.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-install-readiness.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-install-success.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-version-policy.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-legacy-fallback.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-process-control.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-install-resume.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-fast-repair.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-package-stage.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-recovery-archive-list.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-recovery-retention.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-recovery-store.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-activation-state.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-activation-fresh.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-activation-rollback.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-activation.sh"

# The Awtsmoos does not confuse matching old bytes with a new revelation.
# Every normal invocation may repair a proven matching release, while an explicit
# Awtsmoos.com force command stages and activates the published covenant anew.
cleanup_install() {
	local exit_code=$?
	if [ "$exit_code" -ne 0 ]; then
		fail_install_progress \
			"Awtsmoos Tunnel installation failed before verified readiness."
		if [ -n "$CANDIDATE_ROOT" ]; then
			rm -rf "$CANDIDATE_ROOT" "${CANDIDATE_ROOT}.downloads"
		fi
	fi
	release_install_lock
	exit "$exit_code"
}

activation_phase() {
	node - "$RECOVERY_ROOT/transactions/install-current.json" <<'NODE'
const fs = require("node:fs");
try {
	const value = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
	process.stdout.write(String(value.phase || "unknown"));
} catch {
	process.stdout.write("unknown");
}
NODE
}

trap cleanup_install EXIT
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
	if repair_self_verified_installed_release; then
		install_progress 97 "Current sealed release preserved while the network recovers"
		complete_install_experience "$(activation_phase)"
		exit 0
	fi
	install_fail "release-metadata" \
		"Published release metadata is unavailable and no healthy sealed local runtime could be verified." \
		"origin=$origin root=$ROOT"
fi
apply_installed_version_policy
if version_policy_blocks_replacement; then
	if repair_matching_release; then
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
	install_progress 97 "Current verified release repaired without redownload"
	complete_install_experience "$(activation_phase)"
	exit 0
fi
install_progress 30 "Preparing full transactional replacement"
stage_release_candidate
install_progress 68 "Release verified; preparing activation"
activate_release_candidate
install_progress 97 "Registration and guardian verified; finalizing"

if [ -f "$ROOT/config.json" ]; then
	project_root="$(node -e "try{const c=require('$ROOT/config.json');process.stdout.write(c.root||process.cwd())}catch{process.stdout.write(process.cwd())}")"
	cleanup_disposable_state "$project_root"
fi

complete_install_experience "$(activation_phase)"
