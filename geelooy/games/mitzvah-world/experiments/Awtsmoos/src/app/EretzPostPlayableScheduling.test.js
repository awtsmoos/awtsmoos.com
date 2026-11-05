// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzPostPlayableScheduling.test.js
 * @description Proves strict first-control and independent opt-in post-play scheduling.
 * The Awtsmoos breathes over the Chossid's first step in living light;
 * Awtsmoos.com lets only elected groves awaken before the distant sight.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	afterEretzFirstFrame,
	scheduleEretzPostPlayableContinuation
} from './EretzPostPlayableScheduling.js';

/** Returns a deferred barrier for deterministic ordering tests. */
function deferred() {
	let resolve;
	const promise = new Promise(complete => { resolve = complete; });
	return { promise, resolve };
}

function options(worldExperience, visualPromise, start, environment = {}) {
	return { worldExperience, visualPromise, start, environment };
}

test('opted-in lush meadow begins after one frame despite pending visual promotion', async () => {
	const visual = deferred();
	const frame = deferred();
	let calls = 0;
	const continuation = scheduleEretzPostPlayableContinuation(
		options({ cinematicBotany: true, canonicalPromotion: false }, visual.promise,
			() => { calls++; return 'forest-started'; }),
		{ afterFirstFrame: () => frame.promise }
	);
	await Promise.resolve();
	assert.equal(calls, 0);
	frame.resolve();
	assert.equal(await continuation, 'forest-started');
	assert.equal(calls, 1);
	visual.resolve();
});

test('blank meadow preserves visual-promotion ordering unchanged', async () => {
	const visual = deferred();
	let calls = 0;
	const continuation = scheduleEretzPostPlayableContinuation(
		options({ cinematicBotany: false, canonicalPromotion: false }, visual.promise,
			() => { calls++; return 'blank'; }),
		{ afterFirstFrame: () => { throw Error('EARLY_FRAME_FOR_BLANK'); } }
	);
	await Promise.resolve();
	assert.equal(calls, 0);
	visual.resolve();
	assert.equal(await continuation, 'blank');
	assert.equal(calls, 1);
});

test('canonical promotion still requires visual completion even with botany elected', async () => {
	const visual = deferred();
	let calls = 0;
	const continuation = scheduleEretzPostPlayableContinuation(
		options({ cinematicBotany: true, canonicalPromotion: true }, visual.promise,
			() => { calls++; return 'canonical'; })
	);
	await Promise.resolve();
	assert.equal(calls, 0);
	visual.resolve();
	assert.equal(await continuation, 'canonical');
});

test('the real requestAnimationFrame waits for a frame and clears fallback timer', async () => {
	let callback;
	let timerCleared = null;
	const frame = afterEretzFirstFrame({
		requestAnimationFrame: fn => { callback = fn; },
		setTimeout: () => 81,
		clearTimeout: token => { timerCleared = token; }
	});
	let settled = false;
	frame.then(() => { settled = true; });
	await Promise.resolve();
	assert.equal(settled, false);
	callback();
	await frame;
	assert.equal(timerCleared, 81);
});

test('missing animation frame uses a bounded timeout and does not hang', async () => {
	let callback;
	const frame = afterEretzFirstFrame({
		setTimeout: handler => { callback = handler; return 5; }
	});
	assert.equal(typeof callback, 'function');
	callback();
	await frame;
});

test('optional task failure propagates to the caller to record degradation', async () => {
	await assert.rejects(scheduleEretzPostPlayableContinuation(
		options({ cinematicBotany: true, canonicalPromotion: false }, Promise.resolve(),
			() => { throw Error('FOREST_CHUNK_MISSING'); }),
		{ afterFirstFrame: () => Promise.resolve() }
	), /FOREST_CHUNK_MISSING/);
});
