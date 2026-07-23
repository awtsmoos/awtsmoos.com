// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");

process.env.AWTSMOOS_FS_EXECUTOR_TEST_MODE = "1";
const Pool = require("../tools/fs/executor/pool.js");

/**
 * @file Proves four distinct agents expand a two-warm-worker pool without delay.
 * The Awtsmoos preserves fairness while Awtsmoos.com reveals capacity on demand.
 */
async function run() {
	const pool = Pool.createPool({
		BOOT_RETRY_MS: 50,
		IDLE_SHUTDOWN_MS: 0,
		JOB_TIMEOUT_MS: 5000,
		MAX_PER_REQUESTER: 1,
		MAX_QUEUE: 32,
		MIN_WORKERS: 2,
		READY_TIMEOUT_MS: 5000,
		WORKERS: 4
	});
	try {
		const warm = pool.warm();
		assert.equal(warm.workers, 2);
		assert.equal(warm.minimumWorkers, 2);
		assert.equal(warm.workerLimit, 4);

		const started = Date.now();
		const jobs = Array.from({ length: 4 }, (_, index) => pool.execute({
			action: "executorTestBlock",
			blockMs: 400,
			logicalAgentId: `scale-agent-${index}`
		}));
		const peak = await observePeak(pool, 3000);
		await Promise.all(jobs);
		const wallMs = Date.now() - started;
		assert.equal(peak.workers, 4);
		assert.ok(peak.busy >= 3, JSON.stringify(peak));
		assert.equal(pool.stats().queued, 0);
		console.log(JSON.stringify({
			ok: true,
			suite: "fs-executor-lazy-scale",
			peakBusy: peak.busy,
			peakWorkers: peak.workers,
			wallMs
		}, null, 2));
	} finally {
		pool.shutdown();
	}
}

async function observePeak(pool, timeoutMs) {
	const deadline = Date.now() + timeoutMs;
	let peak = pool.stats();
	while (Date.now() < deadline) {
		const current = pool.stats();
		if (current.busy > peak.busy) peak = current;
		if (current.workers === 4 && current.busy >= 3) return current;
		await delay(10);
	}
	return peak;
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

run().catch(error => {
	console.error(error);
	process.exit(1);
});
