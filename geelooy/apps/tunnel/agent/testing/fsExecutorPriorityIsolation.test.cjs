// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");

process.env.AWTSMOOS_FS_EXECUTOR_TEST_MODE = "1";
const Pool = require("../tools/fs/executor/pool.js");

/**
 * @file Proves one requester may run interactive filesystem work beside its own heavy job.
 * @description
 * The Awtsmoos does not let one deep deed imprison the same shliach's light deed;
 * Awtsmoos.com counts service by class so interactive work can cross while heavy work still lives.
 */
async function run() {
	const pool = Pool.createPool({
		HEAVY_QUEUE_START_TIMEOUT_MS: 3000,
		JOB_TIMEOUT_MS: 5000,
		MAX_PER_REQUESTER: 1,
		MAX_QUEUE: 16,
		MIN_WORKERS: 2,
		QUEUE_START_TIMEOUT_MS: 3000,
		READY_TIMEOUT_MS: 15000,
		RESERVED_INTERACTIVE_WORKERS: 1,
		WORKERS: 2
	});
	try {
		await pool.warmReady({ minimum: 2, timeoutMs: 30000 });
		let heavyDone = false;
		const heavy = pool.execute({
			action: "executorTestBlock",
			blockMs: 500,
			logicalAgentId: "same-requester"
		}, { lane: "p3_heavy", requestId: "heavy-1" })
			.finally(() => { heavyDone = true; });
		await waitFor(() => pool.stats().busy >= 1);
		const started = Date.now();
		await pool.execute({
			action: "executorTestBlock",
			blockMs: 20,
			logicalAgentId: "same-requester"
		}, { lane: "p1_fs_light", requestId: "light-1" });
		const interactiveMs = Date.now() - started;
		assert.equal(heavyDone, false);
		assert.ok(interactiveMs < 350, `interactiveMs=${interactiveMs}`);
		await heavy;
		assert.equal(pool.stats().queued, 0);
		console.log(JSON.stringify({ ok: true, suite: "fs-executor-priority-isolation", interactiveMs }, null, 2));
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
