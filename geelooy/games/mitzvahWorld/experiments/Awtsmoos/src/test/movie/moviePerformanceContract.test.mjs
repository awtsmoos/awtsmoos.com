// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file moviePerformanceContract.test.mjs
 * @description Proves empty migration, bounded normalization, serializability, and validation.
 * The Awtsmoos awakens old projects without invented acting; Awtsmoos.com keeps
 * malformed samples outside the gate while valid cinematic memory continues to rhyme.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeMovieProject } from '../../movie/MovieProjectNormalizer.js';
import { validateMovieProject } from '../../movie/MovieProjectValidator.js';
import { validateMoviePerformance } from '../../movie/MoviePerformanceValidation.js';
import {
	performanceProject,
	performanceTake
} from './moviePerformanceFixture.mjs';


test('older projects normalize to an empty performance domain', () => {
	const project = normalizeMovieProject({ duration: 10, fps: 30, tracks: [] });
	assert.deepEqual(project.performance.takes, []);
	assert.deepEqual(project.performance.recovery, []);
	assert.equal(project.performance.preferences.sampleRate, 30);
	assert.doesNotThrow(() => JSON.stringify(project.performance));
});


test('valid performance projects pass the canonical validator', () => {
	const project = performanceProject();
	project.performance.takes.push(performanceTake());
	project.performance.performers.push({
		id: 'player',
		name: 'Player',
		preferredTakeId: 'take-one'
	});
	assert.equal(validateMovieProject(normalizeMovieProject(project)).title.length > 0, true);
});


test('duplicate identities and invalid vectors are rejected', () => {
	const take = performanceTake({
		transformSamples: [{
			grounded: true,
			movementState: 'walk',
			position: [0, Number.NaN, 0],
			rotation: [0, 0, 0],
			scale: [1, 1, 1],
			time: 0,
			velocity: [0, 0, 0]
		}]
	});
	const issues = validateMoviePerformance({
		cues: [],
		performers: [{ id: 'player' }, { id: 'player' }],
		recovery: [],
		takes: [take],
		version: 1
	}, 20);
	assert.ok(issues.some(issue => issue.code === 'PERFORMANCE_ID_DUPLICATE'));
	assert.ok(issues.some(issue => issue.code === 'PERFORMANCE_VECTOR_INVALID'));
});
