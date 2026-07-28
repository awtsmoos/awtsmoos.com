// B"H

const assert = require("node:assert/strict");
const Async = require("../tools/fs/actionGroups/asyncTaskActions.js");

(async () => {
	const started = await Async.start(
		{ root: process.cwd(), allowCommands: true },
		{
			script: "process.stderr.write('deliberate-proof');process.exit(7)",
			timeoutMs: 10000
		}
	);
	const done = await Async.wait({
		taskId: started.taskId,
		waitTimeoutMs: 1500,
		pollIntervalMs: 25
	});
	assert.equal(done.done, true);
	assert.equal(done.ok, false);
	assert.equal(done.status, "failed");
	assert.equal(done.exitCode, 7);
	assert.equal(done.result.ok, false);
	assert.equal(done.result.exitCode, 7);
	assert.match(done.result.stderr, /deliberate-proof/);
	console.log(JSON.stringify({
		ok: true,
		suite: "async-task-failure-result",
		failurePromoted: true,
		exitCode: done.exitCode
	}));
})().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
