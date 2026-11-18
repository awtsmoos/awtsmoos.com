// B"H
/**
 * @file CanonicalAnimatedMeshVisibility.test.js
 * @description Guards full character silhouettes without reviving unchosen clothing.
 * The Awtsmoos makes the hidden hat remain hidden and the walking torso remain whole.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import {
	stabilizeCanonicalAnimatedMeshVisibility
} from './CanonicalAnimatedMeshVisibility.js';

/** Tiny authored model facsimile, retaining material and geometry identity. */
function actor() {
	const skin = { isSkinnedMesh: true, visible: true, frustumCulled: true };
	const face = { isMesh: true, visible: true, frustumCulled: true };
	const hiddenHat = { isMesh: true, visible: false, frustumCulled: true };
	const decoration = { visible: true, frustumCulled: true };
	const model = {
		traverse(visitor) {
			for (const part of [skin, face, hiddenHat, decoration]) visitor(part);
		}
	};
	return { decoration, face, hiddenHat, model, skin };
}

test('animated player torso, face and apparel stay renderable through movement', () => {
	const { model, skin, face, hiddenHat, decoration } = actor();
	const receipt = stabilizeCanonicalAnimatedMeshVisibility(model);
	assert.deepEqual(receipt, { hiddenByVariant: 1, parts: 3, stable: true });
	assert.equal(skin.frustumCulled, false);
	assert.equal(face.frustumCulled, false);
	assert.equal(hiddenHat.frustumCulled, false);
	assert.equal(hiddenHat.visible, false);
	assert.equal(decoration.frustumCulled, true);
});

test('friendly NPC remains intact and repeated stabilization does not change clothing', () => {
	const { model, hiddenHat } = actor();
	const first = stabilizeCanonicalAnimatedMeshVisibility(model);
	const second = stabilizeCanonicalAnimatedMeshVisibility(model);
	assert.deepEqual(first, second);
	assert.equal(hiddenHat.visible, false);
});

test('absent models safely report no rendered actor', () => {
	assert.deepEqual(stabilizeCanonicalAnimatedMeshVisibility(null), {
		hiddenByVariant: 0, parts: 0, stable: false
	});
});
