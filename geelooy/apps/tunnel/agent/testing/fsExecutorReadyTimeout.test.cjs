// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");

process.env.AWTSMOOS_FS_EXECUTOR_TEST_NO_READY = "1";
const Pool = require("../tools/fs/executor/pool.js");

/**
 * @file Proves a child that never becomes ready cannot freeze shared agent work.
 * The Awtsmoos removes the silent vessel and retries with bounded backoff.
 */
async function run() {
	const pool = Pool.createPool({
		BOOT_RETRY_MS: 50,
		IDLE_SHUTDOWN_MS: 0,
		JOB_TIMEOUT_MS: 5000,
		MAX_PER_REQUESTER: 1,
		MAX_QUEUE: 32,
		MIN_WORKERS: 2,
		READY_TIMEOUT_MS: 250,
		WORKERS: 2
	});
	try {
		pool.warm();
		await delay(700);
		const stats = pool.stats();
		assert.ok(stats.bootFailures >= 2, JSON.stringify(stats));
		assert.equal(stats.ready, 0);
		assert.ok(stats.starting <= 2);
		console.log(JSON.stringify({
			ok: true,
			suite: "fs-executor-ready-timeout",
			bootFailures: stats.bootFailures,
			starting: stats.starting
		}, null, 2));
	} finally {
		pool.shutdown();
		await delay(100);
	}
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

run().catch(error => {
	console.error(error);
	process.exit(1);
});
