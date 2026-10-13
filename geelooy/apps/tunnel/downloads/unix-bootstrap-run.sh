#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

set -Eeuo pipefail

# The Awtsmoos draws verified helpers into the primary vessel after root truth is known;
# Awtsmoos.com keeps every bootstrap fetch on one bounded, quiet recovery law.
origin="${AWTSMOOS_INSTALL_ORIGIN:?Installer origin is required.}"
install_root="${AWTSMOOS_INSTALL_ROOT:?Install root is required.}"
runtime_root="${AWTSMOOS_INSTALL_RUNTIME:?Installer runtime is required.}"
progress_file="$runtime_root/install-progress.state"
install_cwd="${AWTSMOOS_INSTALL_CWD:-$PWD}"
custody_delegated=0
bootstrap_cancelled=0
source "$runtime_root/unix-bootstrap-fetch.sh"

# --- Clever terminal presentation (Yaakov 2026-10-11) ---
if [ -t 2 ] && [ "${NO_COLOR:-}" != "1" ] && [ "${TERM:-}" != "dumb" ]; then
	BST_C_GOLD=$'\033[1;33m'; BST_C_GREEN=$'\033[1;32m'; BST_C_RED=$'\033[1;31m'
	BST_C_CYAN=$'\033[1;36m'; BST_C_DIM=$'\033[2m'; BST_C_OFF=$'\033[0m'
else
	BST_C_GOLD=''; BST_C_GREEN=''; BST_C_RED=''; BST_C_CYAN=''; BST_C_DIM=''; BST_C_OFF=''
fi
bst_ok()   { printf '%s✓%s %s\n'   "$BST_C_GREEN" "$BST_C_OFF" "$1" >&2; }
bst_fail() { printf '%s✕%s %s\n'   "$BST_C_RED" "$BST_C_OFF" "$1" >&2; }

# --- Graceful Ctrl+C: kill background fetches, clean up, exit 130 ---
on_bootstrap_interrupt() {
	bootstrap_cancelled=1
	printf '\n' >&2
	printf '%s✕  Cancelled by user (Ctrl+C).%s Cleaning up…\n' "$BST_C_GOLD" "$BST_C_OFF" >&2
	jobs -p 2>/dev/null | xargs -r kill 2>/dev/null
	[ "$custody_delegated" = "1" ] || rm -rf "$runtime_root"
	printf '%sNothing was installed or changed.%s\n' "$BST_C_DIM" "$BST_C_OFF" >&2
	exit 130
}
trap on_bootstrap_interrupt INT TERM

# --- Install mode (Yaakov 2026-10-12): announce + fast pre-checks ---
AWT_INSTALL_MODE="${AWTSMOOS_INSTALL_MODE:-full}"
case "$AWT_INSTALL_MODE" in
	full|minimal|agent-only) ;;
	*) AWT_INSTALL_MODE="full" ;;
esac
export AWTSMOOS_INSTALL_MODE="$AWT_INSTALL_MODE"
if [ "$AWT_INSTALL_MODE" != "full" ]; then
	printf '%sInstall mode: %s%s\n' "$BST_C_GOLD" "$AWT_INSTALL_MODE" "$BST_C_OFF" >&2
	if ! command -v node >/dev/null 2>&1 || \
	   ! node -e 'process.exit(Number(process.versions.node.split(".")[0]) >= 18 ? 0 : 1)' >/dev/null 2>&1; then
		bst_fail "The '$AWT_INSTALL_MODE' mode needs your system Node.js 18+ and none was found."
		printf 'Install Node.js 18+ first, or run again without --minimal/--agent-only for the full install.\n' >&2
		rm -rf "$runtime_root"
		exit 1
	fi
	printf '%sSystem Node.js 18+ found; continuing in %s mode.%s\n' "$BST_C_DIM" "$AWT_INSTALL_MODE" "$BST_C_OFF" >&2
fi

validate_absolute_path() {
	local selected="$1"
	case "$selected" in
		/*) return 0 ;;
		*) printf '[Awtsmoos][bootstrap][failed] Project paths must be absolute.\n' >&2; return 1 ;;
	esac
}

existing_project_root() {
	local config_file="$install_root/config.json"
	[ -f "$config_file" ] && [ ! -L "$config_file" ] || return 1
	node - "$config_file" <<'NODE'
const fs = require("node:fs");
const path = require("node:path");
try {
	const value = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
	const root = String(value.root || "").trim();
	if (!root || !path.isAbsolute(root)) process.exit(1);
	process.stdout.write(root);
} catch {
	process.exit(1);
}
NODE
}

select_project_root() {
	if [ -n "${AWTSMOOS_PROJECT_ROOT:-}" ]; then
		printf '%s\n' "$AWTSMOOS_PROJECT_ROOT"
		return 0
	fi
	local preserved=""
	preserved="$(existing_project_root 2>/dev/null || true)"
	if [ -n "$preserved" ]; then
		printf '%s\n' "$preserved"
		return 0
	fi
	printf '%s\n' "$install_cwd"
}

bootstrap_progress() {
	local percent="$1" message="$2"
	printf '%s\n' "$percent" > "$progress_file"
	if [ -t 1 ] && [ "${AWTSMOOS_PROGRESS_MODE:-tty}" != "plain" ]; then
		printf '\r%s\033[2K[%3d%%]%s %s' "$BST_C_CYAN" "$percent" "$BST_C_OFF" "$message"
	else
		printf '[%3d%%] %s\n' "$percent" "$message"
	fi
}

cleanup_bootstrap() {
	local exit_code=$?
	if [ "$bootstrap_cancelled" = "1" ]; then
		exit 130
	fi
	if [ "$exit_code" -ne 0 ]; then
		[ ! -t 1 ] || [ "${AWTSMOOS_PROGRESS_MODE:-tty}" = "plain" ] || printf '\n'
		bst_fail 'Awtsmoos Tunnel bootstrap stopped before completion; existing verified runtime was not replaced.'
	fi
	[ "$custody_delegated" = "1" ] || rm -rf "$runtime_root"
	exit "$exit_code"
}

fetch_bootstrap_file() {
	local name="$1"
	bootstrap_fetch "$origin/apps/tunnel/downloads/$name" "$runtime_root/$name" "$name"
	chmod +x "$runtime_root/$name"
}

project_root="$(select_project_root)"
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
	bst_fail 'Node.js 18+ was not found.'
	exit 1
fi
persist_node_runtime "$install_root"
bootstrap_progress 4 "Node runtime verified: $AWTSMOOS_NODE_BIN"
source "$runtime_root/unix-bootstrap-components.sh"
download_installer_components
bootstrap_progress 18 'Verified installer components ready'
[ -t 1 ] && printf '\n'
bst_ok 'Verified installer components ready'
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
