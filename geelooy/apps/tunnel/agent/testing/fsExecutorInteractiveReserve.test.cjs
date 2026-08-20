// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");

process.env.AWTSMOOS_FS_EXECUTOR_TEST_MODE = "1";
const Pool = require("../tools/fs/executor/pool.js");

/**
 * @file Proves heavy saturation preserves one physical filesystem worker for interactive work.
 * @description
 * The Awtsmoos lets many deep deeds gather without sealing every doorway;
 * Awtsmoos.com keeps one warm worker free so control and light work can still cross the room.
 */
async function run() {
	const pool = Pool.createPool({
		HEAVY_QUEUE_START_TIMEOUT_MS: 3000,
		JOB_TIMEOUT_MS: 5000,
		MAX_PER_REQUESTER: 1,
		MAX_QUEUE: 16,
		MIN_WORKERS: 3,
		QUEUE_START_TIMEOUT_MS: 3000,
		READY_TIMEOUT_MS: 15000,
		RESERVED_INTERACTIVE_WORKERS: 1,
		WORKERS: 3
	});
	try {
		await pool.warmReady({ minimum: 3, timeoutMs: 30000 });
		let heavyDone = 0;
		const heavyJobs = Array.from({ length: 3 }, (_, index) => pool.execute({
			action: "executorTestBlock",
			blockMs: 500,
			logicalAgentId: `heavy-${index}`
		}, { lane: "p3_heavy", requestId: `heavy-${index}` })
			.finally(() => { heavyDone += 1; }));
		await waitFor(() => pool.stats().busy === 2 && pool.stats().queued >= 1);
		const before = pool.stats();
		assert.equal(before.reservedInteractiveWorkers, 1);
		const started = Date.now();
		await pool.execute({
			action: "executorTestBlock",
			blockMs: 20,
			logicalAgentId: "interactive"
		}, { lane: "p1_fs_light", requestId: "interactive-1" });
		const interactiveMs = Date.now() - started;
		assert.equal(heavyDone, 0);
		assert.ok(interactiveMs < 350, `interactiveMs=${interactiveMs}`);
		await Promise.all(heavyJobs);
		assert.equal(pool.stats().queued, 0);
		console.log(JSON.stringify({ ok: true, suite: "fs-executor-interactive-reserve", interactiveMs }, null, 2));
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
