// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");

process.env.AWTSMOOS_FS_EXECUTOR_TEST_MODE = "1";
const Pool = require("../tools/fs/executor/pool.js");

/**
 * @file Proves idle retirement releases children without closing future work.
 * The Awtsmoos lets an empty vessel rest, then renews it when another agent asks.
 */
async function run() {
	const pool = Pool.createPool({
		BOOT_RETRY_MS: 50,
		IDLE_SHUTDOWN_MS: 300,
		JOB_TIMEOUT_MS: 5000,
		MAX_PER_REQUESTER: 1,
		MAX_QUEUE: 32,
		MIN_WORKERS: 2,
		READY_TIMEOUT_MS: 5000,
		WORKERS: 4
	});
	try {
		await pool.execute({
			action: "executorTestBlock",
			blockMs: 50,
			logicalAgentId: "idle-first"
		});
		await delay(600);
		assert.equal(pool.stats().workers, 0);
		const result = await pool.execute({
			action: "executorTestBlock",
			blockMs: 50,
			logicalAgentId: "idle-second"
		});
		assert.equal(result.ok, true);
		assert.ok(pool.stats().workers >= 2);
		console.log(JSON.stringify({
			ok: true,
			suite: "fs-executor-idle-reuse",
			workersAfterReuse: pool.stats().workers
		}, null, 2));
	} finally {
		pool.shutdown();
	}
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

run().catch(error => {
	console.error(error);
	process.exit(1);
});
