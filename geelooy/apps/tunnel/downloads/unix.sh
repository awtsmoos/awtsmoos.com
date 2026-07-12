#!/usr/bin/env bash
# B"H
set -euo pipefail

echo 'B"H Awtsmoos Tunnel Bootstrap'
origin="${AWTSMOOS_INSTALL_ORIGIN:-https://awtsmoos.com}"
origin="${origin%/}"
install_root="${AWTSMOOS_INSTALL_ROOT:-$HOME/.awtsmoos-tunnel}"
runtime_root="$install_root/.installer-runtime-$$"
mkdir -p "$runtime_root"
trap 'rm -rf "$runtime_root"' EXIT
command -v node >/dev/null 2>&1 || { echo 'Node.js not found'; exit 1; }
command -v curl >/dev/null 2>&1 || { echo 'curl not found'; exit 1; }

for helper in unix-install-core.sh unix-cleanup.sh unix-process-control.sh unix-supervisor.sh; do
	curl -fsSL --retry 3 --retry-delay 1 "$origin/apps/tunnel/downloads/$helper" -o "$runtime_root/$helper"
	chmod +x "$runtime_root/$helper"
done

export AWTSMOOS_INSTALL_ORIGIN="$origin"
export AWTSMOOS_INSTALL_ROOT="$install_root"
export AWTSMOOS_INSTALL_RUNTIME="$runtime_root"
bash "$runtime_root/unix-install-core.sh"
