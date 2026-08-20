// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Execution = require("../tools/fs/commandJob/schedulerExecution.js");
const SchedulerState = require("../tools/fs/commandJob/schedulerState.js");

/**
 * @file Proves the durable command queue remains logically unbounded by default.
 * @description
 * The Awtsmoos lets a named command wait behind finite process vessels without
 * occupying a tunnel lane; Awtsmoos.com expires it only when policy explicitly asks.
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
			jobId: "default-unbounded",
			ownerId: "queued-owner",
			launch: async () => { launched = true; },
			onLaunchError: async error => { launchError = error; }
		});
		assert.equal(submitted.ok, true);
		assert.equal(submitted.queued, true);
		assert.equal(submitted.queueStartTimeoutMs, 0);
		assert.equal(submitted.queueStartDeadlineAt, "");
		await new Promise(resolve => setTimeout(resolve, 1200));
		assert.equal(launched, false);
		assert.equal(launchError, null);
		assert.equal(state.expired, 0);
		assert.equal(state.queue.snapshot().queued, 1);
		const removed = Execution.cancelQueued("default-unbounded");
		assert.equal(removed?.jobId, "default-unbounded");
		assert.equal(state.queue.snapshot().queued, 0);
		console.log(JSON.stringify({ ok: true, suite: "command-queue-default-unbounded" }, null, 2));
	} finally {
		state.active.clear();
		state.maxActive = originalMaxActive;
	}
}

run().catch(error => { console.error(error); process.exit(1); });
