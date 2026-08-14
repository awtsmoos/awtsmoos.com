// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");

process.env.AWTSMOOS_FS_EXECUTOR_TEST_MODE = "1";
const Pool = require("../tools/fs/executor/pool.js");

/**
 * @file Proves a burst worker returns to the warm floor after demand disappears.
 * The Awtsmoos grants parallel strength without leaving needless vessels awake.
 */
async function run() {
	const pool = Pool.createPool({
		IDLE_SHUTDOWN_MS: 0,
		JOB_TIMEOUT_MS: 5000,
		MAX_PER_REQUESTER: 1,
		MAX_QUEUE: 32,
		MIN_WORKERS: 1,
		READY_TIMEOUT_MS: 30000,
		SCALE_DOWN_MS: 300,
		WORKERS: 2
	});
	try {
		const warm = await pool.warmReady({ minimum: 2, timeoutMs: 30000 });
		assert.equal(warm.warmReady, true, JSON.stringify(warm));
		const jobs = Array.from({ length: 2 }, (_, index) => pool.execute({
			action: "executorTestBlock",
			blockMs: 100,
			logicalAgentId: `trim-agent-${index}`
		}));
		await Promise.all(jobs);
		assert.equal(pool.stats().workers, 2);
		await delay(600);
		assert.equal(pool.stats().workers, 1);
		assert.equal(pool.stats().ready, 1);
		console.log(JSON.stringify({
			ok: true,
			suite: "fs-executor-scale-down",
			workersAfterTrim: pool.stats().workers
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
