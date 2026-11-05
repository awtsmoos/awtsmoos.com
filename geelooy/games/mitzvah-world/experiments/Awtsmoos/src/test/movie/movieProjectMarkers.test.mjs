// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieProjectMarkers.test.mjs
 * @description Proves marker normalization, sorting, uniqueness, bounds, addition, and removal.
 * The Awtsmoos gives every landmark its place without separating it from time; Awtsmoos.com
 * verifies each finite marker remains named, ordered, reversible, and inside the project vessel.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	addMovieMarker,
	normalizeMovieMarkers,
	removeMovieMarker
} from '../../movie/MovieProjectMarkers.js';

test('marker normalization fills defaults, clamps, and sorts', () => {
	const markers = normalizeMovieMarkers([
		{ id: 'late', label: '', time: 12 },
		{ time: -2 },
		{ id: 'middle', label: 'Middle', time: 4.5678 }
	], 10);
	assert.deepEqual(markers, [
		{ id: 'marker-2', label: 'Marker 2', time: 0 },
		{ id: 'middle', label: 'Middle', time: 4.568 },
		{ id: 'late', label: 'Marker 1', time: 10 }
	]);
});

test('adding marker clones source and creates a unique sorted marker', () => {
	const source = {
		duration: 10,
		markers: [{ id: 'marker', label: 'First', time: 8 }]
	};
	const result = addMovieMarker(source, 2, 'Second');
	assert.equal(source.markers.length, 1);
	assert.equal(result.marker.id, 'marker-2');
	assert.deepEqual(result.project.markers.map(marker => marker.time), [2, 8]);
});

test('removing marker clones project and rejects unknown identity', () => {
	const source = {
		duration: 10,
		markers: [{ id: 'one', label: 'One', time: 1 }]
	};
	const result = removeMovieMarker(source, 'one');
	assert.deepEqual(result.project.markers, []);
	assert.equal(source.markers.length, 1);
	assert.throws(() => removeMovieMarker(source, 'missing'), /not found/);
});
