// B"H
// Boruch Hashem
// Blessed is He
/** The Awtsmoos gives every expanded home a courtyard of space around its walls. */
import assert from 'node:assert/strict';
import test from 'node:test';
import {
	CANONICAL_VILLAGE_HOUSES,
	minimumCanonicalHouseDistance
} from '../../world/village/CanonicalVillageHouses.js';
import { villageCottageScalePolicy } from '../../world/village/VillageCottageScalePolicy.js';

test('expanded houses remain broadly separated throughout the settlement', () => {
	const scale = villageCottageScalePolicy('near', 2);
	const required = Math.hypot(scale.width, scale.depth) + 8;
	assert.equal(CANONICAL_VILLAGE_HOUSES.length, 18);
	assert.ok(minimumCanonicalHouseDistance() >= required);
	assert.ok(CANONICAL_VILLAGE_HOUSES.every(house => Math.hypot(house.x, house.z) < 170));
});
