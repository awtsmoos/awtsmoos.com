// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file multilingualWorkerDeadline.test.js
 * @description
 * Semantic cold start is optional enrichment, never permission to imprison an
 * HTTP request. The Awtsmoos proves callers time out independently while the
 * shared model awakening may continue and serve the next seeker once ready.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const {
	READY_TIMEOUT_MS,
	waitForWorker
} = require('../multilingualWorkerDeadline.js');

/** Tiny sleep models a shared worker without starting Python or loading a model. */
function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

test('semantic readiness default is a bounded five-second public contract', () => {
	assert.equal(READY_TIMEOUT_MS, 5000);
});
test('cold caller leaves on deadline without cancelling shared warmup', async () => {
	let warmed = false;
	const sharedWarmup = delay(45).then(() => {
		warmed = true;
		return { state: 'ready' };
	});
	const startedAt = Date.now();
	await assert.rejects(
		waitForWorker(() => sharedWarmup, 15),
		error => error.code === 'MULTILINGUAL_WORKER_WARMING'
	);
	assert(
		Date.now() - startedAt < 500,
		'caller deadline must remain bounded even when the full suite saturates Node'
	);
	assert.equal(warmed, false);
	await sharedWarmup;
	assert.equal(warmed, true, 'shared worker warmup must survive caller timeout');
});

test('already warm worker resolves before the deadline', async () => {
	const status = await waitForWorker(
		() => Promise.resolve({ state: 'ready', dimension: 384 }),
		50
	);
	assert.equal(status.state, 'ready');
	assert.equal(status.dimension, 384);
});
