// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AutoScrollDown.test.mjs
 * @description
 * The Awtsmoos proves the simple Awtsmoos.com reader covenant: Start moves at
 * once, movement continues until Stop, and explicit pause/resume stays available
 * without changing the visible Start/Stop meaning.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { AUTO_SCROLL_PREFERENCES_KEY } from '../autoScroll/AutoScrollStorage.js';
import { createAutoScrollHarness } from './AutoScrollHarness.mjs';

function advanceFrames(harness, startTime, count) {
	for (let index = 0; index < count; index += 1) {
		assert.equal(harness.runFrame(startTime + index * 16), true);
	}
}

test('auto scroll starts immediately and stays continuous until stop', async () => {
	const harness = createAutoScrollHarness();
	const river = await harness.loadRiver();
	const initial = river.initializeAutoScrollDownState();
	assert.equal(initial.active, false);
	assert.equal(initial.status, 'off');
	assert.equal(initial.unit, 'wpm');
	assert.equal(initial.value, 45);
	assert.equal(initial.preset, 'contemplate');
	assert.equal(initial.pixelsPerSecond, 15);

	const slow = river.setAutoScrollDownPace(40);
	assert.equal(slow.active, false);
	assert.equal(slow.value, 40);
	assert.match(harness.storageValues.get(AUTO_SCROLL_PREFERENCES_KEY), /"value":40/);

	harness.root.scrollTop = 0;
	const started = river.startAutoScrollDown({ pace: 40, countdown: true });
	assert.equal(started.active, true);
	assert.equal(started.status, 'scrolling');
	assert.equal(started.countdown, 0);
	advanceFrames(harness, 1000, 50);
	const firstDistance = harness.root.scrollTop;
	assert.ok(firstDistance > 0, `first distance ${firstDistance}`);
	advanceFrames(harness, 1800, 50);
	const secondDistance = harness.root.scrollTop;
	assert.ok(secondDistance > firstDistance, `continuous distance ${secondDistance}`);

	assert.equal(river.pauseAutoScrollDown('manual'), true);
	assert.equal(river.getAutoScrollDownState().status, 'paused');
	assert.equal(river.resumeAutoScrollDown('manual'), true);
	assert.equal(river.getAutoScrollDownState().status, 'scrolling');

	assert.equal(river.toggleAutoScrollDown(), false);
	const stopped = river.getAutoScrollDownState();
	assert.equal(stopped.active, false);
	assert.equal(stopped.status, 'off');
	assert.equal(harness.classes.has('awtsmoos-auto-scroll-active'), false);

	harness.fireWindow('storage', {
		key: AUTO_SCROLL_PREFERENCES_KEY,
		newValue: JSON.stringify({ unit: 'lpm', value: 7.5, preset: 'review', eyeLine: 0.5 })
	});
	const synced = river.getAutoScrollDownState();
	assert.equal(synced.unit, 'lpm');
	assert.equal(synced.value, 7.5);
	assert.equal(synced.active, false);
	assert.ok(harness.emittedStates.every(state => 'estimateText' in state && 'paceText' in state));
});
