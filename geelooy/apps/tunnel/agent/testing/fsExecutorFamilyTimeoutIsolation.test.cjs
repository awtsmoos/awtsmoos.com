// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");

process.env.AWTSMOOS_FS_EXECUTOR_TEST_MODE = "1";
const Pool = require("../tools/fs/executor/pool.js");

/**
 * @file Proves repeated execution timeout quarantines only the frozen action family.
 * @description
 * The Awtsmoos lets a frozen vessel end without freezing every sibling road.
 * Awtsmoos.com counts two exact timeouts, rests that family, serves another family,
 * then returns the frozen family after cooldown when a short healthy deed completes.
 */
async function run() {
	const pool = Pool.createPool({
		FAMILY_FAILURE_COOLDOWN_MS: 250,
		FAMILY_FAILURE_THRESHOLD: 2,
		FAMILY_FAILURE_WINDOW_MS: 2000,
		JOB_TIMEOUT_MS: 120,
		MAX_PER_REQUESTER: 2,
		MAX_QUEUE: 32,
		MIN_WORKERS: 2,
		QUEUE_START_TIMEOUT_MS: 2000,
		READY_TIMEOUT_MS: 15000,
		WORKERS: 3
	});
	try {
		const warm = await pool.warmReady({ minimum: 2, timeoutMs: 30000 });
		assert.equal(warm.warmReady, true, JSON.stringify(warm));
		await expectTimeout(pool, "timeout-one");
		await expectTimeout(pool, "timeout-two");
		const circuit = pool.stats().familyCircuit;
		assert.equal(circuit.quarantinedFamilies, 1, JSON.stringify(circuit));
		assert.equal(circuit.families[0].family, "action:executorTestBlock");
		assert.equal(circuit.families[0].lastCode, "FS_EXECUTOR_TIMEOUT");
		await assert.rejects(
			pool.execute({ action: "executorTestBlock", blockMs: 10 }),
			error => error.code === "FS_EXECUTOR_FAMILY_QUARANTINED"
		);
		const sibling = await pool.execute({
			action: "executorTestFamily",
			logicalAgentId: "timeout-sibling"
		});
		assert.equal(sibling.healed, true);
		await delay(350);
		const healed = await pool.execute({
			action: "executorTestBlock",
			blockMs: 20,
			logicalAgentId: "timeout-healing-probe"
		});
		assert.equal(healed.ok, true);
		assert.equal(pool.stats().familyCircuit.trackedFamilies, 0);
		console.log(JSON.stringify({
			ok: true,
			suite: "fs-executor-family-timeout-isolation",
			siblingSurvived: true,
			healedAfterCooldown: true
		}, null, 2));
	} finally {
		pool.shutdown();
	}
}

async function expectTimeout(pool, logicalAgentId) {
	await assert.rejects(
		pool.execute({
			action: "executorTestBlock",
			blockMs: 400,
			logicalAgentId
		}),
		error => error.code === "FS_EXECUTOR_TIMEOUT"
	);
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

run().catch(error => {
	console.error(error);
	process.exit(1);
});
