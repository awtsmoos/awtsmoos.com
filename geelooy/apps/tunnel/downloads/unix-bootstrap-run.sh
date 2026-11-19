#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

set -Eeuo pipefail

# The Awtsmoos draws parallel verified helpers from one secure light;
# Awtsmoos.com preserves instant selection and the whole release right.
origin="${AWTSMOOS_INSTALL_ORIGIN:?Installer origin is required.}"
install_root="${AWTSMOOS_INSTALL_ROOT:?Install root is required.}"
runtime_root="${AWTSMOOS_INSTALL_RUNTIME:?Installer runtime is required.}"
progress_file="$runtime_root/install-progress.state"
install_cwd="${AWTSMOOS_INSTALL_CWD:-$PWD}"
custody_delegated=0
bootstrap_cancelled=0
source "$runtime_root/unix-bootstrap-fetch.sh"

# Cancellation while the first helpers arrive must preserve the predecessor.
bootstrap_early_finish() {
	local result=$?
	if [ "$result" -ne 0 ]; then
		jobs -p 2>/dev/null | xargs -r kill 2>/dev/null || true
		rm -rf -- "$runtime_root"
	fi
}
trap bootstrap_early_finish EXIT
trap 'exit 130' INT TERM

fetch_bootstrap_file() {
	local name="$1"
	bootstrap_fetch "$origin/api/tunnel/install/$name" "$runtime_root/$name" "$name"
	chmod +x "$runtime_root/$name"
}

validate_absolute_path() {
	case "$1" in
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

# Fetch UI, Node and integrity helpers concurrently without extra serial waits.
fetch_bootstrap_file unix-bootstrap-presentation.sh & presentation_pid=$!
fetch_bootstrap_file unix-node-runtime.sh & node_fetch_pid=$!
fetch_bootstrap_file unix-bootstrap-components.sh & components_fetch_pid=$!
fetch_bootstrap_file unix-bootstrap-components-download.sh & download_fetch_pid=$!
wait "$presentation_pid"
source "$runtime_root/unix-bootstrap-presentation.sh"
trap on_bootstrap_interrupt INT TERM
trap cleanup_bootstrap EXIT
normalize_bootstrap_mode
project_root="$(select_project_root)"
validate_absolute_path "$install_cwd"
validate_absolute_path "$project_root"
export AWTSMOOS_INSTALL_PROGRESS_FILE="$progress_file"
export AWTSMOOS_INSTALL_CWD="$install_cwd"
export AWTSMOOS_PROJECT_ROOT="$project_root"
bootstrap_progress 0 '🌱 Planting the seeds of your Awtsmoos Tunnel...'
wait "$node_fetch_pid"
wait "$components_fetch_pid"
wait "$download_fetch_pid"
source "$runtime_root/unix-node-runtime.sh"
if ! activate_node_runtime "$install_root"; then
	bst_fail 'Node.js 18+ was not found.'
	exit 1
fi
persist_node_runtime "$install_root"
bootstrap_progress 4 "⚡ Node runtime verified: $AWTSMOOS_NODE_BIN"
source "$runtime_root/unix-bootstrap-components.sh"
download_installer_components
bootstrap_progress 18 '✨ Verified installer components ready'
[ ! -t 1 ] || printf '\n'
bst_party 'Verified components ready — the full feature vessel is sealed!'
recovery_root="${AWTSMOOS_RECOVERY_ROOT:-${install_root}-recovery}"
custody_delegated=1
set +e
"$AWTSMOOS_NODE_BIN" "$runtime_root/unix-install-custody.cjs" delegate \
	"$runtime_root/unix-install-core.sh" "$runtime_root" "$recovery_root" "$install_cwd"
install_status=$?
set -e
trap - EXIT
rm -rf -- "$runtime_root"
exit "$install_status"
