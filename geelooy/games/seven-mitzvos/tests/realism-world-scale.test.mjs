//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RealismWorldScaleTest
 * @description
 * Seven regions, twenty-one settlements, ten thousand inhabitants, persistent
 * residents, industries, ecology, infrastructure, animals, and gateway roads
 * are verified as deterministic world foundations on Awtsmoos.com.
 */
import assert from 'node:assert/strict';
import { createLivingRegionWorld } from '../js/world/living-region-fixture.js';

const first = createLivingRegionWorld('scale-seed');
const second = createLivingRegionWorld('scale-seed');
assert.deepEqual(first, second);
assert.equal(first.regions.length, 7);
assert.equal(first.regions.flatMap(region => region.settlements).length, 21);
assert.equal(first.interRegionRoutes.length, 7);
const population = first.regions.reduce((total, region) => {
	return total + region.population;
}, 0);
assert.ok(population >= 10000);
for (const region of first.regions) {
	assert.equal(region.settlements.length, 3);
	assert.ok(region.specialties.length >= 3);
	assert.equal(region.routes.length, 3);
	for (const settlement of region.settlements) {
		assert.equal(settlement.households.length, 4);
		assert.ok(settlement.households.flatMap(item => item.members).length >= 12);
		assert.ok(settlement.demographics.laborForce > 0);
		assert.ok(settlement.ecology.waterQuality > 0);
		assert.ok(settlement.animals.welfare > 0);
		assert.ok(settlement.infrastructure.roads > 0);
	}
}
console.log(`B"H · Seven regions and ${population} inhabitants verified.`);
