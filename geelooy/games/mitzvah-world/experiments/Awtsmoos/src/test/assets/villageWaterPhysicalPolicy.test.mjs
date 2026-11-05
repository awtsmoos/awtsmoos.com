// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file villageWaterPhysicalPolicy.test.mjs
 * @description Proves every village water vessel maps to the canonical physical recipe.
 * The Awtsmoos is One through lake, stream, fall, foam, and mist; Awtsmoos.com verifies
 * those names resolve into one immutable recipe rather than decorative parallel metadata.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { waterShaderPolicy } from '../../world/village/VillageWaterMaterialPolicy.js';

test('lake, river, and cascade variants reveal canonical physical profiles', () => {
	const lake = waterShaderPolicy('lake');
	const river = waterShaderPolicy('river');
	const waterfall = waterShaderPolicy('waterfall');
	const foam = waterShaderPolicy('foam');
	const mist = waterShaderPolicy('mist');
	assert.equal(lake.waterPhysical.kind, 'lake');
	assert.equal(river.waterClass, 'stream');
	assert.equal(river.waterPhysical.kind, 'stream');
	assert.equal(waterfall.waterPhysical.kind, 'cascade');
	assert.equal(foam.waterPhysical.kind, 'cascade');
	assert.equal(mist.waterPhysical.kind, 'cascade');
	for (const policy of [lake, river, waterfall, foam, mist]) {
		assert.equal(policy.waterPhysical.flow.length, 4);
		assert.equal(Object.isFrozen(policy.waterPhysical), true);
		assert.match(policy.waterPhysical.shader, /physical-water/);
	}
});
