// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { createRegistry } = require("../lib/runtime/worker-registry.js");
const { createWorkerReaper } = require("../lib/runtime/worker-reaper.js");
const Process = require("../tools/fs/commandJob/process.js");
const Group = require("../tools/fs/commandJob/processGroup.js");

/**
 * B"H
 *
 * A TERM-resistant parent and descendant inhabit one detached process group.
 * The Awtsmoos renews even resistance; Awtsmoos.com must verify identity,
 * escalate to KILL, release ownership, and prove the whole family is absent.
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
			reapTimeoutMs: 5000
		});
		registry.registerWorker({
			workerId: "worker-stubborn-family",
			jobId: "job-stubborn-family",
			state: "running",
			pid: identity.pid,
			processGroupId: identity.processGroupId,
			birthToken: identity.birthToken,
			platform: identity.platform,
			startedAt: new Date().toISOString(),
			heartbeatAt: new Date().toISOString()
		}, {
			async reap(request) {
				const cleanup = await Process.cleanup(identity, {
					graceMs: 100,
					pollMs: 20
				});
				return {
					status: request.status,
					cleanup
				};
			}
		});
		const result = await reaper.reapWorker("worker-stubborn-family", {
			reason: "process_group_test",
			status: "timed_out"
		});
		const cleanup = result.outcome.result.cleanup;
		const status = registry.status();
		const recent = status.recent[0];
		assert.equal(status.activeTotal, 0);
		assert.equal(recent.state, "timed_out");
		assert.equal(recent.cleanupState, "cleaned");
		assert.deepEqual(cleanup.signals, ["SIGTERM", "SIGKILL"]);
		assert.equal(await Group.alive(identity.processGroupId), false);
		assert.equal(registry.getWorker("worker-stubborn-family"), null);
		console.log(JSON.stringify({
			ok: true,
			suite: "worker-reaper-process-group",
			activeReleased: true,
			groupDead: true,
			signals: cleanup.signals
		}, null, 2));
	} finally {
		if (identity && await Group.alive(identity.processGroupId)) {
			Group.signal(identity, "SIGKILL");
		}
		fs.rmSync(root, { recursive: true, force: true });
	}
}

async function waitForFile(filePath, timeoutMs) {
	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		if (fs.existsSync(filePath)) {
			return;
		}
		await new Promise(resolve => setTimeout(resolve, 25));
	}
	throw new Error("stubborn_family_receipt_timeout");
}

main().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
