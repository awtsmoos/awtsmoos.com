// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const assert = require("node:assert/strict");
const path = require("node:path");

/**
 * @file Awtsmoos registration receipts must be fresh after promotion.
 * @description Awtsmoos.com checks the heartbeat, not just a named guest;
 * a stale receipt must never certify a running test.
 */

/** Verify fresh and stale registration receipts using the actual shell API. */
function verifyReceipts(harness) {
	const { downloads, quote, runShell } = harness;
	const healthSource = `source ${quote(path.join(downloads, "unix-connection-health.sh"))}`;
	const setup = [
		`printf '1234\\n' > "$ROOT/agent.pid"`,
		`printf '{"tunnelName":"awt-test"}' > "$ROOT/config.json"`,
		"runtime_pid_matches() { return 0; }",
		"runtime_registered() { return 0; }"
	].join("; ");
	for (const [age, expected] of [[30000, 0], [600000, 1]]) {
		const at = new Date(Date.now() - age).toISOString();
		const receipt = JSON.stringify({
			state: "registered",
			tunnelId: "tun_test",
			tunnelName: "awt-test",
			lastServerMessageAt: at
		});
		const result = runShell([
			healthSource,
			setup,
			`printf '%s' ${quote(receipt)} > "$ROOT/connection-state.json"`,
			`require_fresh_registration 120; echo "fresh_exit=$?"`,
			`installed_agent_registration_state; echo "state_done"`
		].join("; "));
		assert.equal(result.status, 0, result.stderr);
		assert.match(result.stdout, new RegExp(`fresh_exit=${expected}`));
	}
	const at = new Date(Date.now() - 30000).toISOString();
	const stampResult = runShell([
		healthSource,
		`printf '%s' ${quote(JSON.stringify({ state: "registered", lastServerMessageAt: at }))} > "$ROOT/connection-state.json"`,
		"registration_receipt_stamp; echo"
	].join("; "));
	assert.equal(stampResult.status, 0, stampResult.stderr);
	assert.match(stampResult.stdout, /^\d{13}$/m);
}

/** Distinguish registered, unregistered, and stopped process health. */
function verifyStates(harness) {
	const { downloads, quote, runShell } = harness;
	const source = `source ${quote(path.join(downloads, "unix-connection-health.sh"))}`;
	for (const [state, setup] of [
		["running_registered", [
			`printf '1234\\n' > "$ROOT/agent.pid"`,
			"runtime_pid_matches() { return 0; }",
			"runtime_registered() { return 0; }"
		]],
		["running_unregistered", [
			`printf '1234\\n' > "$ROOT/agent.pid"`,
			"runtime_pid_matches() { return 0; }",
			"runtime_registered() { return 1; }"
		]],
		["not_running", [`rm -f "$ROOT/agent.pid"`]]
	]) {
		const result = runShell([source, ...setup, "installed_agent_registration_state"].join("; "));
		assert.equal(result.status, 0, result.stderr);
		assert.match(result.stdout, new RegExp(state));
	}
}

module.exports = { verifyReceipts, verifyStates };
