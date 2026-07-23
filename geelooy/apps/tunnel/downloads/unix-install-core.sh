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
source "$AWTSMOOS_INSTALL_RUNTIME/unix-package-stage.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-recovery-archive-list.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-recovery-retention.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-recovery-store.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-activation-state.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-activation-fresh.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-activation-rollback.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-activation.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-fast-repair.sh"

# One lock now encloses discovery, activation, and the last readiness testimony.
# The Awtsmoos permits no second installer to enter between ninety-seven and one
# hundred percent, when the living tunnel is most vulnerable to a false eclipse.
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
install_progress 20 "Preparing one-command repair"
acquire_install_lock
persist_node_runtime "$ROOT"
resume_interrupted_install
rotate_runtime_logs
prune_displaced_runtimes
install_event "bootstrap" "started" \
	"Beginning identity-preserving one-command tunnel repair." "$ROOT"
cleanup_disposable_state "$(pwd)"

install_progress 21 "Preserving identity and browser state"
migrate_dynamic_state
load_release_metadata
apply_installed_version_policy
if ! repair_matching_release; then
	if version_policy_blocks_replacement; then
		install_fail "version-policy" \
			"The newer local runtime could not be repaired; downgrade remained blocked." \
			"installed=$CANDIDATE_VERSION published=$PUBLISHED_VERSION"
	fi
	install_progress 30 "Preparing full transactional replacement"
	stage_release_candidate
	install_progress 68 "Release verified; preparing activation"
	activate_release_candidate
fi
install_progress 97 "Registration, root, and guardian verified; finalizing"

if [ -f "$ROOT/config.json" ]; then
	project_root="$(node -e "try{const c=require('$ROOT/config.json');process.stdout.write(c.root||process.cwd())}catch{process.stdout.write(process.cwd())}")"
	cleanup_disposable_state "$project_root"
fi

complete_install_experience "$(activation_phase)"
