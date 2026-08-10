// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Pressure = require("../tools/fs/actionGroups/websiteAgents/runner/turnPressure.js");

/**
 * @file Proves logical website fan-out stays bounded without duplicate work.
 * @description
 * The Awtsmoos reveals many child minds while Awtsmoos.com lets only measured admissions run;
 * jitter softens each logical edge, every item executes once, and no browser stampede is begun.
 */
(async () => {
	let active = 0;
	let maximumActive = 0;
	const seen = [];
	const items = Array.from({ length: 12 }, (_, index) => index);
	const results = await Pressure.runBounded(
		items,
		async item => {
			active += 1;
			maximumActive = Math.max(maximumActive, active);
			seen.push(item);
			await delay(5);
			active -= 1;
			return item * 2;
		},
		{
			concurrency: 2,
			minimumJitterMs: 0,
			maximumJitterMs: 0,
			random: () => 0.5
		}
	);
	assert.equal(maximumActive <= 2, true);
	assert.deepEqual([...seen].sort((a, b) => a - b), items);
	assert.equal(new Set(seen).size, items.length);
	assert.equal(results.length, items.length);
	assert.equal(results.every(result => result.status === "fulfilled"), true);
	assert.equal(Pressure.jitterMs({ minimumJitterMs: 150, maximumJitterMs: 450, random: () => 0 }), 150);
	assert.equal(Pressure.jitterMs({ minimumJitterMs: 150, maximumJitterMs: 450, random: () => 1 }), 450);
	assert.equal(Pressure.bounded(99, 2, 1, 4), 4);
	console.log(JSON.stringify({
		ok: true,
		suite: "website-turn-pressure",
		maximumActive,
		executedOnce: true
	}));
})().catch(error => {
	console.error(error.stack || error);
	process.exitCode = 1;
});

function delay(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
