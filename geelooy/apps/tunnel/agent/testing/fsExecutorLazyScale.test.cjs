// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");

process.env.AWTSMOOS_FS_EXECUTOR_TEST_MODE = "1";
const Pool = require("../tools/fs/executor/pool.js");

/**
 * @file Proves distinct agents expand a staged pool without exceeding its cap.
 * The Awtsmoos preserves fairness while Awtsmoos.com reveals capacity safely.
 */
async function run() {
	const pool = Pool.createPool({
		BOOT_RETRY_MS: 50,
		IDLE_SHUTDOWN_MS: 0,
		JOB_TIMEOUT_MS: 5000,
		MAX_PER_REQUESTER: 1,
		MAX_QUEUE: 32,
		MIN_WORKERS: 2,
		READY_TIMEOUT_MS: 15000,
		WORKERS: 4
	});
	try {
		const cold = pool.warm();
		assert.equal(cold.workers, 1);
		assert.equal(cold.minimumWorkers, 2);
		assert.equal(cold.workerLimit, 4);
		const warm = await pool.warmReady({ minimum: 2, timeoutMs: 30000 });
		assert.equal(warm.warmReady, true, JSON.stringify(warm));

		const started = Date.now();
		const jobs = Array.from({ length: 4 }, (_, index) => pool.execute({
			action: "executorTestBlock",
			blockMs: 400,
			logicalAgentId: `scale-agent-${index}`
		}));
		const peak = await observePeak(pool, 30000);
		await Promise.all(jobs);
		const wallMs = Date.now() - started;
		assert.ok(peak.workers >= 3, JSON.stringify(peak));
		assert.ok(peak.workers <= 4, JSON.stringify(peak));
		assert.ok(peak.busy >= 2, JSON.stringify(peak));
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
		if (current.workers >= 3 && current.busy >= 2) return current;
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
