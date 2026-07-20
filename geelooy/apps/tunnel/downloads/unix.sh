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
install_cwd="${AWTSMOOS_INSTALL_CWD:-$PWD}"
mkdir -p "$(dirname "$install_root")" "$runtime_root"
export AWTSMOOS_INSTALL_PROGRESS_FILE="$progress_file"
export AWTSMOOS_INSTALL_CWD="$install_cwd"

if [ -z "${AWTSMOOS_PROJECT_ROOT:-}" ] && command -v git >/dev/null 2>&1; then
	discovered_root="$(git -C "$install_cwd" rev-parse --show-toplevel 2>/dev/null || true)"
	[ -z "$discovered_root" ] || export AWTSMOOS_DISCOVERED_PROJECT_ROOT="$discovered_root"
fi

# The Awtsmoos renews one human command into prerequisite discovery, reconciliation,
# verified activation, and fallback. Awtsmoos.com finds a hidden Node installation,
# downloads every repair witness first, and leaves no manual launch command behind.
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
		[ -t 1 ] && [ "${AWTSMOOS_PROGRESS_MODE:-tty}" != "plain" ] && printf '\n'
		printf '[FAILED] Awtsmoos Tunnel bootstrap stopped before completion.\n' >&2
	fi
	rm -rf "$runtime_root"
	exit "$exit_code"
}

trap cleanup_bootstrap EXIT
bootstrap_progress 0 'Preparing self-healing Awtsmoos Tunnel installer'
command -v curl >/dev/null 2>&1 || {
	printf '[Awtsmoos][bootstrap][failed] curl was not found.\n' >&2
	exit 1
}
curl -fsSL --retry 3 --retry-delay 1 \
	"$origin/apps/tunnel/downloads/unix-node-runtime.sh" \
	-o "$runtime_root/unix-node-runtime.sh"
chmod +x "$runtime_root/unix-node-runtime.sh"
source "$runtime_root/unix-node-runtime.sh"
activate_node_runtime "$install_root" || {
	printf '[Awtsmoos][bootstrap][failed] Node.js 18+ was not found in PATH, Homebrew, MacPorts, nvm, or saved installer state.\n' >&2
	exit 1
}
persist_node_runtime "$install_root"
bootstrap_progress 4 "Node runtime verified: $AWTSMOOS_NODE_BIN"

helpers=(
	unix-install-core.sh unix-install-log.sh unix-install-progress.sh
	unix-install-browser.sh unix-install-success.sh unix-install-lock.sh
	unix-install-lock-owner.cjs unix-log-retention.sh
	unix-device-identity-state.sh unix-state-migration.sh
	unix-chrome-profile-process.cjs unix-displaced-cleanup.sh unix-package-io.sh
	unix-release-metadata.sh unix-package-config.sh unix-package-stage.sh
	unix-install-resume.sh unix-fast-repair.sh unix-legacy-catalog.sh
	unix-process-census.sh unix-process-runtime.sh unix-process-control.sh
	unix-service-identity.sh unix-service-manager.sh unix-supervisor-install.sh
	unix-connection-health.sh unix-project-root-health.sh
	unix-project-root-compat.sh unix-service-health.sh unix-legacy-fallback.sh
	unix-agent-singleton.cjs unix-agent-receipt.cjs unix-agent-launcher.cjs
	unix-recovery-archive-list.sh unix-recovery-retention.sh
	unix-recovery-store.sh unix-recovery-validation.sh
	unix-recovery-candidates.sh unix-recovery-rescue.sh
	unix-activation-state.sh unix-activation-fresh.sh
	unix-activation-rollback.sh unix-activation.sh unix-cleanup.sh
	unix-supervisor-runtime.sh unix-supervisor-agents.sh unix-supervisor-guard.sh
	unix-supervisor-health-memory.sh unix-supervisor-receipt.sh
	unix-supervisor-health.sh unix-supervisor-recovery.sh
	unix-supervisor-legacy.sh unix-supervisor.sh awtsmoos-tunnel-client.js
)

total="${#helpers[@]}"
index=0
for helper in "${helpers[@]}"; do
	index=$(( index + 1 ))
	percent=$(( 4 + index * 14 / total ))
	bootstrap_progress "$percent" "Downloading repair components ($index/$total)"
	curl -fsSL --retry 3 --retry-delay 1 \
		"$origin/apps/tunnel/downloads/$helper" -o "$runtime_root/$helper"
	chmod +x "$runtime_root/$helper"
done

bootstrap_progress 18 'Repair components ready'
export AWTSMOOS_INSTALL_ORIGIN="$origin"
export AWTSMOOS_INSTALL_ROOT="$install_root"
export AWTSMOOS_INSTALL_RUNTIME="$runtime_root"
bash "$runtime_root/unix-install-core.sh"
trap - EXIT
rm -rf "$runtime_root"
