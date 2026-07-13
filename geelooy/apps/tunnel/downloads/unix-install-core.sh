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

source "$AWTSMOOS_INSTALL_RUNTIME/unix-cleanup.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-install-log.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-install-lock.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-log-retention.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-package-io.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-package-config.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-legacy-catalog.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-process-runtime.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-connection-health.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-legacy-fallback.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-process-control.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-package-stage.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-recovery-archive-list.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-recovery-retention.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-recovery-store.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-activation-state.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-activation-fresh.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-activation-rollback.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-activation.sh"

cleanup_install() {
	local exit_code=$?
	if [ "$exit_code" -ne 0 ] && [ -n "$CANDIDATE_ROOT" ]; then
		rm -rf "$CANDIDATE_ROOT" "${CANDIDATE_ROOT}.downloads"
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

complete_install() {
	local active_version
	local phase
	active_version="$(cat "$ROOT/install-state.txt" 2>/dev/null || printf 'unknown')"
	phase="$(activation_phase)"
	if skip_start_requested; then
		install_event "complete" "passed" \
			"Awtsmoos Tunnel files were verified; runtime start was intentionally skipped." \
			"activeVersion=$active_version candidateVersion=$CANDIDATE_VERSION phase=$phase root=$ROOT"
		return 0
	fi
	install_event "complete" "passed" \
		"Awtsmoos Tunnel installation ended with a guarded registered connection." \
		"activeVersion=$active_version candidateVersion=$CANDIDATE_VERSION phase=$phase root=$ROOT"
}

trap cleanup_install EXIT
acquire_install_lock
rotate_runtime_logs
prune_displaced_runtimes
install_event "bootstrap" "started" \
	"Beginning ACK-verified transactional tunnel installation." "$ROOT"
cleanup_disposable_state "$(pwd)"
stage_release_candidate
activate_release_candidate

if [ -f "$ROOT/config.json" ]; then
	project_root="$(node -e "try{const c=require('$ROOT/config.json');process.stdout.write(c.root||process.cwd())}catch{process.stdout.write(process.cwd())}")"
	cleanup_disposable_state "$project_root"
fi

release_install_lock
trap - EXIT
complete_install
