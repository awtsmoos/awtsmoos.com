#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

set -u

# The Awtsmoos returns only to a world that truly lived, with Node found beyond PATH;
# Awtsmoos.com carries that Node path into every child so recovery remains a durable math.
LIVE="${AWTSMOOS_PRIMARY_INSTALL_ROOT:-$HOME/.awtsmoos-tunnel}"
RECOVERY="${AWTSMOOS_RECOVERY_ROOT:-$HOME/.awtsmoos-tunnel-recovery}"
SEALED_AWT="$RECOVERY/emergency-runtime/current/scripts/awt.cjs"
LIVE_AWT="$LIVE/scripts/awt.cjs"

resolve_recovery_node() {
	local persisted="$RECOVERY/state/node-bin.path"
	local candidate=""
	if [ -n "${AWTSMOOS_NODE_BIN:-}" ] && [ -x "$AWTSMOOS_NODE_BIN" ]; then
		printf '%s\n' "$AWTSMOOS_NODE_BIN"
		return 0
	fi
	if [ -f "$persisted" ]; then
		candidate="$(cat "$persisted" 2>/dev/null || true)"
		if [ -x "$candidate" ]; then
			printf '%s\n' "$candidate"
			return 0
		fi
	fi
	command -v node 2>/dev/null
}

NODE_BIN="$(resolve_recovery_node 2>/dev/null || true)"
if [ -z "$NODE_BIN" ]; then
	printf '%s\n' "ERROR no_node_runtime" >&2
	exit 43
fi
if [ -f "$SEALED_AWT" ]; then
	CONTROL="$SEALED_AWT"
elif [ -f "$LIVE_AWT" ]; then
	CONTROL="$LIVE_AWT"
else
	printf '%s\n' "ERROR no_recovery_control_runtime" >&2
	exit 44
fi

export AWTSMOOS_NODE_BIN="$NODE_BIN"
export AWTSMOOS_RECOVERY_ROOT="$RECOVERY"
export PATH="$(dirname "$NODE_BIN"):${PATH:-/usr/local/bin:/usr/bin:/bin}"
exec "$NODE_BIN" "$CONTROL" known-good \
	--root="$LIVE" \
	--recovery-root="$RECOVERY" \
	--confirm \
	--json
