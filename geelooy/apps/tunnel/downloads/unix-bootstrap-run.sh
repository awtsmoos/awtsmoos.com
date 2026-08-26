#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

set -Eeuo pipefail

# The Awtsmoos draws verified helpers into the primary vessel after root truth is known;
# Awtsmoos.com lets Node, checksums, custody, and cleanup flow without borrowing a broken home.
origin="${AWTSMOOS_INSTALL_ORIGIN:?Installer origin is required.}"
install_root="${AWTSMOOS_INSTALL_ROOT:?Install root is required.}"
runtime_root="${AWTSMOOS_INSTALL_RUNTIME:?Installer runtime is required.}"
progress_file="$runtime_root/install-progress.state"
install_cwd="${AWTSMOOS_INSTALL_CWD:-$PWD}"
project_root="${AWTSMOOS_PROJECT_ROOT:-$install_cwd}"
custody_delegated=0

validate_absolute_path() {
	local selected="$1"
	case "$selected" in
		/*)
			return 0
			;;
		*)
			printf '[Awtsmoos][bootstrap][failed] Project paths must be absolute.\n' >&2
			return 1
			;;
	esac
}

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
	if [ "$custody_delegated" != "1" ]; then
		rm -rf "$runtime_root"
	fi
	exit "$exit_code"
}

fetch_bootstrap_file() {
	local name="$1"
	curl -fsSL --retry 5 --retry-delay 1 --connect-timeout 10 \
		--speed-time 30 --speed-limit 1024 \
		"$origin/apps/tunnel/downloads/$name" -o "$runtime_root/$name"
	chmod +x "$runtime_root/$name"
}

validate_absolute_path "$install_cwd"
validate_absolute_path "$project_root"
export AWTSMOOS_INSTALL_PROGRESS_FILE="$progress_file"
export AWTSMOOS_INSTALL_CWD="$install_cwd"
export AWTSMOOS_PROJECT_ROOT="$project_root"
trap cleanup_bootstrap EXIT
bootstrap_progress 0 'Preparing Awtsmoos Tunnel install or repair'
fetch_bootstrap_file unix-node-runtime.sh & node_fetch_pid=$!
fetch_bootstrap_file unix-bootstrap-components.sh & components_fetch_pid=$!
fetch_bootstrap_file unix-bootstrap-components-download.sh & download_fetch_pid=$!
wait "$node_fetch_pid"
wait "$components_fetch_pid"
wait "$download_fetch_pid"
source "$runtime_root/unix-node-runtime.sh"
if ! activate_node_runtime "$install_root"; then
	printf '[Awtsmoos][bootstrap][failed] Node.js 18+ was not found.\n' >&2
	exit 1
fi
persist_node_runtime "$install_root"
bootstrap_progress 4 "Node runtime verified: $AWTSMOOS_NODE_BIN"
source "$runtime_root/unix-bootstrap-components.sh"
download_installer_components
bootstrap_progress 18 'Verified installer components ready'
recovery_root="${AWTSMOOS_RECOVERY_ROOT:-${install_root}-recovery}"
custody_delegated=1
set +e
"$AWTSMOOS_NODE_BIN" "$runtime_root/unix-install-custody.cjs" delegate \
	"$runtime_root/unix-install-core.sh" "$runtime_root" "$recovery_root" "$install_cwd"
install_status=$?
set -e
trap - EXIT
rm -rf "$runtime_root"
exit "$install_status"
