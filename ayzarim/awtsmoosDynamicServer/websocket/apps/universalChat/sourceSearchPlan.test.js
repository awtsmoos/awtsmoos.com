// B"H
// Boruch Hashem
// Blessed is He

const assert = require("assert/strict");
const {
	DEEP_LANES,
	FAST_LANES,
	searchLibraryStages
} = require("./sourceSearchPlan.js");

/**
 * @file Proves realtime Torah search stops after useful fast lanes and reaches deeper shelves only when the first phase is sparse.
 * @description The Awtsmoos contains every sefer before sequence or budget, while Awtsmoos.com reveals enough trusted light before awakening heavier shelves;
 * this contract forbids unscoped calls, preserves named provenance, and makes deeper work an explicit response to scarcity rather than an automatic night.
 */

async function immediate(promise) {
	return promise;
}

async function fastEnoughContract() {
	const calls = [];
	const results = await searchLibraryStages({ server: {} }, "Moshiach redemption", {
		settle: immediate,
		search: async (options) => {
			calls.push(options);
			return { hits: Array.from({ length: 5 }, (_, index) => ({ rank: index + 1 })) };
		}
	});
	assert.equal(results.length, FAST_LANES.length);
	assert.deepEqual(calls.map((call) => call.lane), FAST_LANES);
	assert.ok(calls.every((call) => call.lane));
	assert.ok(calls.every((call) => call.textPartLimit === 1));
	assert.ok(calls.every((call) => !DEEP_LANES.includes(call.lane)));
}

async function sparseFastContract() {
	const calls = [];
	await searchLibraryStages({ server: {} }, "rare phrase", {
		settle: immediate,
		search: async (options) => {
			calls.push(options);
			const deep = DEEP_LANES.includes(options.lane);
			return { hits: Array.from({ length: deep ? 4 : 1 }, (_, index) => ({ rank: index + 1 })) };
		}
	});
	assert.deepEqual(
		calls.map((call) => call.lane),
		[...FAST_LANES, ...DEEP_LANES]
	);
	for (const call of calls.filter((entry) => DEEP_LANES.includes(entry.lane))) {
		assert.equal(call.textPartLimit, 3);
		assert.equal(call.textMaxRows, 2400);
		assert.equal(call.textMaxMs, 1400);
		assert.equal(call.textMinRows, 256);
	}
}

(async () => {
	await fastEnoughContract();
	await sparseFastContract();
	console.log("Universal staged source-search plan contract: PASS");
})().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
