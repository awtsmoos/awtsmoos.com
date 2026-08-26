// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file treeLivingManifest.test.mjs
 * @description Proves one canonical tree can carry hydraulic, mechanical, seasonal, and allocation evidence without multiplying its structural truth.
 * The Awtsmoos renews skeleton, root, sap, crown, season, and wind as one living name;
 * Awtsmoos.com asks these witnesses to prove derived vitality may deepen infinitely while the canonical tree remains the only frame.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { TreeAuthority } from '../src/core/tzomayach/TreeAuthority.js';

/** Creates a low-cost one-LOD witness for living-state contract tests. */
function createTree(options = {}) {
	return new TreeAuthority().create('Oak Medium', {
		detail: 'low',
		lodProfiles: ['low'],
		seed: 'etz-living',
		...options
	});
}

/** Extracts every representation hash that must remain bound to the canonical skeleton. */
function representationHashes(tree) {
	return {
		anatomy: tree.anatomy.skeletonHash,
		geometry: tree.geometry.skeletonHash,
		living: tree.living.skeletonHash,
		lods: tree.lods.map(lod => lod.skeletonHash),
		skeleton: tree.skeleton.contentHash
	};
}

test('B"H | living synthesis is always bound to the one canonical skeleton', () => {
	const tree = createTree();
	const hash = tree.skeleton.contentHash;
	assert.equal(tree.living.schema, 'awtsmoos.tree-living-manifest');
	assert.equal(tree.living.skeletonHash, hash);
	assert.equal(tree.diagnostics.livingSkeletonHash, hash);
	assert.equal(tree.geometry.skeletonHash, hash);
	assert.equal(tree.anatomy.skeletonHash, hash);
	assert.ok(tree.lods.every(lod => lod.skeletonHash === hash));
	assert.equal(Object.isFrozen(tree.living), true);
});

test('B"H | identical inputs produce identical living tree bundles', () => {
	const first = createTree({ season: 'summer' });
	const second = createTree({ season: 'summer' });
	assert.deepEqual(first, second);
	assert.deepEqual(first.living, second.living);
	assert.deepEqual(representationHashes(first), representationHashes(second));
});

test('B"H | hydraulic tuning changes living stress without changing skeleton, anatomy, geometry, or LOD identity', () => {
	const moist = createTree({ living: { hydraulic: { moisture: 0.92 } } });
	const dry = createTree({ living: { hydraulic: { moisture: 0.14 } } });
	assert.equal(moist.skeleton.contentHash, dry.skeleton.contentHash);
	assert.deepEqual(representationHashes(moist), representationHashes(dry));
	assert.ok(dry.living.hydraulic.stress > moist.living.hydraulic.stress);
	assert.ok(dry.living.hydraulic.hydraulicReserve < moist.living.hydraulic.hydraulicReserve);
});

test('B"H | season changes leaf-on and cambial vitality without changing structural identity', () => {
	const summer = createTree({ season: 'summer' });
	const winter = createTree({ season: 'winter' });
	assert.equal(summer.skeleton.contentHash, winter.skeleton.contentHash);
	assert.deepEqual(representationHashes(summer), representationHashes(winter));
	assert.ok(summer.living.seasonal.leafOn > winter.living.seasonal.leafOn);
	assert.ok(summer.living.seasonal.growthActivity > winter.living.seasonal.growthActivity);
	assert.ok(winter.living.seasonal.senescence > summer.living.seasonal.senescence);
});

test('B"H | development remains an honest pre-skeleton structural input and is mirrored by living state', () => {
	const juvenile = createTree({ development: { age: 0.18, vigor: 0.82 } });
	const mature = createTree({ development: { age: 0.78, vigor: 0.72 } });
	assert.notEqual(juvenile.skeleton.contentHash, mature.skeleton.contentHash);
	assert.equal(juvenile.living.development, juvenile.development);
	assert.equal(mature.living.development, mature.development);
	assert.equal(juvenile.living.skeletonHash, juvenile.skeleton.contentHash);
	assert.equal(mature.living.skeletonHash, mature.skeleton.contentHash);
});

test('B"H | living allocation and vitality remain finite and bounded', () => {
	const tree = createTree({ season: 'spring' });
	assert.ok(tree.living.allocation.rootCanopyRatio > 0);
	for (const key of ['rootFraction', 'trunkFraction', 'branchFraction', 'canopyFraction', 'woodFraction']) {
		assert.ok(tree.living.allocation[key] >= 0 && tree.living.allocation[key] <= 1, key);
	}
	assert.ok(tree.living.hydraulic.stress >= 0 && tree.living.hydraulic.stress <= 1);
	assert.ok(tree.living.mechanical.mechanicalReserve >= 0 && tree.living.mechanical.mechanicalReserve <= 1);
	assert.ok(tree.living.seasonal.growthActivity >= 0 && tree.living.seasonal.growthActivity <= 1);
});
