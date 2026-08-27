// B"H
const test = require("node:test");
const assert = require("node:assert/strict");
const Command = require("../../command/index.js");

test("recent completed job supports late wait, status, output, and repeat cancel", async () => {
	const runtime = Command.createCommandRunner({ maxRetained: 2 });
	const started = runtime.start({ command: "printf retained" });
	const first = await runtime.wait(started.job.jobId);
	assert.equal(first.status, "completed");
	assert.equal((await runtime.wait(started.job.jobId)).status, "completed");
	assert.equal(runtime.status(started.job.jobId).status, "completed");
	assert.equal(runtime.output(started.job.jobId, "stdout"), "retained");
	assert.equal((await runtime.cancel(started.job.jobId)).status, "completed");
});

test("retention evicts oldest completed receipt without leaking active state", async () => {
	const runtime = Command.createCommandRunner({ maxRetained: 2 });
	const ids = [];
	for (let index = 0; index < 3; index += 1) {
		const started = runtime.start({ command: `printf ${index}` });
		ids.push(started.job.jobId);
		await runtime.wait(started.job.jobId);
	}
	assert.equal(runtime.status(ids[0]), null);
	assert.equal(runtime.status(ids[2]).status, "completed");
	assert.equal(runtime.snapshot().completedResults, 2);
	assert.equal(runtime.snapshot().activeJobs, 0);
});
