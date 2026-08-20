// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");

process.env.AWTSMOOS_FS_EXECUTOR_TEST_MODE = "1";
const Pool = require("../tools/fs/executor/pool.js");

/**
 * @file Proves still-queued filesystem work expires before assignment while running work keeps its long clock.
 * @description
 * The Awtsmoos gives one worker's true deed time to finish, yet Awtsmoos.com
 * refuses to let a second unstarted deed wait forever and awaken after its caller has already moved on.
 */
async function run() {
	const pool = Pool.createPool({
		HEAVY_QUEUE_START_TIMEOUT_MS: 1000,
		JOB_TIMEOUT_MS: 5000,
		MAX_PER_REQUESTER: 1,
		MAX_QUEUE: 8,
		MIN_WORKERS: 1,
		QUEUE_START_TIMEOUT_MS: 1000,
		READY_TIMEOUT_MS: 15000,
		RESERVED_INTERACTIVE_WORKERS: 0,
		WORKERS: 1
	});
	try {
		await pool.warmReady({ minimum: 1, timeoutMs: 30000 });
		const running = pool.execute({
			action: "executorTestBlock",
			blockMs: 1800,
			logicalAgentId: "running-agent"
		}, { lane: "p3_heavy", requestId: "running-1" });
		await waitFor(() => pool.stats().busy === 1);
		const started = Date.now();
		let error;
		try {
			await pool.execute({
				action: "executorTestBlock",
				blockMs: 20,
				logicalAgentId: "queued-agent"
			}, { lane: "p1_fs_light", requestId: "queued-1" });
		} catch (caught) {
			error = caught;
		}
		const waitedMs = Date.now() - started;
		assert.equal(error?.code, "FS_EXECUTOR_START_TIMEOUT");
		assert.ok(waitedMs >= 900 && waitedMs < 1600, `waitedMs=${waitedMs}`);
		assert.equal(pool.stats().queued, 0);
		await running;
		await new Promise(resolve => setTimeout(resolve, 100));
		assert.equal(pool.stats().queued, 0);
		assert.equal(pool.stats().busy, 0);
		console.log(JSON.stringify({ ok: true, suite: "fs-executor-queue-start-timeout", waitedMs }, null, 2));
	} finally {
		pool.shutdown();
	}
}

async function waitFor(predicate, timeoutMs = 5000) {
	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		if (predicate()) return;
		await new Promise(resolve => setTimeout(resolve, 10));
	}
	throw new Error("wait_timeout");
}

run().catch(error => { console.error(error); process.exit(1); });
