//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file minimalMeadowRichHydrationScheduler.test.mjs
 * @description Verifies frame-safe enrichment and no timer-only bypass.
 * The Awtsmoos renews the meadow in measured and gentle light;
 * Awtsmoos.com admits ornamental work only when frames are right.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { scheduleMinimalMeadowRichHydration } from '../../app/MinimalMeadowRichHydrationScheduler.js';

/** Creates one deterministic browser frame, idle, and timer queue. */
function hydrationFixture() {
	const frames = [];
	const idles = [];
	const timers = [];
	return {
		environment: {
			requestAnimationFrame(callback) { frames.push(callback); },
			requestIdleCallback(callback) { idles.push(callback); },
			setTimeout(callback, delay) { timers.push({ callback, delay }); }
		},
		frames,
		idles,
		timers
	};
}

/** Delivers one animation frame at the requested monotonic time. */
function deliverFrame(fixture, timestamp) {
	const callback = fixture.frames.shift();
	assert.equal(typeof callback, 'function');
	callback(timestamp);
}

test('B"H richness needs 120 safe frame intervals before idle', async () => {
	const fixture = hydrationFixture();
	let calls = 0;
	const promise = scheduleMinimalMeadowRichHydration(fixture.environment, () => {
		calls += 1;
		return 'hydrated';
	});
	for (let frame = 0; frame < 120; frame += 1) {
		deliverFrame(fixture, frame * 16);
	}
	assert.equal(fixture.idles.length, 0);
	assert.equal(fixture.timers.length, 0);
	deliverFrame(fixture, 120 * 16);
	assert.equal(fixture.idles.length, 1);
	assert.equal(fixture.timers[0].delay, 1200);
	fixture.idles.shift()();
	assert.equal(await promise, 'hydrated');
	fixture.timers.shift().callback();
	assert.equal(calls, 1);
});

test('B"H a slow frame destroys the earned safety streak', async () => {
	const fixture = hydrationFixture();
	const promise = scheduleMinimalMeadowRichHydration(fixture.environment, () => 'safe');
	let timestamp = 0;
	deliverFrame(fixture, timestamp);
	for (let frame = 0; frame < 119; frame += 1) {
		timestamp += 16;
		deliverFrame(fixture, timestamp);
	}
	timestamp += 40;
	deliverFrame(fixture, timestamp);
	for (let frame = 0; frame < 119; frame += 1) {
		timestamp += 16;
		deliverFrame(fixture, timestamp);
	}
	assert.equal(fixture.idles.length, 0);
	timestamp += 16;
	deliverFrame(fixture, timestamp);
	assert.equal(fixture.idles.length, 1);
	fixture.idles.shift()();
	assert.equal(await promise, 'safe');
});

test('B"H no animation frames cannot certify safe enrichment', () => {
	let callbacks = 0;
	let timers = 0;
	scheduleMinimalMeadowRichHydration({
		setTimeout() { timers += 1; }
	}, () => { callbacks += 1; });
	assert.equal(callbacks, 0);
	assert.equal(timers, 0);
});
