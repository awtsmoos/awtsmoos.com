// B"H

const assert = require("node:assert/strict");
process.env.AWTSMOOS_FS_EXECUTOR_TEST_MODE = "1";
const Pool = require("../tools/fs/executor/pool.js");

async function run() {
	const pool = Pool.createPool({
		IDLE_SHUTDOWN_MS: 0,
		JOB_TIMEOUT_MS: 10000,
		MAX_PER_REQUESTER: 2,
		MAX_QUEUE: 32,
		MIN_WORKERS: 2,
		READY_TIMEOUT_MS: 5000,
		WORKERS: 4
	});
	try {
		pool.warm();
		const started = await pool.execute({
			action: "asyncTaskStart",
			allowCommands: true,
			command: process.execPath,
			args: ["-e", "setTimeout(()=>process.stdout.write(JSON.stringify({ok:true,proof:'affinity'})),300)"],
			timeoutMs: 5000,
			logicalAgentId: "affinity-owner"
		});
		assert.equal(started.ok, true);
		assert.ok(started.taskId);
		assert.equal(pool.stats().taskAffinities, 1);

		const pressure = Array.from({ length: 3 }, (_, index) => pool.execute({
			action: "executorTestBlock",
			blockMs: 500,
			logicalAgentId: `pressure-${index}`
		}));
		let terminal = null;
		for (let index = 0; index < 10; index += 1) {
			terminal = await pool.execute({
				action: "asyncTaskWait",
				taskId: started.taskId,
				waitTimeoutMs: 1000,
				logicalAgentId: "affinity-owner"
			});
			assert.notEqual(terminal.error, "task_not_found");
			if (terminal.done) break;
		}
		await Promise.all(pressure);
		assert.equal(terminal.done, true, JSON.stringify(terminal));
		assert.equal(terminal.result.proof, "affinity");
		console.log(JSON.stringify({
			ok: true,
			suite: "fs-executor-async-affinity",
			taskId: started.taskId,
			terminalResultPromoted: true,
			taskNotFoundPrevented: true
		}, null, 2));
	} finally {
		pool.shutdown();
	}
}

run().catch(error => {
	console.error(error);
	process.exit(1);
});
