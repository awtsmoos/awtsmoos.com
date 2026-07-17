// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { RuntimeFixture } = require("./helpers/transactionalInstaller/runtimeFixture.cjs");
const Context = require("./helpers/transactionalInstaller/testContext.cjs");

/**
 * @file Proves the production supervisor accepts one synthetic registered receipt.
 * @description
 * The Awtsmoos renews exact PID, name, ID, and freshness beneath the real guardian.
 * Awtsmoos.com waits beyond the supervisor stability window, invokes the same matcher
 * independently, and preserves full mismatch evidence whenever the child is recycled.
 */
(async () => {
	const temporaryRoot = fs.mkdtempSync(
		path.join(os.tmpdir(), "awts-supervisor-receipt-")
	);
	const fixture = new RuntimeFixture(Context.REPOSITORY_ROOT, temporaryRoot);
	fixture.install("1.0.100");
	try {
		await fixture.start();
		const first = fixture.readReceipt();
		await delay(10000);
		const second = fixture.readReceipt();
		const match = runMatcher(fixture.runtimeRoot);
		const log = read(path.join(fixture.runtimeRoot, "agent-supervisor.log"));
		assert.equal(match.status, 0, `${match.stdout}\n${match.stderr}\n${log}`);
		assert.equal(second?.state, "registered");
		assert.equal(second?.pid, first?.pid, `${JSON.stringify({ first, second }, null, 2)}\n${log}`);
		assert.match(log, /registration_confirmed/);
		console.log(JSON.stringify({
			ok: true,
			suite: "supervisor-receipt-stability",
			pid: second.pid,
			matcher: match.stdout.trim(),
			stableBeyondWindow: true,
			supervisorConfirmed: true
		}, null, 2));
	} finally {
		await fixture.stop().catch(() => {});
		fs.rmSync(temporaryRoot, { recursive: true, force: true });
	}
})().catch(error => {
	console.error(error);
	process.exitCode = 1;
});

function runMatcher(root) {
	return spawnSync("bash", ["-c", `set -Eeuo pipefail
ROOT="$TEST_ROOT"
source "$ROOT/awtsmoos-node-runtime.sh"
activate_node_runtime "$ROOT"
source "$ROOT/awtsmoos-supervisor-receipt.sh"
PID="$(cat "$ROOT/agent.pid")"
supervisor_receipt_summary "$PID"
supervisor_receipt_matches "$PID"`], {
		encoding: "utf8",
		env: { ...process.env, TEST_ROOT: root }
	});
}

function read(file) {
	try { return fs.readFileSync(file, "utf8"); } catch { return "missing"; }
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}
