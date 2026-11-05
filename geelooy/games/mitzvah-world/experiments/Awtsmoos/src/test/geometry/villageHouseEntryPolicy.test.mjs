// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file villageHouseEntryPolicy.test.mjs
 * @description Proves all 18 generated entries begin at their true facade and render outward.
 * The Awtsmoos opens every house through one measured threshold rather than an interior guess;
 * Awtsmoos.com verifies immutable architecture and rotated batch geometry in every wilderness.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	CANONICAL_VILLAGE_HOUSES
} from '../../world/village/CanonicalVillageHouses.js';
import {
	createVillageHouseBubbleDefinitions
} from '../../world/village/VillageHouseBubbleSystem.js';
import {
	houseEntryEvidence
} from '../../world/village/VillageHouseEntryPolicy.js';

const VERTICES_PER_BOX = 24;

test('canonical entries derive immutable dimensions from every facade', () => {
	assert.equal(CANONICAL_VILLAGE_HOUSES.length, 18);
	for (const house of CANONICAL_VILLAGE_HOUSES) {
		const evidence = houseEntryEvidence(house);
		assert.equal(Object.isFrozen(house.entry), true);
		assert.ok(Math.abs(house.entry.facadeZ - house.depth * 0.515) < 1e-9);
		assert.ok(house.entry.innerZ < house.entry.facadeZ);
		assert.ok(house.entry.outerZ > house.entry.facadeZ + 3);
		assert.ok(house.entry.width >= 2.2);
		assert.equal(evidence.houseId, house.id);
		assert.ok(distance(evidence.inner, evidence.outer) > 3.3);
	}
});

test('threshold batch begins at facade overlap and extends outside for every yaw', () => {
	const definitions = createVillageHouseBubbleDefinitions(() => 0, 'high');
	const threshold = definitions.find(definition => (
		definition.id === 'Awtsmoos_house-thresholds'
	));
	assert.equal(threshold.userData.instances, 18);
	CANONICAL_VILLAGE_HOUSES.forEach((house, index) => {
		const vertices = threshold.vertices.slice(
			index * VERTICES_PER_BOX,
			(index + 1) * VERTICES_PER_BOX
		);
		const localDepths = vertices.map(vertex => localZ(vertex, house));
		assert.ok(Math.abs(Math.min(...localDepths) - house.entry.innerZ) < 1e-9);
		assert.ok(Math.abs(Math.max(...localDepths) - house.entry.outerZ) < 1e-9);
	});
});

function localZ(vertex, house) {
	return (vertex[0] - house.x) * Math.sin(house.yaw)
		+ (vertex[2] - house.z) * Math.cos(house.yaw);
}

function distance(first, second) {
	return Math.hypot(first.x - second.x, first.z - second.z);
}
