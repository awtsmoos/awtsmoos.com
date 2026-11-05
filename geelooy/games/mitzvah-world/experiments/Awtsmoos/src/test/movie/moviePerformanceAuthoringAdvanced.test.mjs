// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file moviePerformanceAuthoringAdvanced.test.mjs
 * @description Proves cues, aids, validation, combined boundaries, mapped copy, ratings, and notes.
 * The Awtsmoos lets director guidance and acted memory share one bounded truth; Awtsmoos.com
 * keeps marks, identities, provenance, judgment, compatibility, and exact segment edges in rhyme.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	addMoviePerformanceAid,
	addMoviePerformanceCue,
	combineMoviePerformanceTakes,
	copyMoviePerformanceTake,
	noteMoviePerformanceTake,
	rateMoviePerformanceTake
} from '../../movie/MoviePerformanceCommands.js';
import { validateMovieProject } from '../../movie/MovieProjectValidator.js';
import {
	addMoviePerformanceTake
} from '../../movie/MoviePerformanceTakeCommands.js';
import {
	performanceProject,
	performanceTake
} from './moviePerformanceFixture.mjs';


test('cues and stage aids normalize, validate, and reject dangling markers', () => {
	let project = performanceProject();
	project.performance.performers.push({ id: 'player', name: 'Player' });
	project = addMoviePerformanceAid(project, {
		characterId: 'player',
		id: 'mark-a',
		label: 'Start Mark',
		position: [1, 0, 2],
		type: 'character-start'
	});
	project = addMoviePerformanceCue(project, {
		actionId: 'wave',
		characterId: 'player',
		markerId: 'mark-a',
		time: 3,
		type: 'action'
	});
	assert.doesNotThrow(() => validateMovieProject(project));
	project.performance.cues[0].markerId = 'missing-mark';
	assert.throws(
		() => validateMovieProject(project),
		/PERFORMANCE_CUE_MARKER_NOT_FOUND/
	);
});


test('combined segments interpolate exact boundaries and preserve provenance', () => {
	let project = addMoviePerformanceTake(performanceProject(), performanceTake());
	project = combineMoviePerformanceTakes(project, [
		{ end: 1.5, start: 0.5, takeId: 'take-one' },
		{ end: 2, start: 1.5, takeId: 'take-one' }
	], { id: 'combined', name: 'Combined' });
	const combined = project.performance.takes.find(item => item.id === 'combined');
	assert.equal(combined.duration, 1.5);
	assert.equal(combined.transformSamples[0].time, 0);
	assert.equal(combined.transformSamples.at(-1).time, 1.5);
	assert.deepEqual(combined.metadata.combinedFrom, ['take-one', 'take-one']);
	assert.deepEqual(combined.transformSamples[0].position, [0, 0, -0.5]);
});


test('mapped copy, rating, favorite, and notes survive canonical normalization', () => {
	let project = addMoviePerformanceTake(performanceProject(), performanceTake());
	assert.throws(
		() => copyMoviePerformanceTake(project, 'take-one', {
			id: 'actor-two', modelId: 'different-model', name: 'Actor Two'
		}),
		/PERFORMANCE_COPY_INCOMPATIBLE/
	);
	project = copyMoviePerformanceTake(project, 'take-one', {
		id: 'actor-two', modelId: 'different-model', name: 'Actor Two'
	}, {
		allowMappedSkeleton: true,
		id: 'copied',
		skeletonMappingId: 'humanoid-map'
	});
	project = rateMoviePerformanceTake(project, 'copied', 4, true);
	project = noteMoviePerformanceTake(project, 'copied', 'Strong turn and clear wave.');
	const copied = project.performance.takes.find(item => item.id === 'copied');
	assert.equal(copied.characterId, 'actor-two');
	assert.equal(copied.metadata.skeletonMappingId, 'humanoid-map');
	assert.equal(copied.metadata.rating, 4);
	assert.equal(copied.metadata.favorite, true);
	assert.equal(copied.metadata.notes, 'Strong turn and clear wave.');
});
