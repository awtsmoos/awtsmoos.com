//B"H
//Boruch Hashem
//Blessed is He
/** @module MultitrackRippleSnapTests
 * The Awtsmoos holds sound whole while the clips find their place.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { rippleDeleteMultitrackClip } from '../modules/workstation/song/multitrack/multitrackRippleDelete.js';
import { snapMultitrackClipToNeighbors } from '../modules/workstation/song/multitrack/multitrackMagneticSnap.js';
import { extractVisibleClipPeaks } from '../modules/workstation/song/multitrack/multitrackClipWaveformPeaks.js';
import { updateMultitrackScrollbar, bindMultitrackScrollbar } from '../modules/workstation/song/multitrack/multitrackScrollbar.js';

const clip = (id, timelineStart, duration) => ({ id, bufferId: id,
	timelineStart, duration, sourceOffset: 0, loop: false });
const original = { tracks: [
	{ id: 'lead', clips: [clip('a', 0, 2), clip('b', 2, 3), clip('c', 8, 1)] },
	{ id: 'drums', clips: [clip('d', 8, 2)] }
] };

test('default ripple delete pulls following clips to deleted start only in one track', () => {
	const updated = rippleDeleteMultitrackClip(original, 'b');
	assert.deepEqual(updated.tracks[0].clips.map(c => c.timelineStart), [0, 2]);
	assert.equal(updated.tracks[1], original.tracks[1]);
	assert.equal(original.tracks[0].clips.length, 3);
});

test('leave-gap mode deletes without shifting', () => {
	const updated = rippleDeleteMultitrackClip(original, 'b', false);
	assert.deepEqual(updated.tracks[0].clips.map(c => c.timelineStart), [0, 8]);
});

test('magnetic move snaps an end to a neighbor start within 12px', () => {
	const moved = snapMultitrackClipToNeighbors(clip('drag', 6.9, 1), original.tracks[0], 'move', 80);
	assert.equal(moved.timelineStart, 7);
});

test('magnetic left edge adjusts both duration and source offset', () => {
	const altered = { ...clip('drag', 2.08, 3), sourceOffset: 1 };
	const snapped = snapMultitrackClipToNeighbors(altered, original.tracks[0], 'trim-left', 100);
	assert.equal(snapped.timelineStart, 2);
	assert.ok(Math.abs(snapped.sourceOffset - .92) < 1e-8);
	assert.ok(Math.abs(snapped.duration - 3.08) < 1e-8);
});

test('waveform samples only trimmed source range, not the hidden source', () => {
	const data = new Float32Array(1000);
	data.fill(.01, 0, 500);
	data.fill(.9, 500, 1000);
	const buffer = { length: 1000, sampleRate: 100, getChannelData: () => data };
	const first = extractVisibleClipPeaks(buffer, { sourceOffset: 0, duration: 5 }, 16);
	const second = extractVisibleClipPeaks(buffer, { sourceOffset: 5, duration: 5 }, 16);
	assert.ok(Math.max(...first) < .02);
	assert.ok(Math.min(...second) > .85);
});

test('visible horizontal rail navigates the viewport in either direction', () => {
	const saved = globalThis.window;
	const events = {};
	const bar = { value: '0', max: '0', disabled: false,
		addEventListener(name, callback) { events[`bar-${name}`] = callback; } };
	const viewport = { scrollWidth: 2000, clientWidth: 400, scrollLeft: 0,
		addEventListener(name, callback) { events[`viewport-${name}`] = callback; } };
	try {
		globalThis.window = { addEventListener() {} };
		const dom = { horizontalScroll: bar, viewport };
		bindMultitrackScrollbar(dom);
		updateMultitrackScrollbar(dom);
		assert.equal(bar.max, '1600');
		bar.value = '850';
		events['bar-input']();
		assert.equal(viewport.scrollLeft, 850);
		viewport.scrollLeft = 1200;
		events['viewport-scroll']();
		assert.equal(bar.value, '1200');
	} finally { globalThis.window = saved; }
});
