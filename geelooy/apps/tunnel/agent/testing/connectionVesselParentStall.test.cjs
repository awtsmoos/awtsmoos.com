// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { fork } = require("node:child_process");
const { once } = require("node:events");

/**
	* @file Proves child liveness advances while the parent event loop is blocked.
	* @description
	* The Awtsmoos waits for first testimony, suspends the parent, and observes the
	* independent vessel continue breathing through atomic heartbeat replacements.
	*/
const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "awts-child-stall-"));
const heartbeat = path.join(sandbox, "heartbeat.txt");
const child = fork(
	path.join(__dirname, "helpers/connectionVessel/heartbeat-child.cjs"),
	[heartbeat],
	{ stdio: "ignore" }
);

main().catch(error => {
	console.error(error);
	process.exitCode = 1;
}).finally(async () => {
	child.kill("SIGTERM");
	if (child.exitCode === null && child.signalCode === null) {
		await Promise.race([
			once(child, "exit"),
			new Promise(resolve => setTimeout(resolve, 2000))
		]);
	}
	fs.rmSync(sandbox, {
		recursive: true,
		force: true,
		maxRetries: 10,
		retryDelay: 100
	});
});

async function main() {
	const before = await waitForHeartbeat();
	const startedAt = Date.now();
	while (Date.now() - startedAt < 350) {}
	const after = readHeartbeat();
	assert.ok(after > before, `${before} -> ${after}`);
	console.log(JSON.stringify({
		ok: true,
		suite: "connection-vessel-parent-stall",
		parentStallMs: 350,
		childAdvanced: after - before
	}, null, 2));
}

async function waitForHeartbeat() {
	const deadline = Date.now() + 3000;
	while (Date.now() < deadline) {
		const value = readHeartbeat();
		if (value > 0) return value;
		await new Promise(resolve => setTimeout(resolve, 10));
	}
	throw new Error("connection_vessel_heartbeat_not_ready");
}

function readHeartbeat() {
	try {
		return Number(fs.readFileSync(heartbeat, "utf8")) || 0;
	} catch {
		return 0;
	}
}
