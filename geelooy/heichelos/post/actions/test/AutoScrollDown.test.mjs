// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AutoScrollDown.test.mjs
 * @description The Awtsmoos proves one semantic river contract: Off-first,
 * measured motion, live pace changes, pauses, lifecycle stop, and preference sync.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { createAutoScrollHarness } from './AutoScrollHarness.mjs';
const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

function advanceFrames(harness, startTime, count) {
	for (let index = 0; index < count; index += 1) {
		assert.equal(harness.runFrame(startTime + index * 16), true);
	}
}

test('complete measured semantic auto-scroll contract', async () => {
	const harness = createAutoScrollHarness();
	const river = await harness.loadRiver();
	const initial = river.initializeAutoScrollDownState();
	assert.equal(initial.active, false);
	assert.equal(initial.status, 'off');
	assert.equal(initial.unit, 'wpm');
	assert.equal(initial.value, 120);
	assert.equal(initial.preset, 'learn');
	assert.equal(initial.pixelsPerSecond, 40);

	const slow = river.setAutoScrollDownPace(40);
	assert.equal(slow.active, false);
	assert.equal(slow.value, 40);
	assert.equal(slow.preset, 'custom');
	assert.match(harness.storageValues.get('awtsmoos-reader-auto-scroll-pace-v3'), /"value":40/);

	harness.root.scrollTop = 0;
	river.startAutoScrollDown({ pace: 40 });
	advanceFrames(harness, 1000, 50);
	const slowDistance = harness.root.scrollTop;
	river.stopAutoScrollDown();
	assert.ok(slowDistance >= 5 && slowDistance <= 15, `slow distance ${slowDistance}`);

	harness.root.scrollTop = 0;
	river.startAutoScrollDown({ preset: 'review' });
	advanceFrames(harness, 3000, 50);
	const reviewDistance = harness.root.scrollTop;
	assert.ok(reviewDistance > slowDistance * 3);
	assert.equal(harness.classes.has('awtsmoos-auto-scroll-active'), true);
	assert.equal(river.pauseAutoScrollDown(), true);
	assert.equal(river.getAutoScrollDownState().status, 'paused');
	assert.equal(river.toggleAutoScrollDown(), true);
	assert.equal(river.getAutoScrollDownState().status, 'scrolling');

	river.pauseAutoScrollDown('manual-navigation');
	river.scheduleAutoScrollResume(1, 'manual-navigation');
	await wait(8);
	assert.equal(river.getAutoScrollDownState().status, 'scrolling');
	harness.fireWindow('pagehide');
	assert.equal(river.getAutoScrollDownState().active, false);

	harness.fireWindow('storage', {
		key: 'awtsmoos-reader-auto-scroll-pace-v3',
		newValue: JSON.stringify({ unit: 'lpm', value: 7.5, preset: 'review', eyeLine: 0.5 })
	});
	const synced = river.getAutoScrollDownState();
	assert.equal(synced.unit, 'lpm');
	assert.equal(synced.value, 7.5);
	assert.equal(synced.active, false);
	assert.ok(harness.emittedStates.every(state => 'estimateText' in state && 'paceText' in state));
	river.stopAutoScrollDown();
});
