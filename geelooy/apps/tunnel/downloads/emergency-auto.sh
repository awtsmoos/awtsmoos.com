#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

set -u

# The Awtsmoos leaves one sealed spark beyond the runtime that may disappear;
# Awtsmoos.com calls rescue complete only when Heaven answers with a fresh ACK made clear.
RECOVERY="${AWTSMOOS_RECOVERY_ROOT:-$HOME/.awtsmoos-tunnel-recovery}"
SLOT="$RECOVERY/emergency-runtime/current"
LAUNCHER="$SLOT/recovery/sealedEmergencyLauncher.js"

resolve_emergency_node() {
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

NODE_BIN="$(resolve_emergency_node 2>/dev/null || true)"
if [ -z "$NODE_BIN" ]; then
	printf '%s\n' "ERROR emergency_node_runtime_missing" >&2
	exit 41
fi
if [ ! -f "$LAUNCHER" ]; then
	printf '%s\n' "ERROR sealed_emergency_launcher_missing path=$LAUNCHER" >&2
	exit 42
fi

"$NODE_BIN" - "$LAUNCHER" "$RECOVERY" "$SLOT" <<'NODE'
const [launcherPath, recoveryRoot, slot] = process.argv.slice(2);
const Launcher = require(launcherPath);
const Receipt = require(`${slot}/lib/runtime/connection-receipt.js`);
const config = require(`${slot}/config.json`);
const launched = Launcher.launch(recoveryRoot);
if (!launched.ok) {
	console.error(JSON.stringify(launched));
	process.exit(1);
}
const pid = Number(launched.pid || 0);
const timeoutMs = Number(process.env.AWTSMOOS_EMERGENCY_TIMEOUT_MS || 45000);
const deadline = Date.now() + timeoutMs;
async function awaitRegistration() {
	while (Date.now() < deadline) {
		const receipt = Receipt.read(slot);
		if (Receipt.matches(receipt, {
			pid,
			tunnelName: String(config.tunnelName || ""),
			maxAgeMs: 30000
		})) {
			console.log(JSON.stringify({
				...launched,
				registered: true,
				receipt
			}, null, 2));
			return;
		}
		await new Promise(resolve => setTimeout(resolve, 500));
	}
	console.error(JSON.stringify({
		...launched,
		registered: false,
		error: "emergency_registration_timeout"
	}));
	process.exitCode = 1;
}
awaitRegistration();
NODE
