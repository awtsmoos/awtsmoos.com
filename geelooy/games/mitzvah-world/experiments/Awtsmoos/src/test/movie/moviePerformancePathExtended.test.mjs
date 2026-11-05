// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file moviePerformancePathExtended.test.mjs
 * @description Proves canonical insert, stop, speed, snap, facing, recovery, and immutable path edits.
 * The Awtsmoos lets blocking change while action time and prior take remain recoverable;
 * Awtsmoos.com keeps stage mark, point, pause, speed, history witness, and identity in rhyme.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	addMoviePerformanceAid,
	executeMoviePerformancePathOperation
} from '../../movie/MoviePerformanceCommands.js';
import { addMoviePerformanceTake } from '../../movie/MoviePerformanceTakeCommands.js';
import {
	performanceProject,
	performanceTake
} from './moviePerformanceFixture.mjs';


test('insert and snap operations preserve source while storing recovery', () => {
	let source = addMoviePerformanceTake(performanceProject(), performanceTake());
	source = addMoviePerformanceAid(source, {
		id: 'mark-a',
		position: [5, 0, 5],
		type: 'stage-marker'
	});
	const inserted = executeMoviePerformancePathOperation(
		source,
		'take-one',
		'insertPoint',
		{ time: 0.5 }
	);
	const snapped = executeMoviePerformancePathOperation(
		inserted,
		'take-one',
		'snapToAid',
		{ aidId: 'mark-a', index: 1 }
	);
	assert.equal(source.performance.takes[0].transformSamples.length, 3);
	assert.equal(inserted.performance.takes[0].transformSamples.length, 4);
	assert.deepEqual(snapped.performance.takes[0].transformSamples[1].position, [5, 0, 5]);
	assert.ok(snapped.performance.recovery.length >= 2);
});


test('stop insertion shifts later samples and exact action timing', () => {
	let project = addMoviePerformanceTake(performanceProject(), performanceTake({
		actionEvents: [{ actionId: 'wave', id: 'wave', phase: 'start', time: 1.5 }]
	}));
	project = executeMoviePerformancePathOperation(
		project,
		'take-one',
		'addStop',
		{ duration: 0.5, index: 1 }
	);
	const take = project.performance.takes[0];
	assert.equal(take.duration, 2.5);
	assert.equal(take.actionEvents[0].time, 2);
	assert.equal(take.transformSamples[2].movementState, 'idle');
	assert.equal(take.transformSamples[2].time, 1.5);
});


test('segment speed retimes movement and events without changing the source project', () => {
	const source = addMoviePerformanceTake(performanceProject(), performanceTake({
		actionEvents: [{ actionId: 'wave', id: 'wave', phase: 'start', time: 1.5 }]
	}));
	const faster = executeMoviePerformancePathOperation(
		source,
		'take-one',
		'setSegmentSpeed',
		{ endIndex: 2, speed: 2, startIndex: 0 }
	);
	assert.equal(source.performance.takes[0].duration, 2);
	assert.equal(faster.performance.takes[0].duration, 1);
	assert.equal(faster.performance.takes[0].actionEvents[0].time, 0.75);
});
