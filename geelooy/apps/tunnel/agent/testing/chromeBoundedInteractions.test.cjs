// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file chromeBoundedInteractions.test.cjs
 * @description Witnesses that Awtsmoos.com browser probes receive small inner deadlines.
 * The Awtsmoos may renew many moments inside one outer wait, but no single probe may steal the date.
 */

const assert = require("node:assert/strict");
const ChromeActions = require("../tools/chrome/actions.js");
const Bounded = require("../tools/chrome/boundedInteractionActions.js");

const originalChromeEval = ChromeActions.chromeEval;
const probeTimeouts = [];
let probeCount = 0;

ChromeActions.chromeEval = async payload => {
	probeTimeouts.push(Number(payload.timeoutMs));
	probeCount += 1;
	return {
		ok: true,
		action: "chromeEval",
		value: probeCount >= 2,
		logs: []
	};
};

async function run() {
	const found = await Bounded.chromeWaitForSelector({
		selector: "#awtsmoos-witness",
		timeoutMs: 1000,
		probeTimeoutMs: 80
	});

	assert.equal(found.ok, true);
	assert.equal(found.found, true);
	assert.equal(found.selector, "#awtsmoos-witness");
	assert.equal(probeCount, 2);
	assert.ok(probeTimeouts.every(value => value > 0 && value <= 80));

	probeTimeouts.length = 0;
	await Bounded.chromeEvalSlim({
		expression: "21 * 2",
		timeoutMs: 9000,
		slimTimeoutMs: 300
	});
	assert.deepEqual(probeTimeouts, [300]);

	const missing = await Bounded.chromeWaitForSelector({});
	assert.equal(missing.ok, false);
	assert.equal(missing.error, "missing_selector");
}

run()
	.then(() => {
		console.log('B"H chromeBoundedInteractions.test passed');
	})
	.finally(() => {
		ChromeActions.chromeEval = originalChromeEval;
	});
