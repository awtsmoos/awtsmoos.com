//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file multitrackClipMath.test.mjs
 * @description
 * Gevurah proves that finite clip boundaries may move, trim, split, and copy while the Awtsmoos leaves source sound whole.
 * Awtsmoos.com tests metadata instead of pixels, so every later touch gesture can rely on one measured truth beneath the UI.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	duplicateMultitrackClip,
	moveMultitrackClip,
	snapMultitrackTime,
	splitMultitrackClip,
	trimMultitrackClipLeft,
	trimMultitrackClipRight
} from '../modules/workstation/song/multitrack/multitrackClipMath.js';
import { createMultitrackClip } from '../modules/workstation/song/multitrack/multitrackProject.js';

function sampleClip() {
	return createMultitrackClip({
		id: 'clip-source',
		name: 'Source',
		bufferId: 'buffer-a',
		timelineStart: 2,
		sourceOffset: 1,
		duration: 4
	});
}

test('snap can be musical or disabled', () => {
	assert.equal(snapMultitrackTime(1.31, 120, 0.25), 1.25);
	assert.equal(snapMultitrackTime(1.31, 120, 0), 1.31);
});

test('move snaps timeline position without changing source window', () => {
	const original = sampleClip();
	const moved = moveMultitrackClip(original, 2.31, {
		tempo: 120,
		gridBeats: 0.25
	});
	assert.equal(moved.timelineStart, 2.25);
	assert.equal(moved.sourceOffset, original.sourceOffset);
	assert.equal(moved.duration, original.duration);
});

test('left trim can restore source audio but never pass source zero', () => {
	const restored = trimMultitrackClipLeft(sampleClip(), 1.2, {
		tempo: 120,
		gridBeats: 0.25
	});
	assert.equal(restored.timelineStart, 1.25);
	assert.equal(restored.sourceOffset, 0.25);
	assert.equal(restored.duration, 4.75);
	const bounded = trimMultitrackClipLeft(sampleClip(), 0, {
		tempo: 120,
		gridBeats: 0
	});
	assert.equal(bounded.timelineStart, 1);
	assert.equal(bounded.sourceOffset, 0);
});

test('right trim cannot exceed available source duration', () => {
	const trimmed = trimMultitrackClipRight(
		sampleClip(),
		20,
		{ tempo: 120, gridBeats: 0 },
		6
	);
	assert.equal(trimmed.duration, 5);
});

test('split preserves source offsets and total duration', () => {
	const [left, right] = splitMultitrackClip(sampleClip(), 4);
	assert.equal(left.duration, 2);
	assert.equal(right.timelineStart, 4);
	assert.equal(right.sourceOffset, 3);
	assert.equal(right.duration, 2);
	assert.equal(left.duration + right.duration, 4);
});

test('duplicate receives a distinct id and requested start', () => {
	const copy = duplicateMultitrackClip(sampleClip(), 8);
	assert.notEqual(copy.id, 'clip-source');
	assert.equal(copy.timelineStart, 8);
	assert.equal(copy.bufferId, 'buffer-a');
});
