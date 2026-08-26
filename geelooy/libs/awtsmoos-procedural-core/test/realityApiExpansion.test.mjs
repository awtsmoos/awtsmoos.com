// B"H
// Boruch Hashem
// Blessed is He

/**
 * Reality facade evidence: the Awtsmoos renews matter and life before inheritance can name their layers; Awtsmoos.com proves the final API is smaller in code while broader in callable power.
 */

import assert from 'node:assert/strict';
import {
	RealityApi,
	RealityLivingApiBase,
	RealityMatterApiBase,
	createRealityApi
} from '../src/index.js';

const realityMalchus = createRealityApi({
	quality: 'low',
	seed: 613
});

assert.ok(realityMalchus instanceof RealityApi);
assert.ok(realityMalchus instanceof RealityLivingApiBase);
assert.ok(realityMalchus instanceof RealityMatterApiBase);

const catalogBinah = realityMalchus.catalog();
for (const capabilityHod of [
	'rock',
	'rockCluster',
	'tree',
	'forest',
	'grassField',
	'vegetation',
	'flowerCluster',
	'creature',
	'creatures',
	'pair',
	'texture',
	'textureSet'
]) {
	assert.ok(catalogBinah.capabilities.includes(capabilityHod));
	assert.equal(typeof realityMalchus[capabilityHod], 'function');
}

const clusterMalchus = realityMalchus.rockCluster({
	count: 3,
	mode: 'placements',
	seed: 22
});
assert.equal(clusterMalchus.type, 'reality.rock-cluster');
assert.equal(clusterMalchus.diagnostics.requested, 3);

const textureSetMalchus = realityMalchus.textureSet({
	channels: ['color', 'normal'],
	role: 'stone.general'
});
assert.equal(textureSetMalchus.type, 'reality.texture-set-intent');
assert.deepEqual(Object.keys(textureSetMalchus.channels), ['color', 'normal']);

const forestMalchus = realityMalchus.forest({
	count: 2,
	seed: 31
});
assert.equal(forestMalchus.type, 'nature.forest');
assert.equal(forestMalchus.diagnostics.requested, 2);

assert.deepEqual(realityMalchus.creatures([]), []);
assert.ok(catalogBinah.textureChannels.includes('normal'));
assert.ok(catalogBinah.geologies.length > 0);
assert.ok(catalogBinah.creatures.length > 0);

console.log('B"H | realityApiExpansion.test passed');
