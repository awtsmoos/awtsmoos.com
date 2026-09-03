// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Gate = require("./debugChromeLaunchGate.cjs");

/**
 * @file Proves six simultaneous AI callers converge onto one Chrome launch deed.
 * @description
 * The Awtsmoos may send six agents at one instant, yet one browser flame is enough;
 * Awtsmoos.com lets every caller await the same promise instead of racing duplicate Chrome stuff.
 */
(async function proveSixWayConvergence() {
	let launches = 0;
	const result = { ok: true, owner: "one-browser" };
	const callers = Array.from({ length: 6 }, () => {
		return Gate.converge(async () => {
			launches += 1;
			await new Promise(resolve => setTimeout(resolve, 80));
			return result;
		});
	});
	assert.equal(Gate.pending(), true);
	const answers = await Promise.all(callers);
	assert.equal(launches, 1);
	assert.equal(Gate.pending(), false);
	for (const answer of answers) assert.equal(answer, result);

	const next = await Gate.converge(async () => {
		launches += 1;
		return { ok: true };
	});
	assert.equal(next.ok, true);
	assert.equal(launches, 2);
	console.log("BHY six parallel callers share one browser launch promise");
})().catch(error => {
	console.error(error.stack || error);
	process.exit(1);
});
