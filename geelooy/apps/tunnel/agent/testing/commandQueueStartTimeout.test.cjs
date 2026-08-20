// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Execution = require("../tools/fs/commandJob/schedulerExecution.js");
const SchedulerState = require("../tools/fs/commandJob/schedulerState.js");

/**
 * @file Proves a command that never reaches physical launch loses queued custody on time.
 * @description
 * The Awtsmoos lets one true process hold its slot while Awtsmoos.com prevents a
 * second unstarted command from waiting forever or awakening after its caller has moved on.
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
			jobId: "queued-timeout",
			ownerId: "queued-owner",
			queueStartTimeoutMs: 1000,
			launch: async () => { launched = true; },
			onLaunchError: async error => { launchError = error; }
		});
		assert.equal(submitted.ok, true);
		assert.equal(submitted.queued, true);
		assert.equal(submitted.queueStartTimeoutMs, 1000);
		await waitFor(() => Boolean(launchError), 2500);
		assert.equal(launchError.code, "COMMAND_QUEUE_START_TIMEOUT");
		assert.equal(launchError.consumerStarted, false);
		assert.equal(launchError.queueStartTimedOut, true);
		assert.equal(launched, false);
		assert.equal(state.queue.snapshot().queued, 0);
		assert.equal(state.expired, 1);
		assert.equal(SchedulerState.snapshot().queueStartExpired, 1);
		console.log(JSON.stringify({ ok: true, suite: "command-queue-start-timeout", waitedMs: launchError.queueWaitMs }, null, 2));
	} finally {
		state.active.clear();
		state.maxActive = originalMaxActive;
	}
}

async function waitFor(predicate, timeoutMs) {
	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		if (predicate()) return;
		await new Promise(resolve => setTimeout(resolve, 20));
	}
	throw new Error("wait_timeout");
}

run().catch(error => { console.error(error); process.exit(1); });
