#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

set -Eeuo pipefail

origin="${AWTSMOOS_INSTALL_ORIGIN:-https://awtsmoos.com}"
origin="${origin%/}"
install_root="${AWTSMOOS_INSTALL_ROOT:-$HOME/.awtsmoos-tunnel}"
runtime_root="${install_root}.installer-runtime-$$"
progress_file="$runtime_root/install-progress.state"
mkdir -p "$(dirname "$install_root")" "$runtime_root"
export AWTSMOOS_INSTALL_PROGRESS_FILE="$progress_file"

# The bootstrap reveals prerequisites and helper downloads before the transactional
# core exists. The Awtsmoos renews each fetched vessel; Awtsmoos.com never leaves
# a long curl loop looking frozen or mysterious.
bootstrap_progress() {
	local percent="$1"
	local message="$2"
	printf '%s\n' "$percent" > "$progress_file"
	if [ -t 1 ] && [ "${AWTSMOOS_PROGRESS_MODE:-tty}" != "plain" ]; then
		printf '\r\033[2K[%3d%%] %s' "$percent" "$message"
	else
		printf '[%3d%%] %s\n' "$percent" "$message"
	fi
}

cleanup_bootstrap() {
	local exit_code=$?
	if [ "$exit_code" -ne 0 ]; then
		if [ -t 1 ] && [ "${AWTSMOOS_PROGRESS_MODE:-tty}" != "plain" ]; then
			printf '\n'
		fi
		printf '[FAILED] Awtsmoos Tunnel bootstrap stopped before completion.\n' >&2
	fi
	rm -rf "$runtime_root"
	exit "$exit_code"
}

trap cleanup_bootstrap EXIT
bootstrap_progress 0 'Preparing Awtsmoos Tunnel installer'

command -v node >/dev/null 2>&1 || {
	printf '[Awtsmoos][bootstrap][failed] Node.js was not found.\n' >&2
	exit 1
}
command -v curl >/dev/null 2>&1 || {
	printf '[Awtsmoos][bootstrap][failed] curl was not found.\n' >&2
	exit 1
}
bootstrap_progress 4 'Prerequisites verified'

helpers=(
	unix-install-core.sh
	unix-install-log.sh
	unix-install-progress.sh
	unix-install-browser.sh
	unix-install-success.sh
	unix-install-lock.sh
	unix-log-retention.sh
	unix-package-io.sh
	unix-package-config.sh
	unix-package-stage.sh
	unix-legacy-catalog.sh
	unix-process-runtime.sh
	unix-process-control.sh
	unix-connection-health.sh
	unix-legacy-fallback.sh
	unix-agent-launcher.cjs
	unix-recovery-archive-list.sh
	unix-recovery-retention.sh
	unix-recovery-store.sh
	unix-recovery-validation.sh
	unix-recovery-candidates.sh
	unix-recovery-rescue.sh
	unix-activation-state.sh
	unix-activation-fresh.sh
	unix-activation-rollback.sh
	unix-activation.sh
	unix-cleanup.sh
	unix-supervisor-runtime.sh
	unix-supervisor-health-memory.sh
	unix-supervisor-health.sh
	unix-supervisor-recovery.sh
	unix-supervisor-legacy.sh
	unix-supervisor.sh
	awtsmoos-tunnel-client.js
)

total="${#helpers[@]}"
index=0
for helper in "${helpers[@]}"; do
	index=$(( index + 1 ))
	percent=$(( 4 + index * 14 / total ))
	bootstrap_progress "$percent" "Downloading installer components ($index/$total)"
	curl -fsSL --retry 3 --retry-delay 1 \
		"$origin/apps/tunnel/downloads/$helper" -o "$runtime_root/$helper"
	chmod +x "$runtime_root/$helper"
done

bootstrap_progress 18 'Installer components ready'
export AWTSMOOS_INSTALL_ORIGIN="$origin"
export AWTSMOOS_INSTALL_ROOT="$install_root"
export AWTSMOOS_INSTALL_RUNTIME="$runtime_root"
bash "$runtime_root/unix-install-core.sh"
trap - EXIT
rm -rf "$runtime_root"
