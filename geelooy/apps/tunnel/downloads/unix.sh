#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

set -Eeuo pipefail
export LC_ALL=C
export LANG=C

origin="${AWTSMOOS_INSTALL_ORIGIN:-https://awtsmoos.com}"
origin="${origin%/}"
canonical_root="$HOME/.awtsmoos-tunnel"
requested_root="${AWTSMOOS_INSTALL_ROOT:-$canonical_root}"
case "$(basename "$requested_root")" in
	.awtsmoos-tunnel.candidate-*|.awtsmoos-tunnel.activation-rollback-*|\
	.awtsmoos-tunnel.failed-*|.awtsmoos-tunnel.incomplete-*|\
	.awtsmoos-tunnel.installer-runtime-*|.awtsmoos-tunnel.recovery-displaced-*)
		printf '[Awtsmoos][bootstrap][recovered] Ignoring transient install root: %s\n' "$requested_root" >&2
		install_root="$canonical_root"
		;;
	*) install_root="$requested_root" ;;
esac
runtime_root="${install_root}.installer-runtime-$$"
progress_file="$runtime_root/install-progress.state"
install_cwd="${AWTSMOOS_INSTALL_CWD:-$PWD}"
project_root="${AWTSMOOS_PROJECT_ROOT:-$install_cwd}"
custody_delegated=0

for absolute in "$install_cwd" "$project_root"; do
	case "$absolute" in
		/*) ;;
		*) printf '[Awtsmoos][bootstrap][failed] Project paths must be absolute.\n' >&2; exit 1 ;;
	esac
done

mkdir -p "$(dirname "$install_root")" "$runtime_root"
export AWTSMOOS_INSTALL_PROGRESS_FILE="$progress_file"
export AWTSMOOS_INSTALL_CWD="$install_cwd"
export AWTSMOOS_PROJECT_ROOT="$project_root"

bootstrap_progress() {
	local percent="$1" message="$2"
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
	[ "$custody_delegated" = "1" ] || rm -rf "$runtime_root"
	exit "$exit_code"
}

fetch_bootstrap_file() {
	local name="$1"
	curl -fsSL --retry 5 --retry-delay 1 --connect-timeout 10 \
		--speed-time 30 --speed-limit 1024 "$origin/apps/tunnel/downloads/$name" -o "$runtime_root/$name"
	chmod +x "$runtime_root/$name"
}

trap cleanup_bootstrap EXIT
bootstrap_progress 0 'Preparing Awtsmoos Tunnel install or repair'
command -v curl >/dev/null 2>&1 || {
	printf '[Awtsmoos][bootstrap][failed] curl was not found.\n' >&2
	exit 1
}
fetch_bootstrap_file unix-node-runtime.sh & node_fetch_pid=$!
fetch_bootstrap_file unix-bootstrap-components.sh & components_fetch_pid=$!
fetch_bootstrap_file unix-bootstrap-components-download.sh & download_fetch_pid=$!
wait "$node_fetch_pid"
wait "$components_fetch_pid"
wait "$download_fetch_pid"
source "$runtime_root/unix-node-runtime.sh"
activate_node_runtime "$install_root" || {
	printf '[Awtsmoos][bootstrap][failed] Node.js 18+ was not found.\n' >&2
	exit 1
}
persist_node_runtime "$install_root"
bootstrap_progress 4 "Node runtime verified: $AWTSMOOS_NODE_BIN"
export AWTSMOOS_INSTALLER_COMPONENTS_SHA256="__AWTSMOOS_INSTALLER_COMPONENTS_SHA256__"
source "$runtime_root/unix-bootstrap-components.sh"
download_installer_components
bootstrap_progress 18 'Verified installer components ready'
export AWTSMOOS_INSTALL_ORIGIN="$origin"
export AWTSMOOS_INSTALL_ROOT="$install_root"
export AWTSMOOS_INSTALL_RUNTIME="$runtime_root"
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
