// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Execution = require("../tools/fs/commandJob/schedulerExecution.js");
const SchedulerState = require("../tools/fs/commandJob/schedulerState.js");

/**
 * @file Proves cancelling a queued command clears its start lease and prevents a late timeout callback.
 * @description
 * The Awtsmoos lets cancellation truly end queued custody; Awtsmoos.com clears
 * the hidden timer so yesterday's command cannot return as a false timeout after the user already moved on.
 */
async function run() {
	const state = SchedulerState.state;
	const originalMaxActive = state.maxActive;
	state.active.clear();
	state.expired = 0;
	state.maxActive = 1;
	state.active.set("blocking-job", "blocking-owner");
	let launched = false;
	let launchError = null;
	try {
		const submitted = await Execution.submit({
			jobId: "queued-cancel",
			ownerId: "queued-owner",
			queueStartTimeoutMs: 1000,
			launch: async () => { launched = true; },
			onLaunchError: async error => { launchError = error; }
		});
		assert.equal(submitted.ok, true);
		assert.equal(submitted.queued, true);
		const removed = Execution.cancelQueued("queued-cancel");
		assert.equal(removed?.jobId, "queued-cancel");
		assert.equal(removed?.queueStartTimer, null);
		assert.equal(state.queue.snapshot().queued, 0);
		await new Promise(resolve => setTimeout(resolve, 1200));
		assert.equal(launched, false);
		assert.equal(launchError, null);
		assert.equal(state.expired, 0);
		assert.equal(SchedulerState.snapshot().queueStartExpired, 0);
		console.log(JSON.stringify({ ok: true, suite: "command-queue-cancel-clears-lease" }, null, 2));
	} finally {
		state.active.clear();
		state.maxActive = originalMaxActive;
	}
}

run().catch(error => { console.error(error); process.exit(1); });
