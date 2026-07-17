#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos renews one executable path beneath bootstrap, launchd, and supervisor.
# Awtsmoos.com remembers the exact working Node binary and prepends its directory to
# PATH without wrapping it in a shell function, so background PID equals runtime PID.

node_state_path() {
	local root="${1:-${ROOT:-${AWTSMOOS_INSTALL_ROOT:-$HOME/.awtsmoos-tunnel}}}"
	printf '%s\n' "${AWTSMOOS_RECOVERY_ROOT:-${root}-recovery}/state/node-bin.path"
}

node_candidate_paths() {
	local root="${1:-${ROOT:-${AWTSMOOS_INSTALL_ROOT:-$HOME/.awtsmoos-tunnel}}}"
	local remembered=""
	remembered="$(cat "$(node_state_path "$root")" 2>/dev/null || true)"
	[ -n "$remembered" ] && printf '%s\n' "$remembered"
	[ -n "${AWTSMOOS_NODE_BIN:-}" ] && printf '%s\n' "$AWTSMOOS_NODE_BIN"
	command -v node 2>/dev/null || true
	printf '%s\n' \
		/opt/homebrew/bin/node \
		/usr/local/bin/node \
		/usr/local/opt/node/bin/node \
		/opt/local/bin/node \
		/usr/bin/node
	for candidate in "$HOME"/.nvm/versions/node/*/bin/node; do
		[ -e "$candidate" ] && printf '%s\n' "$candidate"
	done
}

resolve_node_bin() {
	local root="${1:-${ROOT:-${AWTSMOOS_INSTALL_ROOT:-$HOME/.awtsmoos-tunnel}}}"
	local candidate=""
	while IFS= read -r candidate; do
		[ -x "$candidate" ] || continue
		if "$candidate" -e 'process.exit(Number(process.versions.node.split(".")[0]) >= 18 ? 0 : 1)' \
			>/dev/null 2>&1; then
			printf '%s\n' "$candidate"
			return 0
		fi
	done < <(node_candidate_paths "$root")
	return 1
}

activate_node_runtime() {
	local root="${1:-${ROOT:-${AWTSMOOS_INSTALL_ROOT:-$HOME/.awtsmoos-tunnel}}}"
	local selected="$(resolve_node_bin "$root" || true)"
	[ -n "$selected" ] || return 1
	AWTSMOOS_NODE_BIN="$selected"
	export AWTSMOOS_NODE_BIN
	PATH="$(dirname "$selected"):${PATH:-/usr/local/bin:/usr/bin:/bin}"
	export PATH
	[ "$(command -v node 2>/dev/null || true)" = "$selected" ] || return 1
	return 0
}

run_node() {
	"$AWTSMOOS_NODE_BIN" "$@"
}

persist_node_runtime() {
	local root="${1:-${ROOT:-${AWTSMOOS_INSTALL_ROOT:-$HOME/.awtsmoos-tunnel}}}"
	local state="$(node_state_path "$root")"
	local temporary="${state}.tmp-$$"
	[ -x "${AWTSMOOS_NODE_BIN:-}" ] || activate_node_runtime "$root" || return 1
	mkdir -p "$(dirname "$state")"
	printf '%s\n' "$AWTSMOOS_NODE_BIN" > "$temporary"
	chmod 600 "$temporary"
	mv -f "$temporary" "$state"
}
