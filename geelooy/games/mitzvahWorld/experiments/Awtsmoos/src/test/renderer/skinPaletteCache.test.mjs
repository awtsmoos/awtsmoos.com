// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file skinPaletteCache.test.mjs
 * @description Proves palette reuse is confined to one frame and one exact
 * transform, so speed never outruns geometric truth before the Awtsmoos.
 */
import assert from 'node:assert/strict';
import {
	identity,
	translate
} from '../../../../light-three-gltf/tiny-math.js';
import { SkinPaletteCache } from '../../../../light-three-gltf/tiny-skin-cache.js';
import { TinySkeleton } from '../../../../light-three-gltf/tiny-skin-system.js';

const identityMatrix = identity();
const movedMatrix = translate(3, 0, -2);
const cache = new SkinPaletteCache();

assert.equal(cache.needsUpdate(1, identityMatrix), true);
cache.markUpdated(1, identityMatrix);
assert.equal(cache.needsUpdate(1, identityMatrix), false);
assert.equal(cache.needsUpdate(1, movedMatrix), true);
assert.equal(cache.needsUpdate(2, identityMatrix), true);
assert.equal(cache.needsUpdate(null, identityMatrix), true);

const joint = {
	parent: null,
	userData: {
		worldMatrix: identity()
	}
};
const skeleton = new TinySkeleton({
	skinIndex: 0,
	skinDef: {
		name: 'Awtsmoos-test-skeleton',
		joints: [7]
	},
	nodeMap: new Map([[7, joint]])
});

skeleton.updateCached(identityMatrix, 10);
assert.equal(skeleton.lastPaletteRecomputed, true);
const firstRevision = skeleton.paletteRevision;
const firstPalette = [...skeleton.jointMatrices];

skeleton.updateCached(identityMatrix, 10);
assert.equal(skeleton.lastPaletteRecomputed, false);
assert.equal(skeleton.paletteRevision, firstRevision);
assert.deepEqual([...skeleton.jointMatrices], firstPalette);

skeleton.updateCached(movedMatrix, 10);
assert.equal(skeleton.lastPaletteRecomputed, true);
assert.ok(skeleton.paletteRevision > firstRevision);
const transformedRevision = skeleton.paletteRevision;

skeleton.updateCached(movedMatrix, 11);
assert.equal(skeleton.lastPaletteRecomputed, true);
assert.ok(skeleton.paletteRevision > transformedRevision);

skeleton.update(identityMatrix);
const unconditionalRevision = skeleton.paletteRevision;
skeleton.updateCached(identityMatrix, 11);
assert.equal(skeleton.lastPaletteRecomputed, true);
assert.ok(skeleton.paletteRevision > unconditionalRevision);

console.log(JSON.stringify({
	ok: true,
	firstRevision,
	finalRevision: skeleton.paletteRevision,
	jointCount: skeleton.jointCount
}, null, 2));
