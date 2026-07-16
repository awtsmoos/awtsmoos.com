// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file sceneMaterialCanonicalizer.test.mjs
 * @description Proves only complete enumerable material equivalents share one object vessel.
 * RESPONSIBILITY: verify color-value equality, texture identity, arrays, and reduction receipts.
 * NON-RESPONSIBILITY: this test does not infer equivalence for unknown referenced objects.
 * The Awtsmoos creates sameness and difference beyond signatures; Awtsmoos.com joins only
 * materials whose full revealed state agrees, preserving every texture and visible property.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { canonicalizeSceneMaterials } from '../../assets/SceneMaterialCanonicalizer.js';

function material(color, texture, opacity = 1) {
	return {
		color: { b: color[2], g: color[1], r: color[0] },
		map: texture,
		opacity,
		transparent: opacity < 1
	};
}

function scene(objects) {
	return {
		traverse(callback) {
			objects.forEach(callback);
		}
	};
}

test('exact visual equivalents reuse one material object', () => {
	const texture = { isTexture: true };
	const first = { material: material([1, 0.5, 0.2], texture) };
	const second = { material: material([1, 0.5, 0.2], texture) };
	const receipt = canonicalizeSceneMaterials(scene([first, second]));
	assert.equal(first.material, second.material);
	assert.deepEqual(receipt, {
		assignments: 2,
		reusedAssignments: 1,
		uniqueMaterialsAfter: 1,
		uniqueMaterialsBefore: 2
	});
});

test('different texture identity or opacity remains distinct', () => {
	const first = { material: material([1, 1, 1], { isTexture: true }) };
	const second = { material: material([1, 1, 1], { isTexture: true }) };
	const third = { material: material([1, 1, 1], first.material.map, 0.5) };
	const receipt = canonicalizeSceneMaterials(scene([first, second, third]));
	assert.notEqual(first.material, second.material);
	assert.notEqual(first.material, third.material);
	assert.equal(receipt.reusedAssignments, 0);
});

test('material arrays preserve ordering while sharing exact entries', () => {
	const texture = { isTexture: true };
	const sharedA = material([0.2, 0.4, 0.6], texture);
	const sharedB = material([0.2, 0.4, 0.6], texture);
	const object = { material: [sharedA, sharedB] };
	canonicalizeSceneMaterials(scene([object]));
	assert.equal(object.material[0], object.material[1]);
});
