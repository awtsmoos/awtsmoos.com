//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file multitrackClipEnvelopeStructure.test.mjs
 * @description
 * Chochmah compares parent and child envelope truth while the Awtsmoos remains beyond division, source window, and edge.
 * Awtsmoos.com proves Split and Trim may change finite regions without inventing a loudness jump where the original song had none.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { multitrackClipEnvelopeGain } from '../modules/workstation/song/multitrack/multitrackClipEnvelope.js';
import {
	splitMultitrackClip,
	trimMultitrackClipLeft,
	trimMultitrackClipRight
} from '../modules/workstation/song/multitrack/multitrackClipMath.js';
import { createMultitrackClip } from '../modules/workstation/song/multitrack/multitrackProject.js';

function parentClip() {
	return createMultitrackClip({
		id: 'parent',
		bufferId: 'buffer',
		timelineStart: 0,
		sourceOffset: 1,
		duration: 2,
		gain: 0.8,
		fadeIn: 1,
		fadeOut: 0.75
	});
}

function close(actual, expected, message) {
	assert.ok(Math.abs(actual - expected) < 1e-9, `${message}: ${actual} vs ${expected}`);
}

function compareSegment(parent, child, parentOffset, samples) {
	for (const local of samples) {
		close(
			multitrackClipEnvelopeGain(child, local),
			multitrackClipEnvelopeGain(parent, parentOffset + local),
			`envelope mismatch at child ${local}`
		);
	}
}

test('split inside fade-in preserves the exact parent envelope on both children', () => {
	const parent = parentClip();
	const [left, right] = splitMultitrackClip(parent, 0.5);
	compareSegment(parent, left, 0, [0, 0.1, 0.25, 0.499]);
	compareSegment(parent, right, 0.5, [0, 0.1, 0.5, 1, 1.49]);
	close(multitrackClipEnvelopeGain(right, 0), multitrackClipEnvelopeGain(parent, 0.5), 'split seam');
});

test('split inside fade-out preserves the exact parent envelope on both children', () => {
	const parent = parentClip();
	const [left, right] = splitMultitrackClip(parent, 1.5);
	compareSegment(parent, left, 0, [0, 0.5, 1, 1.25, 1.499]);
	compareSegment(parent, right, 1.5, [0, 0.1, 0.25, 0.499]);
	close(multitrackClipEnvelopeGain(right, 0), multitrackClipEnvelopeGain(parent, 1.5), 'fade-out seam');
});

test('inward trims remain exact subsegments and restoration returns the edge anchor', () => {
	const parent = parentClip();
	const leftTrimmed = trimMultitrackClipLeft(parent, 0.5, { gridBeats: 0 });
	compareSegment(parent, leftTrimmed, 0.5, [0, 0.25, 0.5, 1, 1.49]);
	const restored = trimMultitrackClipLeft(leftTrimmed, 0, { gridBeats: 0 });
	assert.equal(restored.fadeInOffset, 0);
	compareSegment(parent, restored, 0, [0, 0.5, 1, 1.5, 1.99]);
	const rightTrimmed = trimMultitrackClipRight(parent, 1.5, { gridBeats: 0 }, 3);
	compareSegment(parent, rightTrimmed, 0, [0, 0.5, 1, 1.25, 1.499]);
});
