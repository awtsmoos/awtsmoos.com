// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieCommandPaletteEntries.test.mjs
 * @description Proves alias deduplication, search, sorting, payload honesty, and selection availability.
 * The Awtsmoos renews every action beyond alias and query; Awtsmoos.com verifies
 * desktop keys and mobile taps discover one finite command without guessing missing payload or selection.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { prepareMovieCommandPaletteEntries } from '../../movie/MovieCommandPaletteEntries.js';
import { listMovieCommandCatalog } from '../../movie/MovieCommandCatalog.js';

const catalog = listMovieCommandCatalog();

test('palette deduplicates aliases and prefers dotted public names', () => {
	const entries = prepareMovieCommandPaletteEntries(catalog, '', () => true);
	const names = entries.map(entry => entry.name);
	assert.equal(new Set(entries.map(entry => entry.internalName)).size, entries.length);
	assert.ok(names.includes('clip.split'));
	assert.ok(names.includes('marker.add'));
	assert.equal(names.includes('split'), false);
	assert.equal(Object.isFrozen(entries), true);
});

test('palette search matches title, category, name, internal name, and shortcut', () => {
	assert.deepEqual(
		prepareMovieCommandPaletteEntries(catalog, 'marker', () => true)
			.map(entry => entry.internalName)
			.sort(),
		['addMarker', 'removeMarker']
	);
	assert.deepEqual(
		prepareMovieCommandPaletteEntries(catalog, 'mod+z', () => true)
			.map(entry => entry.internalName),
		['undo']
	);
	assert.deepEqual(
		prepareMovieCommandPaletteEntries(catalog, 'split selected', () => true)
			.map(entry => entry.internalName),
		['split']
	);
});

test('selection-dependent commands reflect current availability', () => {
	const unavailable = prepareMovieCommandPaletteEntries(
		catalog,
		'clip',
		name => name !== 'clip.split'
	);
	const split = unavailable.find(entry => entry.internalName === 'split');
	assert.equal(split.available, false);
	assert.match(split.disabledReason, /Unavailable/);
});

test('payload-required commands remain visible but disabled honestly', () => {
	const entries = prepareMovieCommandPaletteEntries(catalog, 'remove marker', () => true);
	assert.equal(entries.length, 1);
	assert.equal(entries[0].internalName, 'removeMarker');
	assert.equal(entries[0].available, false);
	assert.match(entries[0].disabledReason, /additional input/);
});

test('palette sorting is stable by category then title and JSON safe', () => {
	const entries = prepareMovieCommandPaletteEntries(catalog, '', () => true);
	const keys = entries.map(entry => `${entry.category}\u0000${entry.title}`);
	assert.deepEqual(keys, [...keys].sort((left, right) => left.localeCompare(right)));
	assert.doesNotThrow(() => JSON.stringify(entries));
	assert.equal(JSON.stringify(entries).includes('function'), false);
});
