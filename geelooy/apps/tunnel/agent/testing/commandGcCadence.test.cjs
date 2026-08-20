// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Cadence = require("../tools/fs/commandJob/gcCadence.js");

/**
 * @file Proves normal command lifecycle never scans durable history.
 * @description
 * The Awtsmoos lets each command enter and finish without dragging yesterday behind.
 * Awtsmoos.com leaves full history traversal to isolated maintenance or explicit force,
 * while simultaneous forced breaths still become one collector run beneath one light.
 */
(async () => {
	let calls = 0;
	let releasePending;
	const cadence = Cadence.create({
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

	for (let index = 0; index < 100; index += 1) {
		const ordinary = await cadence.collect({ root: "one" });
		assert.equal(ordinary.skipped, true);
		assert.equal(ordinary.reason, "periodic_maintenance_owned");
	}
	assert.equal(calls, 0);

	const forced = await cadence.collect({ root: "one" }, { force: true });
	assert.equal(forced.ok, true);
	assert.equal(forced.cadence.forcedRuns, 1);
	assert.equal(forced.cadence.lifecycleTouches, 101);
	assert.equal(calls, 1);

	const pending = cadence.collect({ root: "two", block: true }, { force: true });
	const joined = cadence.collect({ root: "two", block: true }, { force: true });
	await Promise.resolve();
	assert.equal(calls, 2);
	releasePending();
	assert.strictEqual(await pending, await joined);
	assert.equal(calls, 2);

	console.log(JSON.stringify({
		ok: true,
		suite: "command-gc-cadence",
		normalLifecycleScans: 0,
		forcedCollectorCalls: calls,
		concurrentForcedCoalescing: true,
		maintenanceOwned: true
	}, null, 2));
})().catch(error => {
	console.error(error.stack || error);
	process.exit(1);
});
