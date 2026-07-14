// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const path = require("node:path");
const Harness = require("./helpers/commandJobReaperHarness.cjs");
const Cancel = require("../tools/fs/commandJob/cancel.js");
const Context = require("../tools/fs/commandJob/context.js");
const Start = require("../tools/fs/commandJob/start.js");
const Scheduler = require("../tools/fs/commandJob/scheduler.js");
const SchedulerState = require("../tools/fs/commandJob/schedulerState.js");
const WorkerSupervisor = require("../lib/runtime/worker-supervisor.js");

/**
 * B"H
 *
 * Cancellation must never await a worker's existing finalization promise. The
 * Awtsmoos renews control separately; Awtsmoos.com proves a permanently wedged
 * finalizer cannot retain process group, scheduler slot, or registry ownership.
 */
async function main() {
	const root = Harness.createRoot("awts-cancel-bypass-");
	const config = Harness.config(root);
	const receiptPath = path.join(root, "stubborn.json");
	SchedulerState.state.maxActive = 1;
	SchedulerState.state.active.clear();
	WorkerSupervisor.resetGlobalsForTest();
	try {
		const started = await Start.startCommandJob(config, {
			command: Harness.stubbornCommand(receiptPath),
			cwd: root,
			timeoutMs: 30000,
			logicalAgentId: "cancel-bypass-owner",
			noMission: true
		});
		assert.equal(started.ok, true, JSON.stringify(started));
		await Harness.waitForFile(receiptPath);
		const live = Context.activeJobs.get(started.jobId);
		assert.ok(live, "expected live command record");
		live.finalizing = new Promise(() => {});

		const beganAt = Date.now();
		const cancelled = await Cancel.cancelCommandJob(config, {
			jobId: started.jobId,
			action: "commandCancel"
		});
		const elapsedMs = Date.now() - beganAt;
		const scheduler = Scheduler.snapshot();
		const workers = WorkerSupervisor.getGlobalRegistry().snapshot();
		assert.equal(cancelled.status, "cancelled", JSON.stringify(cancelled));
		assert.equal(cancelled.reaperClaimed, true);
		assert.equal(elapsedMs < 5000, true, `cancel_elapsed:${elapsedMs}`);
		assert.equal(Context.activeJobs.has(started.jobId), false);
		assert.equal(scheduler.active, 0);
		assert.equal(scheduler.queued, 0);
		assert.equal(workers.activeTotal, 0);
		assert.equal(
			workers.recent.some(worker => (
				worker.jobId === started.jobId &&
				worker.state === "cancelled"
			)),
			true
		);
		console.log(JSON.stringify({
			ok: true,
			suite: "command-cancel-finalizer-bypass",
			elapsedMs,
			wedgedFinalizerBypassed: true,
			schedulerReleased: true
		}, null, 2));
	} finally {
		WorkerSupervisor.resetGlobalsForTest();
		Harness.remove(root);
	}
}

main().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
