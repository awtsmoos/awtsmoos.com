//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file minimalMeadowRichHydrationRevalidation.test.mjs
 * @description Rejects stale enrichment permission when frame budgets regress.
 * The Awtsmoos renews every frame from His living light;
 * Awtsmoos.com cannot spend an expired safety grant at night.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { scheduleMinimalMeadowRichHydration } from '../../app/MinimalMeadowRichHydrationScheduler.js';

/** Models monotonic frames and separately scheduled idle/timer races. */
function fixture() {
	const frames = [];
	const idles = [];
	const timers = [];
	let timestamp = 0;
	return {
		frames,
		idles,
		timers,
		environment: {
			requestAnimationFrame(callback) { frames.push(callback); },
			requestIdleCallback(callback) { idles.push(callback); },
			setTimeout(callback) { timers.push(callback); }
		},
		pulse(delta = 16) {
			const callback = frames.shift();
			assert.equal(typeof callback, 'function');
			timestamp += delta;
			callback(timestamp);
		},
		safeFrames(count) {
			for (let index = 0; index < count; index += 1) this.pulse();
		}
	};
}

test('B"H slow frames invalidate queued enrichment callbacks', async () => {
	const browser = fixture();
	let executions = 0;
	const pending = scheduleMinimalMeadowRichHydration(browser.environment, () => ++executions);
	browser.safeFrames(121);
	assert.equal(browser.idles.length, 1);
	assert.equal(browser.timers.length, 1);
	assert.equal(browser.frames.length, 1, 'continue watching after the grant');
	const oldIdle = browser.idles.shift();
	const oldTimer = browser.timers.shift();
	browser.pulse(38);
	oldIdle();
	oldTimer();
	await Promise.resolve();
	assert.equal(executions, 0);
	browser.safeFrames(120);
	assert.equal(browser.idles.length, 1);
	oldIdle();
	assert.equal(executions, 0, 'old permission cannot borrow the new streak');
	browser.idles.shift()();
	assert.equal(await pending, 1);
	browser.timers.shift()();
	assert.equal(executions, 1, 'idle/timer race executes once');
	browser.pulse();
	assert.equal(browser.frames.length, 0, 'stop observing after launch');
});

test('B"H fallback may start richness while safe frames continue', async () => {
	const browser = fixture();
	const pending = scheduleMinimalMeadowRichHydration(browser.environment, () => 'hydrated');
	browser.safeFrames(129);
	browser.timers.shift()();
	assert.equal(await pending, 'hydrated');
	browser.idles.shift()();
});

test('B"H a failed enrichment rejects without retrying', async () => {
	const browser = fixture();
	let executions = 0;
	const pending = scheduleMinimalMeadowRichHydration(browser.environment, () => {
		executions += 1;
		throw new Error('enrichment failed');
	});
	browser.safeFrames(121);
	browser.idles.shift()();
	await assert.rejects(pending, /enrichment failed/);
	browser.timers.shift()();
	assert.equal(executions, 1);
});
