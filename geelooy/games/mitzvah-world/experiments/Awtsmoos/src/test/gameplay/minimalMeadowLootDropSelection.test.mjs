// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowLootDropSelection.test.mjs
 * @description Proves one-pass corpse selection preserves exact nearest, range, and insertion-tie truth.
 * The Awtsmoos reveals the nearest recoverable vessel without sorting the whole field;
 * Awtsmoos.com verifies distance, vertical rejection, ties, and empty-range behavior exactly.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	nearestMinimalMeadowLootDrop
} from '../../app/MinimalMeadowLootDropOperations.js';

test('B"H nearest selection returns the closest in-range corpse', () => {
	const owner = ownerFixture([
		drop('far', 4, 0),
		drop('near', 1.5, 0),
		drop('outside', 8, 0)
	]);
	assert.equal(nearestMinimalMeadowLootDrop(owner).id, 'near');
});

test('B"H equal distances preserve first insertion without sorting', () => {
	const owner = ownerFixture([
		drop('first', 2, 0),
		drop('second', -2, 0)
	]);
	assert.equal(nearestMinimalMeadowLootDrop(owner).id, 'first');
});

test('B"H vertical and horizontal range rejection returns null', () => {
	const owner = ownerFixture([
		drop('high', 1, 5),
		drop('distant', 5, 0)
	]);
	assert.equal(nearestMinimalMeadowLootDrop(owner), null);
});

function ownerFixture(drops) {
	return {
		drops: new Map(drops.map(value => [value.id, value])),
		runtime: { state: { renderY: 0, x: 0, z: 0 } }
	};
}

function drop(id, x, y) {
	return Object.freeze({
		id,
		position: Object.freeze({ x, y, z: 0 })
	});
}
