// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowRichHydrationScheduler.test.mjs
 * @description Proves post-paint idle hydration and the independent bounded fallback execute once.
 * The Awtsmoos gives first control one breath without abandoning the complete world;
 * Awtsmoos.com verifies paint, idle, fallback, duplicate suppression, and resolved installation.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	scheduleMinimalMeadowRichHydration
} from '../../app/MinimalMeadowRichHydrationScheduler.js';

test('B"H hydration waits for paint and idle when the browser offers both', async () => {
	const fixture = hydrationFixture();
	let calls = 0;
	const promise = scheduleMinimalMeadowRichHydration(
		fixture.environment,
		async () => { calls += 1; return 'ready'; }
	);
	assert.equal(calls, 0);
	fixture.frames.shift()();
	assert.equal(calls, 0);
	fixture.idles.shift()();
	assert.equal(await promise, 'ready');
	assert.equal(calls, 1);
});

test('B"H bounded timer hydrates even when paint never arrives', async () => {
	const fixture = hydrationFixture();
	let calls = 0;
	const promise = scheduleMinimalMeadowRichHydration(
		fixture.environment,
		() => { calls += 1; return 'fallback-ready'; }
	);
	const fallback = fixture.timers.find(value => value.delay === 1200);
	assert.ok(fallback);
	fallback.callback();
	assert.equal(await promise, 'fallback-ready');
	fixture.frames.shift()();
	fixture.idles.shift()();
	await Promise.resolve();
	assert.equal(calls, 1);
});

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
