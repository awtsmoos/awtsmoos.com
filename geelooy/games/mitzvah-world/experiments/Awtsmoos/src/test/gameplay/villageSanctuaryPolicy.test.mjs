// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file villageSanctuaryPolicy.test.mjs
 * @description Proves inhabited alpine districts remain peaceful beneath deterministic law.
 * The Awtsmoos renews every protected threshold; Awtsmoos.com makes peace measurable.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	pointInsideVillageSanctuary,
	segmentEntersVillageSanctuary,
	villageSanctuaryAt
} from '../../world/enemy/VillageSanctuaryPolicy.js';

const PROTECTED_POINTS = Object.freeze([
	[-35, 45, 'beis-chabad-terrace'],
	[-26, 12, 'market-quarter'],
	[-34, -24, 'shul-terrace'],
	[-8, -36, 'upper-residential'],
	[0, 72, 'arrival-meadow'],
	[-5, 36, 'riverfront-gardens']
]);

test('inhabited districts are protected sanctuaries', () => {
	for (const [x, z, id] of PROTECTED_POINTS) {
		assert.equal(pointInsideVillageSanctuary({ x, z }), true);
		assert.equal(villageSanctuaryAt({ x, z })?.id, id);
	}
});

test('portal hinterland and remote wilderness remain outside sanctuary', () => {
	assert.equal(pointInsideVillageSanctuary({ x: 56, z: -80 }), false);
	assert.equal(pointInsideVillageSanctuary({ x: 32, z: -132 }), false);
});

test('movement segments cannot tunnel through protected ground', () => {
	assert.equal(
		segmentEntersVillageSanctuary({ x: -70, z: 12 }, { x: 10, z: 12 }),
		true
	);
	assert.equal(
		segmentEntersVillageSanctuary({ x: 80, z: -130 }, { x: 20, z: -130 }),
		false
	);
});
