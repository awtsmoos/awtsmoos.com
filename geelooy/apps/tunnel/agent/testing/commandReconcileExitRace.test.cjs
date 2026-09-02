// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fsp = require("node:fs/promises");
const Store = require("../tools/fs/commandJobStore.js");
const Fixture = require("./commandReconciliationFixture.cjs");

/**
 * @file Proves normal durable exit testimony outranks dead-process lost-worker inference.
 * @description
 * The Awtsmoos renews the final instant as surely as the first; Awtsmoos.com therefore
 * gives a finished command one bounded doorway to reveal completion before absence is
 * named loss. True orphans still cross the frost after that doorway closes its course.
 *
 * STABILITY COVENANT — DO NOT SIMPLIFY WITHOUT RUNNING THIS REGRESSION
 * Symptom: successful command exit became stale_lost_worker. Root cause: PID death won
 * before meta.json finalization. Forbidden simplification: dead PID means lost command.
 */
async function main() {
	const config = await Fixture.createConfig("awts-exit-race-");
	try {
		await durableCompletionWins(config);
		await trueOrphanStillExpires(config);
	} finally {
		await fsp.rm(config.root, { recursive: true, force: true });
	}
	console.log("BHY terminal exit evidence wins its bounded race while true orphans remain lost");
}

/** Writes completed metadata during reconciliation and proves commandStatus returns it. */
async function durableCompletionWins(config) {
	const jobId = "normal-exit-race";
	const running = Fixture.commandMeta(
		jobId,
		Fixture.identity(99999981, "dead-normal-exit", 0)
	);
	await Fixture.writeJob(config, jobId, running);
	const writer = delayedCompletion(config, jobId, running);
	const status = await Store.commandStatus(config, { jobId });
	await writer;
	assert.equal(status.status, "completed");
	assert.equal(status.exitCode, 0);
	assert.equal(status.receipt.state, "completed");
	assert.notEqual(status.status, "stale_lost_worker");
}

/** Verifies the grace stays bounded and does not hide an actually abandoned dead worker. */
async function trueOrphanStillExpires(config) {
	const jobId = "true-orphan";
	const running = Fixture.commandMeta(
		jobId,
		Fixture.identity(99999982, "dead-true-orphan", 0)
	);
	await Fixture.writeJob(config, jobId, running);
	const startedAt = Date.now();
	const status = await Store.commandStatus(config, { jobId });
	assert.equal(status.status, "stale_lost_worker");
	assert.ok(Date.now() - startedAt >= 900);
}

/** Publishes the same job's honest terminal deed while the bounded observer is waiting. */
async function delayedCompletion(config, jobId, running) {
	await Fixture.delay(50);
	const completed = {
		...running,
		status: "completed",
		exitCode: 0,
		finishedAt: new Date().toISOString(),
		worker: { ...running.worker, state: "completed", exitCode: 0 },
		receipt: { ...running.receipt, state: "completed", exitCode: 0 }
	};
	await Fixture.writeJob(config, jobId, completed);
}

main().catch(error => {
	console.error(error.stack || error);
	process.exit(1);
});
