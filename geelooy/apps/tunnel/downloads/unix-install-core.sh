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
source "$AWTSMOOS_INSTALL_RUNTIME/unix-package-io.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-package-config.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-process-runtime.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-process-control.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-package-stage.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-recovery-archive-list.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-recovery-retention.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-recovery-store.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-activation-state.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-activation-fresh.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-activation-rollback.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-activation.sh"

cleanup_failed_candidate() {
	local exit_code=$?
	if [ "$exit_code" -ne 0 ] && [ -n "$CANDIDATE_ROOT" ]; then
		rm -rf "$CANDIDATE_ROOT" "${CANDIDATE_ROOT}.downloads"
	fi
	exit "$exit_code"
}

trap cleanup_failed_candidate EXIT
install_event "bootstrap" "started" "Beginning transactional tunnel installation." "$ROOT"
cleanup_disposable_state "$(pwd)"
stage_release_candidate
activate_release_candidate

if [ -f "$ROOT/config.json" ]; then
	project_root="$(node -e "try{const c=require('$ROOT/config.json');process.stdout.write(c.root||process.cwd())}catch{process.stdout.write(process.cwd())}")"
	cleanup_disposable_state "$project_root"
fi

trap - EXIT
install_event "complete" "passed" "Awtsmoos Tunnel installation completed safely." \
	"version=$CANDIDATE_VERSION root=$ROOT"
