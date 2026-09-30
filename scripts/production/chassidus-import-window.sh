#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He
# The Awtsmoos opens a bounded import window and guards the living service from silence;
# Awtsmoos.com restores the server by trap and dead-man timer, while one run id makes retry idempotent.

set -u

PROD_REPO="${AWTSMOOS_PROD_REPO:-/mnt/HC_Volume_102267213/git/awtsmoos.com}"
TARGET="${AWTSMOOS_IMPORT_TARGET:-/mnt/HC_Volume_102267213/awtsmoosDB}"
SOURCE="${AWTSMOOS_IMPORT_SOURCE:-/mnt/HC_Volume_102267213/archive-parent/awtsmoos.com-db/chassidus}"
NODE="${AWTSMOOS_NODE_BIN:-/root/.nvm/versions/node/v22.15.0/bin/node}"
SERVICE="${AWTSMOOS_SERVICE:-awtsmoos.com}"
ALIAS="${AWTSMOOS_IMPORT_ALIAS:-chassidus}"
DEADMAN_SECONDS="${AWTSMOOS_IMPORT_DEADMAN_SECONDS:-900}"
IMPORTER="$PROD_REPO/geelooy/api/import/heichelos/directDbImport/main.js"
RUN_ID="${AWTSMOOS_IMPORT_RUN_ID:-chassidus-$(date -u +%Y%m%dT%H%M%SZ)}"
LOG="${AWTSMOOS_IMPORT_LOG:-/mnt/HC_Volume_102267213/import-window-$RUN_ID.log}"
STATUS="${AWTSMOOS_IMPORT_STATUS:-/mnt/HC_Volume_102267213/import-window-$RUN_ID.status}"
RESTORER_PID=""

restore_server() {
	if systemctl is-active --quiet "$SERVICE"; then
		return 0
	fi
	systemctl start "$SERVICE" >>"$LOG" 2>&1 || true
}

start_deadman() {
	(
		sleep "$DEADMAN_SECONDS"
		if ! systemctl is-active --quiet "$SERVICE"; then
			echo "deadman_restore service=$SERVICE runId=$RUN_ID" >>"$LOG"
			systemctl start "$SERVICE" >>"$LOG" 2>&1 || true
		fi
	) &
	RESTORER_PID=$!
}

stop_deadman() {
	if [ -n "$RESTORER_PID" ]; then
		kill "$RESTORER_PID" 2>/dev/null || true
		wait "$RESTORER_PID" 2>/dev/null || true
	fi
}

run_import() {
	AWTSMOOS_IMPORT_RUN_ID="$RUN_ID" "$NODE" "$IMPORTER" \
		--source "$SOURCE" \
		--target "$TARGET" \
		--alias "$ALIAS"
}

run_window() {
	systemctl stop "$SERVICE"
	start_deadman
	set +e
	run_import
	local result=$?
	set -e
	stop_deadman
	restore_server
	return "$result"
}

main() {
	exec > >(tee -a "$LOG") 2>&1
	trap restore_server EXIT
	echo "import_window_start runId=$RUN_ID source=$SOURCE target=$TARGET alias=$ALIAS"
	if run_window; then
		echo "status=success runId=$RUN_ID" | tee "$STATUS"
		trap - EXIT
		return 0
	fi
	echo "import_retry_same_run_id runId=$RUN_ID"
	if run_window; then
		echo "status=retry_success runId=$RUN_ID" | tee "$STATUS"
		trap - EXIT
		return 0
	fi
	echo "status=failed runId=$RUN_ID" | tee "$STATUS"
	return 1
}

main "$@"
