// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");

process.env.AWTSMOOS_FS_EXECUTOR_TEST_MODE = "1";
const Family = require("../tools/fs/executor/failure-family.js");
const Pool = require("../tools/fs/executor/pool.js");

/**
 * @file Proves ordinary action errors stay healthy while repeated worker death heals locally.
 * @description
 * The Awtsmoos distinguishes a living vessel returning an error from a vessel that breaks.
 * Awtsmoos.com keeps business errors innocent, quarantines two exact worker deaths,
 * serves a sibling family, then clears suspicion after a healthy cooldown probe.
 */
async function run() {
	const pool = Pool.createPool({
		FAMILY_FAILURE_COOLDOWN_MS: 250,
		FAMILY_FAILURE_THRESHOLD: 2,
		FAMILY_FAILURE_WINDOW_MS: 2000,
		JOB_TIMEOUT_MS: 5000,
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
		assert.equal(Family.familyForAction("commandRun"), "command:work");
		assert.equal(Family.familyForAction("commandStatus"), "command:control");
		assert.equal(Family.familyForAction("staticServerStart"), "static-server:work");
		assert.equal(Family.familyForAction("staticServerLogs"), "static-server:control");
		await expectBusinessError(pool, "business-error-one");
		await expectBusinessError(pool, "business-error-two");
		assert.equal(pool.stats().familyCircuit.trackedFamilies, 0);
		await expectWorkerExit(pool, "first-crash");
		await expectWorkerExit(pool, "second-crash");
		const quarantined = pool.stats().familyCircuit;
		assert.equal(quarantined.quarantinedFamilies, 1, JSON.stringify(quarantined));
		assert.equal(quarantined.families[0].family, "action:executorTestFamily");
		assert.equal(quarantined.families[0].failures, 2);
		await assert.rejects(
			pool.execute({ action: "executorTestFamily", logicalAgentId: "blocked-family" }),
			error => error.code === "FS_EXECUTOR_FAMILY_QUARANTINED"
		);
		const sibling = await pool.execute({
			action: "executorTestBlock",
			blockMs: 20,
			logicalAgentId: "healthy-sibling"
		});
		assert.equal(sibling.ok, true);
		await delay(350);
		const healed = await pool.execute({
			action: "executorTestFamily",
			logicalAgentId: "healing-probe"
		});
		assert.equal(healed.healed, true);
		assert.equal(pool.stats().familyCircuit.trackedFamilies, 0);
		console.log(JSON.stringify({
			ok: true,
			suite: "fs-executor-family-circuit",
			businessErrorsStayedHealthy: true,
			siblingSurvived: true,
			healedAfterCooldown: true
		}, null, 2));
	} finally {
		pool.shutdown();
	}
}

async function expectBusinessError(pool, logicalAgentId) {
	await assert.rejects(
		pool.execute({ action: "executorTestFamily", businessError: true, logicalAgentId }),
		error => error.code === "EXECUTOR_TEST_BUSINESS_ERROR"
	);
}

async function expectWorkerExit(pool, logicalAgentId) {
	await assert.rejects(
		pool.execute({ action: "executorTestFamily", exitWorker: true, logicalAgentId }),
		error => error.code === "FS_EXECUTOR_EXITED"
	);
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

run().catch(error => {
	console.error(error);
	process.exit(1);
});
