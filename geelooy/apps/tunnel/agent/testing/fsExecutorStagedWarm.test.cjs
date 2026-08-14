// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Pool = require("../tools/fs/executor/pool.js");

/** Proves cold executors enter one at a time instead of forming a boot storm. */
async function run() {
	const pool = Pool.createPool({
		IDLE_SHUTDOWN_MS: 0,
		MIN_WORKERS: 4,
		READY_TIMEOUT_MS: 30000,
		WORKERS: 4
	});
	try {
		const cold = pool.warm();
		assert.equal(cold.workers, 1);
		assert.equal(cold.starting, 1);
		const warm = await pool.warmReady({ minimum: 4, timeoutMs: 30000 });
		assert.equal(warm.warmReady, true, JSON.stringify(warm));
		assert.equal(warm.ready, 4);
		assert.equal(warm.bootFailures, 0);
		console.log(JSON.stringify({ ok: true, suite: "fs-executor-staged-warm", warm }));
	} finally {
		pool.shutdown();
	}
}

run().catch(error => {
	console.error(error);
	process.exit(1);
});
