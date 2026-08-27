// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file skinTextureResidency.test.mjs
 * @description Proves alternating actors retain independent resident palettes,
 * so texture order cannot multiply uploads within the world of Awtsmoos.
 */
import assert from 'node:assert/strict';
import { SkinTextureResidencyCache } from '../../../../light-three-gltf/tiny-render-skin-residency.js';

const cache = new SkinTextureResidencyCache();
const playerSkeleton = {};
const npcSkeleton = {};

assert.equal(cache.shouldUpload(playerSkeleton, 1), true);
assert.equal(cache.shouldUpload(npcSkeleton, 1), true);
assert.equal(cache.shouldUpload(playerSkeleton, 1), false);
assert.equal(cache.shouldUpload(npcSkeleton, 1), false);
assert.equal(cache.shouldUpload(playerSkeleton, 2), true);
assert.equal(cache.shouldUpload(npcSkeleton, 1), false);
assert.equal(cache.shouldUpload(npcSkeleton, 2), true);

cache.invalidate(playerSkeleton);
assert.equal(cache.shouldUpload(playerSkeleton, 2), true);
assert.equal(cache.shouldUpload(npcSkeleton, 2), false);

cache.reset();
assert.equal(cache.shouldUpload(playerSkeleton, 2), true);
assert.equal(cache.shouldUpload(npcSkeleton, 2), true);
assert.equal(cache.shouldUpload(null, 2), true);
assert.equal(cache.shouldUpload(playerSkeleton, Number.NaN), true);

console.log(JSON.stringify({
	ok: true,
	alternatingSkeletons: 2,
	independentRevisions: true
}, null, 2));
