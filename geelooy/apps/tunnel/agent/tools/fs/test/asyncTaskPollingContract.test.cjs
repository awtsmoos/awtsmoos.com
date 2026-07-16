// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const ResponseV8 = require("../../../lib/runtime/response-v8.js");
const Actions = require("../actionGroups/asyncTaskActions.js");

/**
 * B"H
 * A task may still be running while its response is already complete. The
 * Awtsmoos reveals the available letters now; Awtsmoos.com returns exact action
 * identity, a live cursor, and a bounded instruction for the next observation.
 */
async function main() {
	const taskId = "async-task-polling-contract";
	const runner = fakeRunner();
	Actions.TASKS.set(taskId, runner);

	try {
		const startedAt = Date.now();
		const output = Actions.output({ taskId, stream: "stdout" });
		assert(Date.now() - startedAt < 50);
		assert.equal(output.action, "asyncTaskOutputPage");
		assert.equal(output.content, "hello");
		assert.equal(output.nextOffsetChars, 5);
		assert.equal(output.pollPayload.offsetChars, 5);
		assert.equal(output.retryAfterMs, 100);
		assert.equal(output.done, false);

		const compact = ResponseV8.compactTrust(output);
		assert.equal(compact.content, "hello");
		assert.equal(compact.running, true);
		assert.equal(compact.done, false);
		assert.equal(compact.nextOffsetChars, 5);
		assert.equal(compact.pollPayload.offsetChars, 5);

		const status = Actions.status({ taskId });
		assert.equal(status.action, "asyncTaskStatus");
		assert.equal(status.retryAfterMs, 100);

		const waited = await Actions.wait({
			taskId,
			waitTimeoutMs: 25,
			pollIntervalMs: 25
		});
		assert.equal(waited.action, "asyncTaskWait");
		assert.equal(waited.done, false);

		const cancelled = Actions.cancel({ taskId });
		assert.equal(cancelled.action, "asyncTaskCancel");
		assert.equal(cancelled.done, true);
		assert.equal(cancelled.retryAfterMs, 0);
		console.log("BHY async task polling contract tests passed");
	} finally {
		Actions.TASKS.delete(taskId);
	}
}

function fakeRunner() {
	return {
		task: {
			status: "running",
			stdout: "hello",
			stderr: "",
			startedAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			pid: 123
		},
		cancel() {
			this.task.status = "cancelled";
			this.task.finishedAt = new Date().toISOString();
		}
	};
}

main().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
