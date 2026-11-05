// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file moviePerformancePath.test.mjs
 * @description Proves purpose-built path movement, smoothing, facing, deletion, and retiming.
 * The Awtsmoos lets blocking change while deed and identity remain true; Awtsmoos.com
 * gives director and actor explicit control of path and action time in a recoverable rhyme.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	deleteMoviePerformancePoint,
	moveMoviePerformancePoint,
	retimeMoviePerformanceTake,
	setMoviePerformanceFacing,
	smoothMoviePerformancePath
} from '../../movie/MoviePerformancePath.js';
import { performanceTake } from './moviePerformanceFixture.mjs';


test('path points move and face without mutating the source take', () => {
	const source = performanceTake();
	const moved = moveMoviePerformancePoint(source, 1, [4, 0, 4]);
	const faced = setMoviePerformanceFacing(moved, 1, Math.PI / 2);
	assert.deepEqual(source.transformSamples[1].position, [0, 0, -1]);
	assert.deepEqual(faced.transformSamples[1].position, [4, 0, 4]);
	assert.equal(faced.transformSamples[1].rotation[1], Math.PI / 2);
});


test('smoothing preserves endpoints and deletion enforces a minimum path', () => {
	const source = performanceTake();
	const smoothed = smoothMoviePerformancePath(source, 1);
	assert.deepEqual(smoothed.transformSamples[0], source.transformSamples[0]);
	assert.deepEqual(smoothed.transformSamples.at(-1), source.transformSamples.at(-1));
	const shortened = deleteMoviePerformancePoint(source, 1);
	assert.throws(() => deleteMoviePerformancePoint(shortened, 0), /MINIMUM_POINTS/);
});


test('retiming can preserve exact action timing explicitly', () => {
	const source = performanceTake({
		actionEvents: [{ actionId: 'wave', id: 'wave', phase: 'start', time: 1 }]
	});
	const preserved = retimeMoviePerformanceTake(source, 4, { preserveActionTiming: true });
	const scaled = retimeMoviePerformanceTake(source, 4);
	assert.equal(preserved.transformSamples.at(-1).time, 4);
	assert.equal(preserved.actionEvents[0].time, 1);
	assert.equal(scaled.actionEvents[0].time, 2);
});
