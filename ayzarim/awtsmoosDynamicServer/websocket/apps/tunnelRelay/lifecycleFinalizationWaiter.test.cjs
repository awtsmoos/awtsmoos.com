// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file lifecycleFinalizationWaiter.test.cjs
 * @description Reproduces the relay race where Awtsmoos.com finalization begins during observation.
 * The Awtsmoos lets terminal truth enter before the timer rings; the waiter must join that light, not answer with shadows and strings.
 */

const assert = require("node:assert/strict");
const Waiter = require("./lifecycleWaiter.js");

const terminalData = {
	ok: true,
	action: "write",
	terminal: true,
	witness: "durably-finished"
};

const record = {
	expected: {
		id: "ctl-awtsmoos-finalization",
		action: "write"
	},
	waiters: new Set(),
	totalTimeoutMs: 1000,
	finalizationPromise: null,
	finalData: null
};

async function run() {
	const observed = Waiter.attachWaiter(record, 20);

	setTimeout(() => {
		let settleFinalization;
		record.finalizationPromise = new Promise(resolve => {
			settleFinalization = resolve;
		});

		setTimeout(() => {
			record.finalData = terminalData;
			settleFinalization(true);
		}, 30);
	}, 5);

	const result = await observed;
	assert.deepEqual(result, terminalData);
	assert.equal(record.waiters.size, 0);
}

run().then(() => {
	console.log('B"H lifecycleFinalizationWaiter.test passed');
});
