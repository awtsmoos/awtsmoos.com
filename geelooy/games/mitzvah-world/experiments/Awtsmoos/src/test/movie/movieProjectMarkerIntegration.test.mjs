// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieProjectMarkerIntegration.test.mjs
 * @description Proves canonical project normalization and validation preserve safe markers.
 * The Awtsmoos renews landmark and timeline through one document; Awtsmoos.com verifies
 * sorted finite markers enter the canonical vessel while duplicates and escaped times are refused.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeMovieProject } from '../../movie/MovieProjectNormalizer.js';
import { validateMovieProject } from '../../movie/MovieProjectValidator.js';

function source() {
	return {
		duration: 10,
		fps: 30,
		markers: [
			{ id: 'late', time: 8 },
			{ id: 'early', time: 2 }
		],
		resolution: { height: 720, width: 1280 },
		tracks: []
	};
}

test('normalization sorts and validation accepts safe markers', () => {
	const project = normalizeMovieProject(source());
	assert.deepEqual(project.markers.map(marker => marker.id), ['early', 'late']);
	assert.equal(validateMovieProject(project), project);
});

test('validator rejects duplicate marker IDs', () => {
	const project = normalizeMovieProject(source());
	project.markers[1].id = project.markers[0].id;
	assert.throws(() => validateMovieProject(project), /unique id/);
});

test('validator rejects markers outside movie duration', () => {
	const project = normalizeMovieProject(source());
	project.markers[0].time = 11;
	assert.throws(() => validateMovieProject(project), /outside the movie duration/);
});
