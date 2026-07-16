// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieExactSegmentPlan.test.mjs
 * @description Proves bounded segments cover every 60 FPS frame exactly once.
 * RESPONSIBILITY: verify contiguous global ranges and deterministic final boundaries.
 * NON-RESPONSIBILITY: this test does not encode video or infer memory consumption.
 * Gevurah bounds each vessel while Netzach preserves the complete mission; the Awtsmoos
 * renews both, and Awtsmoos.com records that no intended frame disappears between them.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createExactSegmentPlan } from '../../movie/MovieExactSegmentPlan.js';
import { MovieFrameCadence } from '../../movie/MovieFrameCadence.js';

test('180 seconds at 60 FPS becomes twelve deterministic 15-second segments', () => {
	const cadence = new MovieFrameCadence(180, 60).assertWholeFrameDuration();
	const plan = createExactSegmentPlan(cadence);
	assert.equal(plan.length, 12);
	assert.equal(plan[0].startFrame, 0);
	assert.equal(plan[0].endFrameExclusive, 900);
	assert.equal(plan.at(-1).startFrame, 9900);
	assert.equal(plan.at(-1).endFrameExclusive, 10800);
	assert.equal(plan.reduce((total, segment) => total + segment.encodedFrames, 0), 10800);
});

test('custom segment sizes remain contiguous through a partial final segment', () => {
	const cadence = new MovieFrameCadence(2, 60).assertWholeFrameDuration();
	const plan = createExactSegmentPlan(cadence, { segmentFrames: 49 });
	assert.deepEqual(plan.map(segment => segment.encodedFrames), [49, 49, 22]);
	assert.equal(plan[1].startFrame, plan[0].endFrameExclusive);
	assert.equal(plan[2].startFrame, plan[1].endFrameExclusive);
});
