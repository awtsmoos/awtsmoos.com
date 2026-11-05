// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file moviePerformanceCommands.test.mjs
 * @description Proves immutable creation, NLE insertion, soft deletion, and full restoration.
 * The Awtsmoos lets a take depart without being annihilated; Awtsmoos.com keeps
 * original project, actor track, clip placement, and recovered memory in coherent rhyme.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	addMoviePerformanceTake,
	deleteMoviePerformanceTake,
	insertMoviePerformanceTake,
	restoreMoviePerformanceTake
} from '../../movie/MoviePerformanceCommands.js';
import { validateMovieProject } from '../../movie/MovieProjectValidator.js';
import {
	performanceProject,
	performanceTake
} from './moviePerformanceFixture.mjs';


test('adding and inserting a take never mutates the source project', () => {
	const source = performanceProject();
	const added = addMoviePerformanceTake(source, performanceTake());
	const inserted = insertMoviePerformanceTake(added, 'take-one', { start: 3 });
	assert.equal(source.performance.takes.length, 0);
	assert.equal(added.tracks.length, 0);
	assert.equal(inserted.tracks[0].type, 'performance');
	assert.equal(inserted.tracks[0].clips[0].start, 3);
	assert.doesNotThrow(() => validateMovieProject(inserted));
});


test('deletion saves take and placement, restoration recreates a missing track', () => {
	let project = addMoviePerformanceTake(performanceProject(), performanceTake());
	project = insertMoviePerformanceTake(project, 'take-one', { start: 2 });
	const deleted = deleteMoviePerformanceTake(project, 'take-one');
	const recoveryId = deleted.performance.recovery[0].id;
	deleted.tracks = [];
	const restored = restoreMoviePerformanceTake(deleted, recoveryId);
	assert.equal(restored.performance.takes[0].id, 'take-one');
	assert.equal(restored.tracks[0].clips[0].takeId, 'take-one');
	assert.doesNotThrow(() => validateMovieProject(restored));
});


test('out-of-range insertion and locked tracks fail clearly', () => {
	let project = addMoviePerformanceTake(performanceProject(), performanceTake());
	assert.throws(
		() => insertMoviePerformanceTake(project, 'take-one', { start: 20 }),
		/PERFORMANCE_CLIP_START_OUTSIDE_DURATION/
	);
	project = insertMoviePerformanceTake(project, 'take-one');
	project.tracks[0].locked = true;
	assert.throws(
		() => insertMoviePerformanceTake(project, 'take-one', { trackId: project.tracks[0].id }),
		/PERFORMANCE_TRACK_LOCKED/
	);
});
