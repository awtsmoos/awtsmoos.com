#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

set -u

# The Awtsmoos reveals the wound before the hand moves; Awtsmoos.com reads durable
# Node testimony first, and never mistakes the emergency garment for the primary word.
LIVE="${AWTSMOOS_PRIMARY_INSTALL_ROOT:-$HOME/.awtsmoos-tunnel}"
RECOVERY="${AWTSMOOS_RECOVERY_ROOT:-$HOME/.awtsmoos-tunnel-recovery}"
SEALED="$RECOVERY/emergency-runtime/current"
LAUNCHER="$SEALED/recovery/sealedEmergencyLauncher.js"
CONTROL="$SEALED/scripts/emergency-control.cjs"

resolve_node() {
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

print_boolean() {
	if "$@"; then
		printf '%s\n' true
	else
		printf '%s\n' false
	fi
}

NODE_BIN="$(resolve_node 2>/dev/null || true)"
if [ -n "$NODE_BIN" ] && [ -f "$LIVE/scripts/awt.cjs" ]; then
	exec "$NODE_BIN" "$LIVE/scripts/awt.cjs" diagnose \
		--root="$LIVE" --recovery-root="$RECOVERY" --json
fi

printf '%s\n' 'B"H'
printf '%s\n' "state=offline_fallback_diagnosis"
printf '%s\n' "live_root=$LIVE"
printf '%s\n' "recovery_root=$RECOVERY"
printf '%s\n' "node_bin=${NODE_BIN:-missing}"
printf '%s\n' "live_exists=$(print_boolean test -d "$LIVE")"
printf '%s\n' "sealed_exists=$(print_boolean test -d "$SEALED")"
printf '%s\n' "sealed_launcher=$(print_boolean test -f "$LAUNCHER")"
printf '%s\n' "sealed_control=$(print_boolean test -f "$CONTROL")"

for label in supervisor agent emergency; do
	case "$label" in
		supervisor)
			file="$LIVE/supervisor.pid"
			;;
		agent)
			file="$LIVE/agent.pid"
			;;
		emergency)
			file="$RECOVERY/emergency-runtime/emergency.pid"
			;;
	esac
	pid="$(cat "$file" 2>/dev/null || true)"
	alive=false
	if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
		alive=true
	fi
	printf '%s\n' "$label.pid=${pid:-none}"
	printf '%s\n' "$label.alive=$alive"
done

if [ -n "$NODE_BIN" ] && [ -f "$CONTROL" ]; then
	printf '%s\n' "--- sealed-slot-status ---"
	"$NODE_BIN" "$CONTROL" status "$SEALED" "$RECOVERY" 2>&1 || true
fi

if [ -f "$LAUNCHER" ] || [ -f "$CONTROL" ]; then
	printf '%s\n' "recommendation=sealed-emergency"
elif [ -f "$LIVE/awtsmoos-supervisor.sh" ]; then
	printf '%s\n' "recommendation=portable-supervisor"
else
	printf '%s\n' "recommendation=fresh-reinstall"
fi
