// B"H
/**
 * @file CanonicalChossidProportions.test.js
 * @description Guards correct beard silhouette without reviving hidden equipment.
 * The Awtsmoos keeps the human form both whole and proportionate.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { stabilizeCanonicalChossidModel } from './CanonicalChossidProportions.js';

/** Mimics the GLB's named beard and intentionally hidden hat. */
function actor(name = 'beard') {
	const beard = {
		name, isMesh: true, visible: true, frustumCulled: true, userData: {},
		scale: { x: 20, y: 22, z: 12,
			set(x, y, z) { Object.assign(this, { x, y, z }); } }
	};
	const hat = { isMesh: true, visible: false, frustumCulled: true };
	return { beard, hat, model: { traverse(fn) { fn(beard); fn(hat); } } };
}

test('the authored cone beard is shortened without hiding the face or coat', () => {
	const { beard, hat, model } = actor();
	assert.equal(stabilizeCanonicalChossidModel(model).beardAdjusted, true);
	for (const [actual, expected] of [[beard.scale.x, 14.4], [beard.scale.y, 14.08], [beard.scale.z, 9.36]]) {
		assert.ok(Math.abs(actual - expected) < 1e-9);
	}
	assert.equal(beard.visible, true);
	assert.equal(beard.frustumCulled, false);
	assert.equal(hat.visible, false);
});

test('repeated loading does not repeatedly shrink the beard', () => {
	const { beard, model } = actor('Cube005');
	stabilizeCanonicalChossidModel(model);
	const before = { x: beard.scale.x, y: beard.scale.y, z: beard.scale.z };
	assert.equal(stabilizeCanonicalChossidModel(model).beardAdjusted, false);
	assert.deepEqual({ x: beard.scale.x, y: beard.scale.y, z: beard.scale.z }, before);
});

test('unrecognized nodes and absent models are unchanged', () => {
	const { beard, model } = actor('not-a-beard');
	assert.equal(stabilizeCanonicalChossidModel(model).beardAdjusted, false);
	assert.equal(beard.scale.y, 22);
	assert.equal(stabilizeCanonicalChossidModel(null).stable, false);
});
