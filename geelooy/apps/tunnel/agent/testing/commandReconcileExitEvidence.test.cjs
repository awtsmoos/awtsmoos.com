// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Evidence = require("../tools/fs/commandJob/reconcileExitEvidence.js");

/**
 * @file Proves detached reconciliation waits briefly for true terminal or living ownership evidence.
 * @description
 * The Awtsmoos lets a finished command reveal its honest end before absence is branded lost;
 * Awtsmoos.com keeps the grace bounded, so genuine orphans still cross the proper frost.
 */
async function main() {
	await terminalMetaWins();
	await liveOwnerWins();
	await orphanExpires();
	settledVocabularyStaysExact();
	console.log("BHY detached exit evidence protects normal finalization without hiding true orphans");
}

/** Terminal metadata appearing during the bounded race must outrank stale-lost inference. */
async function terminalMetaWins() {
	let reads = 0;
	const context = fakeContext(async () => {
		reads += 1;
		return reads < 3
			? { status: "running" }
			: { status: "completed", exitCode: 0 };
	});
	const result = await Evidence.awaitEvidence(context, {}, "job-terminal", {
		waitMs: 100,
		pollMs: 5
	});
	assert.equal(result.kind, "meta");
	assert.equal(result.meta.status, "completed");
	assert.ok(reads >= 3);
}

/** A live owner that reappears while finalization races must be merged instead of terminalized. */
async function liveOwnerWins() {
	const context = fakeContext(async () => ({ status: "running" }));
	setTimeout(() => {
		context.activeJobs.set("job-live", { meta: { status: "running", workerId: "worker-live" } });
	}, 15);
	const result = await Evidence.awaitEvidence(context, {}, "job-live", {
		waitMs: 100,
		pollMs: 5
	});
	assert.equal(result.kind, "live");
	assert.equal(result.live.meta.workerId, "worker-live");
}

/** A dead process with no durable or live successor remains eligible for stale-lost recovery. */
async function orphanExpires() {
	const context = fakeContext(async () => ({ status: "running" }));
	const result = await Evidence.awaitEvidence(context, {}, "job-orphan", {
		waitMs: 25,
		pollMs: 5
	});
	assert.equal(result, null);
}

/** Settled vocabulary must recognize terminal, queued, and other non-running durable states only. */
function settledVocabularyStaysExact() {
	const context = fakeContext(async () => null);
	assert.equal(Evidence.settled(context, { status: "completed" }), true);
	assert.equal(Evidence.settled(context, { status: "queued" }), true);
	assert.equal(Evidence.settled(context, { status: "identity_unverified" }), true);
	assert.equal(Evidence.settled(context, { status: "running" }), false);
	assert.equal(Evidence.settled(context, { status: "spawning" }), false);
}

function fakeContext(read) {
	return {
		activeJobs: new Map(),
		Meta: { read },
		Policy: { TERMINAL: new Set(["completed", "failed", "cancelled", "stale_lost_worker"]) },
		running(status) {
			return ["queued", "spawning", "running", "detached_running", "cancelling", "cleaning", "reaping"]
				.includes(String(status || ""));
		}
	};
}

main().catch(error => {
	console.error(error.stack || error);
	process.exit(1);
});
