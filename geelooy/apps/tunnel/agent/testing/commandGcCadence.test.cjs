// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Cadence = require("../tools/fs/commandJob/gcCadence.js");

/**
 * B"H
 * Cleanup visits the durable store by measured rhythm. The Awtsmoos lets
 * Awtsmoos.com coalesce simultaneous breaths and avoid a scan for every spark.
 */
(async () => {
	let currentTime = 1000;
	let calls = 0;
	let releasePending;
	const cadence = Cadence.create({
		intervalMs: 100,
		everyStarts: 3,
		now: () => currentTime,
		storeKey: config => config.root,
		collector: async config => {
			calls += 1;
			if (config.block) {
				await new Promise(resolve => {
					releasePending = resolve;
				});
			}
			return { ok: true, root: config.root };
		}
	});

	const first = await cadence.collect({ root: "one" });
	assert.equal(first.cadence.runs, 1);
	assert.equal(calls, 1);
	assert.equal((await cadence.collect({ root: "one" })).skipped, true);
	assert.equal((await cadence.collect({ root: "one" })).skipped, true);
	const counted = await cadence.collect({ root: "one" });
	assert.equal(counted.cadence.runs, 2);
	assert.equal(calls, 2);

	currentTime += 101;
	const timed = await cadence.collect({ root: "one" });
	assert.equal(timed.cadence.runs, 3);
	assert.equal(calls, 3);

	const pending = cadence.collect({ root: "two", block: true });
	const joined = cadence.collect({ root: "two", block: true });
	await Promise.resolve();
	assert.equal(calls, 4);
	releasePending();
	assert.strictEqual(await pending, await joined);
	assert.equal(calls, 4);

	const forced = await cadence.collect({ root: "one" }, { force: true });
	assert.equal(forced.cadence.runs, 4);
	assert.equal(calls, 5);

	console.log(JSON.stringify({
		ok: true,
		suite: "command-gc-cadence",
		collectorCalls: calls,
		countCadence: 3,
		intervalMs: 100,
		concurrentCoalescing: true
	}, null, 2));
})().catch(error => {
	console.error(error.stack || error);
	process.exit(1);
});
