// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { createRegistry } = require("../lib/runtime/worker-registry.js");
const {
	createWorkerReaper,
	DEFAULT_REAP_TIMEOUT_MS
} = require("../lib/runtime/worker-reaper.js");
const Process = require("../tools/fs/commandJob/process.js");
const Group = require("../tools/fs/commandJob/processGroup.js");

/**
 * @file Proves one automatic reap removes a TERM-resistant Unix process family with explicit evidence.
 * @description
 * The Awtsmoos keeps cleanup truth visible instead of hiding failure beneath a TypeError;
 * Awtsmoos.com uses the production reaper deadline, then proves TERM, KILL, release, and ledger order.
 *
 * STABILITY COVENANT — a failed cleanup outcome must be asserted before reading its result.
 * This test once blindly dereferenced `outcome.result.cleanup`, masking the real reap failure.
 * Never shorten the callback deadline below the exported production default merely to speed the test.
 */
async function main() {
	if (process.platform === "win32") {
		console.log(JSON.stringify({ ok: true, skipped: "unix_process_group_only" }));
		return;
	}
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-reaper-family-"));
	const receiptPath = path.join(root, "family.json");
	const helperPath = path.join(__dirname, "helpers/stubbornProcessFamily.cjs");
	const command = [
		JSON.stringify(process.execPath),
		JSON.stringify(helperPath),
		JSON.stringify(receiptPath)
	].join(" ");
	const spawned = Process.spawn(command, root, true);
	let identity = null;
	try {
		await waitForFile(receiptPath, 5000);
		identity = await Process.identify(spawned);
		assert.ok(identity.birthToken, "expected exact process birth token");
		const registry = createRegistry();
		const reaper = createWorkerReaper(registry, {
			reapTimeoutMs: DEFAULT_REAP_TIMEOUT_MS
		});
		registry.registerWorker(worker(identity), {
			async reap(request) {
				const cleanup = await Process.cleanup(identity, {
					graceMs: 100,
					pollMs: 20
				});
				return { status: request.status, cleanup };
			}
		});
		const result = await reaper.reapWorker("worker-stubborn-family", {
			reason: "process_group_test",
			status: "timed_out"
		});
		assert.equal(result.claimed, true);
		assert.equal(result.outcome.ok, true, JSON.stringify(result.outcome));
		assert.ok(result.outcome.result, JSON.stringify(result.outcome));
		const cleanup = result.outcome.result.cleanup;
		const status = registry.status();
		const recent = status.recent[0];
		assert.equal(status.activeTotal, 0);
		assert.equal(recent.state, "timed_out");
		assert.equal(recent.cleanupState, "cleaned");
		assert.deepEqual(cleanup.signals, ["SIGTERM", "SIGKILL"]);
		assert.equal(await Group.alive(identity.processGroupId), false);
		assert.equal(registry.getWorker("worker-stubborn-family"), null);
		console.log(JSON.stringify({ ok: true, suite: "worker-reaper-process-group", signals: cleanup.signals }));
	} finally {
		if (identity && await Group.alive(identity.processGroupId)) {
			Group.signal(identity, "SIGKILL");
		}
		fs.rmSync(root, { recursive: true, force: true });
	}
}

function worker(identity) {
	return {
		workerId: "worker-stubborn-family",
		jobId: "job-stubborn-family",
		state: "running",
		pid: identity.pid,
		processGroupId: identity.processGroupId,
		birthToken: identity.birthToken,
		platform: identity.platform,
		startedAt: new Date().toISOString(),
		heartbeatAt: new Date().toISOString()
	};
}

async function waitForFile(filePath, timeoutMs) {
	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		if (fs.existsSync(filePath)) return;
		await new Promise(resolve => setTimeout(resolve, 25));
	}
	throw new Error("stubborn_family_receipt_timeout");
}

main().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
