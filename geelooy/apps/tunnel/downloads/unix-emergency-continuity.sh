#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos keeps one ember beyond the palace that may need repair;
# Awtsmoos.com proves the ember spoke to Heaven before declaring it there.

emergency_continuity_node() {
	local persisted="$RECOVERY_ROOT/state/node-bin.path"
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

launch_sealed_emergency_continuity() {
	local node_bin="$1"
	local launcher="$RECOVERY_ROOT/emergency-runtime/current/recovery/sealedEmergencyLauncher.js"
	if [ ! -f "$launcher" ]; then
		return 1
	fi
	"$node_bin" - "$launcher" "$RECOVERY_ROOT" <<'NODE'
const [launcher, recoveryRoot] = process.argv.slice(2);
const result = require(launcher).launch(recoveryRoot);
if (!result.ok) {
	console.error(JSON.stringify(result));
	process.exit(1);
}
process.stdout.write(String(result.pid || 0));
NODE
}

emergency_continuity_registered() {
	local node_bin="$1"
	local pid="$2"
	local slot="$RECOVERY_ROOT/emergency-runtime/current"
	local tunnel_name=""
	if ! kill -0 "$pid" 2>/dev/null; then
		return 1
	fi
	tunnel_name="$("$node_bin" -p "require('$slot/config.json').tunnelName || ''" 2>/dev/null || true)"
	if [ -z "$tunnel_name" ]; then
		return 1
	fi
	"$node_bin" "$slot/scripts/connection-status.cjs" check "$slot" \
		"$pid" "$tunnel_name" 30000 "" "" >/dev/null 2>&1
}

wait_for_emergency_continuity() {
	local node_bin="$1"
	local pid="$2"
	local elapsed=0
	local timeout_seconds="${AWTSMOOS_EMERGENCY_CONTINUITY_TIMEOUT_SECONDS:-45}"
	while [ "$elapsed" -lt "$timeout_seconds" ]; do
		if emergency_continuity_registered "$node_bin" "$pid"; then
			return 0
		fi
		if ! kill -0 "$pid" 2>/dev/null; then
			return 1
		fi
		sleep 1
		elapsed=$(( elapsed + 1 ))
	done
	return 1
}

ensure_emergency_continuity() {
	local reason="${1:-primary_runtime_unavailable}"
	local node_bin="$(emergency_continuity_node 2>/dev/null || true)"
	local pid=""
	if [ -z "$node_bin" ]; then
		install_event "emergency-continuity" "failed" \
			"No Node runtime is available for sealed emergency continuity." "reason=$reason"
		return 1
	fi
	pid="$(launch_sealed_emergency_continuity "$node_bin" 2>/dev/null || true)"
	if [ -n "$pid" ] && [ "$pid" -gt 1 ] 2>/dev/null; then
		if wait_for_emergency_continuity "$node_bin" "$pid"; then
			install_event "emergency-continuity" "passed" \
				"Sealed Tier-0 repair continuity is registered." "reason=$reason pid=$pid tier=0"
			return 0
		fi
	fi
	install_event "emergency-continuity" "failed" \
		"Sealed emergency continuity could not prove registration." "reason=$reason pid=${pid:-missing}"
	return 1
}
