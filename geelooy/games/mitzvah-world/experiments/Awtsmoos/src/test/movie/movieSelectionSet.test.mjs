// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieSelectionSet.test.mjs
 * @description Proves legacy compatibility, selected-many algebra, filtering, ranges, bounds, and immutability.
 * The Awtsmoos renews one and many without contradiction; Awtsmoos.com verifies
 * every finite selection remains stable, deduplicated, project-aware, and outside authored history.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createEmptyMovieSelectionSet,
	normalizeMovieSelectionSet,
	movieSelectionSetContains
} from '../../movie/MovieSelectionSet.js';
import {
	replaceMovieSelectionItems,
	setMovieSelectionRange,
	updateMovieSelectionSet
} from '../../movie/MovieSelectionSetOperations.js';

const project = {
	duration: 10,
	tracks: [{
		clips: [
			{ duration: 2, id: 'one', start: 0 },
			{ duration: 2, id: 'two', start: 3 }
		],
		id: 'actors',
		type: 'actor'
	}]
};

const one = { clipId: 'one', trackId: 'actors' };
const two = { clipId: 'two', trackId: 'actors' };

test('legacy descriptor becomes one immutable primary selection', () => {
	const selection = normalizeMovieSelectionSet(one, project);
	assert.deepEqual(selection.items, [one]);
	assert.deepEqual(selection.primary, one);
	assert.equal(selection.range, null);
	assert.equal(Object.isFrozen(selection), true);
	assert.equal(movieSelectionSetContains(selection, one), true);
});

test('selection normalization deduplicates and filters missing project identities', () => {
	const selection = normalizeMovieSelectionSet({
		items: [one, one, { clipId: 'missing', trackId: 'actors' }, two],
		primary: two
	}, project);
	assert.deepEqual(selection.items, [one, two]);
	assert.deepEqual(selection.primary, two);
});

test('replace, add, toggle, remove, and many-item operations preserve deterministic primary', () => {
	let selection = createEmptyMovieSelectionSet();
	selection = updateMovieSelectionSet(selection, one, 'replace', project);
	selection = updateMovieSelectionSet(selection, two, 'add', project);
	assert.deepEqual(selection.items, [one, two]);
	assert.deepEqual(selection.primary, two);
	selection = updateMovieSelectionSet(selection, two, 'toggle', project);
	assert.deepEqual(selection.items, [one]);
	assert.deepEqual(selection.primary, one);
	selection = updateMovieSelectionSet(selection, one, 'remove', project);
	assert.deepEqual(selection.items, []);
	selection = replaceMovieSelectionItems(selection, [two, one], project);
	assert.deepEqual(selection.primary, one);
});

test('time ranges sort and clamp against project duration', () => {
	const selection = setMovieSelectionRange(
		createEmptyMovieSelectionSet(),
		{ end: -4, start: 18 },
		project
	);
	assert.deepEqual(selection.range, { end: 10, start: 0 });
});

test('invalid descriptors, modes, ranges, and oversized sets are coded failures', () => {
	assert.throws(
		() => normalizeMovieSelectionSet({ clipId: 'one' }, project),
		error => error.code === 'INVALID_MOVIE_SELECTION_DESCRIPTOR'
	);
	assert.throws(
		() => updateMovieSelectionSet(null, one, 'unknown', project),
		error => error.code === 'INVALID_MOVIE_SELECTION_MODE'
	);
	assert.throws(
		() => setMovieSelectionRange(null, { start: 'bad', end: 2 }, project),
		error => error.code === 'INVALID_MOVIE_SELECTION_RANGE'
	);
	assert.throws(
		() => normalizeMovieSelectionSet({ items: Array(2049).fill(one) }),
		error => error.code === 'INVALID_MOVIE_SELECTION_SET'
	);
});
