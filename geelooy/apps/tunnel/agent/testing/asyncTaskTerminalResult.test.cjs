// B"H

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Async = require("../tools/fs/actionGroups/asyncTaskActions.js");

(async () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-async-result-"));
	try {
		const started = await Async.start(
			{ root, allowCommands: true },
			{
				script: "process.stdout.write(JSON.stringify({ok:true,value:42}))",
				timeoutMs: 10000
			}
		);
		assert.equal(started.ok, true);
		const done = await Async.wait({
			taskId: started.taskId,
			waitTimeoutMs: 1500,
			pollIntervalMs: 25
		});
		assert.equal(done.done, true);
		assert.deepEqual(done.result, { ok: true, value: 42 });
		assert.match(done.stdout.content, /"value":42/);
		console.log(JSON.stringify({
			ok: true,
			suite: "async-task-terminal-result",
			directResult: done.result
		}));
	} finally {
		fs.rmSync(root, {
			recursive: true,
			force: true,
			maxRetries: 8,
			retryDelay: 50
		});
	}
})().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
