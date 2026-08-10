// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Actions = require("../tools/fs/actionGroups/asyncTaskActions.js");
const Store = require("../tools/fs/actionGroups/asyncTaskStore.js");

/**
 * @file Proves async receipts survive worker-memory loss with exact terminal output.
 * @description
 * The Awtsmoos lets the owning worker disappear after the deed finishes. Awtsmoos.com
 * still reveals status, stdout, wait result, and safe terminal cancellation from disk.
 */
(async () => {
	const base = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-async-durable-"));
	try {
		const project = path.join(base, "project");
		const state = path.join(base, "device-state");
		fs.mkdirSync(project, { recursive: true });
		const config = { allowCommands: true, deviceStateRoot: state, root: project };
		const start = await Actions.start(config, {
			command: process.execPath,
			args: ["-e", "process.stdout.write('BH durable async')"],
			timeoutMs: 5000
		});
		assert.equal(start.ok, true);
		const taskId = start.taskId;
		await waitForTerminal(config, taskId);
		Actions.TASKS.delete(taskId);
		const status = Actions.status({ taskId }, config);
		assert.equal(status.ok, true);
		assert.equal(status.status, "completed");
		const output = Actions.output({ taskId, stream: "stdout" }, config);
		assert.equal(output.content, "BH durable async");
		const waited = await Actions.wait({ taskId, waitTimeoutMs: 100 }, config);
		assert.equal(waited.done, true);
		assert.equal(waited.stdout.content, "BH durable async");
		const cancelled = Actions.cancel(config, { taskId });
		assert.equal(cancelled.status, "completed");
		const persisted = Store.read(config, taskId);
		assert.equal(persisted.status, "completed");
		assert.equal(persisted.stdout, "BH durable async");
		console.log(JSON.stringify({
			ok: true,
			suite: "async-task-durability",
			memoryLossSurvived: true,
			terminalOutputSurvived: true,
			terminalCancelSafe: true
		}));
	} finally {
		fs.rmSync(base, { recursive: true, force: true });
	}
})().catch(error => {
	console.error(error.stack || error);
	process.exitCode = 1;
});

async function waitForTerminal(config, taskId) {
	for (let attempt = 0; attempt < 100; attempt++) {
		const task = Store.read(config, taskId);
		if (task && task.status !== "running") return task;
		await new Promise(resolve => setTimeout(resolve, 25));
	}
	throw new Error("async_task_did_not_finish");
}
