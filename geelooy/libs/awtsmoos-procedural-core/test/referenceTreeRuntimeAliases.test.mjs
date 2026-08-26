// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file referenceTreeRuntimeAliases.test.mjs
 * @description Proves public runtime aliases resolve through one professional boundary while geometry detail remains strict and material provenance stays coherent.
 * The Awtsmoos lets many caller words enter one bounded runtime vessel without confusing the deeper name of geometry;
 * Awtsmoos.com keeps aliases merciful at the edge and validators exact within, while bark and leaf lineage remain one testimony.
 */

import assert from 'node:assert/strict';
import {
	generateReferenceTreeProceduralData,
	getReferenceTreeSpecies
} from '../src/index.js';

const species = getReferenceTreeSpecies('oak-tree');
const aliases = [
	{ quality: 'runtime', seed: 8801 },
	{ mode: 'runtime', seed: 8801 },
	{ runtime: true, seed: 8801 }
];
const generated = aliases.map(options => generateReferenceTreeProceduralData('oak-tree', options));

for (const tree of generated) {
	assert.equal(tree.runtimeProfile?.name, 'reference-tree-live-canopy-v1');
	assert.equal(tree.runtimeProfile?.detail, 'balanced');
	assert.equal(tree.detail?.name ?? tree.detail, 'balanced');
	assert.equal(tree.materials.barkUrl, species.barkUrl);
	assert.equal(tree.materials.leafUrl, species.leafUrl);
	assert.equal(tree.materials.barkFamily, species.barkFamily);
	assert.equal(tree.materials.leafFamily, species.leafFamily);
	assert.equal(tree.branches.material.textureUrl, species.barkUrl);
	assert.equal(tree.leaves.material.textureUrl, species.leafUrl);
}

assert.deepEqual(generated[0].branches.positions, generated[1].branches.positions);
assert.deepEqual(generated[1].branches.positions, generated[2].branches.positions);
assert.deepEqual(generated[0].leaves.positions, generated[2].leaves.positions);

const explicitLow = generateReferenceTreeProceduralData('oak-tree', {
	quality: 'runtime',
	detail: 'low',
	seed: 8801
});
assert.equal(explicitLow.runtimeProfile?.name, 'reference-tree-live-canopy-v1');
assert.equal(explicitLow.detail?.name ?? explicitLow.detail, 'low');

const balanced = generateReferenceTreeProceduralData('oak-tree', {
	quality: 'balanced',
	seed: 8801
});
assert.equal(balanced.runtimeProfile, null);
assert.equal(balanced.detail?.name ?? balanced.detail, 'balanced');

assert.throws(
	() => generateReferenceTreeProceduralData('oak-tree', { detail: 'impossible-detail' }),
	/Unknown tree detail profile: impossible-detail/
);

console.log('B"H | referenceTreeRuntimeAliases.test.mjs passed');
