// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const { runActionBatch } = require("../tools/fs/actionBatch.js");

async function run() {
	const calls = [];
	const startedAt = Date.now();
	const result = await runActionBatch({
		action: "aiCommandBatch",
		staggerMs: 25,
		jobs: [
			{ id: "first", goal: "first isolated worker" },
			{ id: "second", prompt: "second isolated worker" }
		]
	}, async (payload) => {
		calls.push({
			action: payload.action,
			at: Date.now(),
			goal: payload.goal,
			prompt: payload.prompt
		});
		return { ok: true, workerId: `worker_${calls.length}` };
	});
	assert.equal(result.ok, true);
	assert.equal(calls.length, 2);
	assert.deepEqual(calls.map((call) => call.action), [
		"aiWorkflowRun",
		"aiWorkflowRun"
	]);
	assert(calls[1].at - calls[0].at >= 20);
	assert(Date.now() - startedAt >= 20);
}

run().then(() => {
	console.log(JSON.stringify({
		ok: true,
		suite: "ai-command-batch-jobs",
		staggered: true
	}, null, 2));
}).catch((error) => {
	console.error(error.stack || error.message);
	process.exitCode = 1;
});
