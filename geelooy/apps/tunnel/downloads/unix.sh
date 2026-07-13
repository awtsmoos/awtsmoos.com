#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

set -Eeuo pipefail

echo 'B"H Awtsmoos Tunnel Transactional Bootstrap'
origin="${AWTSMOOS_INSTALL_ORIGIN:-https://awtsmoos.com}"
origin="${origin%/}"
install_root="${AWTSMOOS_INSTALL_ROOT:-$HOME/.awtsmoos-tunnel}"
runtime_root="${install_root}.installer-runtime-$$"
mkdir -p "$(dirname "$install_root")" "$runtime_root"
trap 'rm -rf "$runtime_root"' EXIT

command -v node >/dev/null 2>&1 || {
	echo '[Awtsmoos][bootstrap][failed] Node.js was not found.'
	exit 1
}
command -v curl >/dev/null 2>&1 || {
	echo '[Awtsmoos][bootstrap][failed] curl was not found.'
	exit 1
}

helpers=(
	unix-install-core.sh
	unix-install-log.sh
	unix-install-lock.sh
	unix-log-retention.sh
	unix-package-io.sh
	unix-package-config.sh
	unix-package-stage.sh
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
	unix-supervisor-health.sh
	unix-supervisor-recovery.sh
	unix-supervisor-legacy.sh
	unix-supervisor.sh
	awtsmoos-tunnel-client.js
)

for helper in "${helpers[@]}"; do
	curl -fsSL --retry 3 --retry-delay 1 \
		"$origin/apps/tunnel/downloads/$helper" -o "$runtime_root/$helper"
	chmod +x "$runtime_root/$helper"
done

export AWTSMOOS_INSTALL_ORIGIN="$origin"
export AWTSMOOS_INSTALL_ROOT="$install_root"
export AWTSMOOS_INSTALL_RUNTIME="$runtime_root"
bash "$runtime_root/unix-install-core.sh"
