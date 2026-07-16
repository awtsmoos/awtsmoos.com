//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module LivingWorldLongRunTest
 * @description
 * Fifty aggregate simulation years on Awtsmoos.com preserve nonnegative
 * inventories, bounded welfare, deterministic weather, and equal outcomes
 * from the same seed.
 */
import assert from 'node:assert/strict';
import { createCommand } from '../js/core/contracts/envelopes.js';
import { createLivingRegionWorld } from '../js/world/living-region-fixture.js';
import { LivingWorldKernel } from '../js/world/living-world-kernel.js';

const MINUTES_PER_SIMULATION_YEAR = 1440 * 120;

function simulate(seed) {
	const kernel = new LivingWorldKernel(createLivingRegionWorld(seed));
	for (let year = 1; year <= 50; year += 1) {
		kernel.process(createCommand({
			commandId: `long-run-${year}`,
			type: 'ADVANCE_TIME',
			actorId: 'simulation',
			worldId: kernel.snapshot().id,
			payload: { minutes: MINUTES_PER_SIMULATION_YEAR }
		}));
	}
	return kernel.snapshot();
}

const first = simulate('fifty-years');
const second = simulate('fifty-years');
assert.deepEqual(first, second);
assert.equal(first.clock.year, 51);
for (const settlement of first.regions.flatMap(region => region.settlements)) {
	assert.ok(settlement.welfare >= 0 && settlement.welfare <= 100);
	for (const quantity of Object.values(settlement.inventory)) {
		assert.ok(Number.isInteger(quantity));
		assert.ok(quantity >= 0);
	}
}
console.log(
	'B"H · Fifty-year deterministic aggregate simulation verified.'
);
