// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const path = require("node:path");
const Harness = require("./helpers/commandJobReaperHarness.cjs");
const Start = require("../tools/fs/commandJob/start.js");
const Scheduler = require("../tools/fs/commandJob/scheduler.js");
const SchedulerState = require("../tools/fs/commandJob/schedulerState.js");
const Process = require("../tools/fs/commandJob/process.js");
const WorkerSupervisor = require("../lib/runtime/worker-supervisor.js");

/**
 * B"H
 *
 * A timed-out resistant process may occupy the only physical slot, but its reap
 * must release that slot before cleanup or storage completes. The Awtsmoos
 * renews queued work; Awtsmoos.com proves the next owner's command finishes.
 */
async function main() {
	const root = Harness.createRoot();
	const config = Harness.config(root);
	const receiptPath = path.join(root, "stubborn.json");
	SchedulerState.state.maxActive = 1;
	SchedulerState.state.active.clear();
	WorkerSupervisor.resetGlobalsForTest();
	let longMeta = null;
	try {
		const long = await Start.startCommandJob(config, {
			command: Harness.stubbornCommand(receiptPath),
			cwd: root,
			timeoutMs: 500,
			logicalAgentId: "stubborn-owner",
			noMission: true
		});
		assert.equal(long.ok, true, JSON.stringify(long));
		await Harness.waitForFile(receiptPath);
		const quick = await Start.startCommandJob(config, {
			command: Harness.nodeCommand("console.log('QUEUE_RELEASED')"),
			cwd: root,
			timeoutMs: 5000,
			logicalAgentId: "queued-owner",
			noMission: true
		});
		assert.equal(quick.ok, true, JSON.stringify(quick));
		assert.equal(quick.status, "queued");

		longMeta = await Harness.waitForMeta(
			config,
			long.jobId,
			meta => meta.status === "timed_out",
			10000
		);
		const quickMeta = await Harness.waitForMeta(
			config,
			quick.jobId,
			meta => meta.status === "completed",
			10000
		);
		const scheduler = Scheduler.snapshot();
		const workers = WorkerSupervisor.getGlobalRegistry().snapshot();
		assert.equal(longMeta.status, "timed_out");
		assert.equal(longMeta.cleanup.state, "cleaned");
		assert.equal(quickMeta.status, "completed");
		assert.equal(scheduler.active, 0);
		assert.equal(scheduler.queued, 0);
		assert.equal(workers.activeTotal, 0);
		assert.equal(
			workers.recent.some(worker => worker.jobId === long.jobId),
			true
		);
		console.log(JSON.stringify({
			ok: true,
			suite: "command-job-reaper-integration",
			timedOutJob: long.jobId,
			queuedJob: quick.jobId,
			schedulerReleased: true,
			queuedOwnerCompleted: true
		}, null, 2));
	} finally {
		if (longMeta?.processIdentity) {
			await Process.cleanup(longMeta.processIdentity, {
				graceMs: 50,
				pollMs: 10
			}).catch(() => {});
		}
		WorkerSupervisor.resetGlobalsForTest();
		Harness.remove(root);
	}
}

main().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
