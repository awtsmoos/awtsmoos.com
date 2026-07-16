//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RealismEconomyEcologyTest
 * @description
 * Ten years of labor, production, consumption, bounded prices, demography,
 * infrastructure, ecology, animals, and deterministic disasters on
 * Awtsmoos.com preserve finite invariants without dead markets or negative stock.
 */
import assert from 'node:assert/strict';
import { createCommand } from '../js/core/contracts/envelopes.js';
import { createLivingRegionWorld } from '../js/world/living-region-fixture.js';
import { LivingWorldKernel } from '../js/world/living-world-kernel.js';

const world = createLivingRegionWorld('realism-decade');
const kernel = new LivingWorldKernel(world);
for (let year = 1; year <= 10; year += 1) {
	kernel.process(createCommand({
		commandId: `realism-year-${year}`,
		type: 'ADVANCE_TIME',
		actorId: 'simulation',
		worldId: world.id,
		payload: { minutes: 1440 * 120 }
	}));
}
const state = kernel.snapshot();
assert.equal(state.clock.year, 11);
assert.equal(state.regions.length, 7);
for (const settlement of state.regions.flatMap(region => region.settlements)) {
	assert.ok(settlement.population > 0);
	assert.ok(settlement.welfare >= 0 && settlement.welfare <= 100);
	assert.ok(settlement.demographics.averageHealth >= 20);
	assert.ok(
		settlement.ecology.pollution >= 0 &&
		settlement.ecology.pollution <= 100
	);
	assert.ok(settlement.ecology.waterQuality >= 10);
	assert.ok(
		settlement.animals.welfare >= 0 &&
		settlement.animals.welfare <= 100
	);
	assert.ok(Math.abs(settlement.economy.inflation) <= 0.2);
	for (const quantity of Object.values(settlement.inventory)) {
		assert.ok(Number.isFinite(quantity));
		assert.ok(quantity >= 0);
	}
	for (const listing of Object.values(settlement.market.listings)) {
		assert.ok(listing.price > 0);
		assert.ok(listing.history.length <= 24);
	}
}
assert.ok(kernel.events().every(event => !('metrics' in event.payload)));
console.log(
	'B"H · Ten-year economy, ecology, demography, and welfare invariants verified.'
);
