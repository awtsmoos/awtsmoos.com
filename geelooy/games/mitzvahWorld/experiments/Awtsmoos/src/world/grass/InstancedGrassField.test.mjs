// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InstancedGrassField.test.mjs
 * @description Proves the ecological grass plan becomes GPU-instanced draws:
 * one canonical tuft geometry per habitat profile, one matrix per placement,
 * and renderer-consumable indexed geometry through the merged-mesh pipeline.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createInstancedGrassVariants } from './InstancedGrassField.js';
import { isInstancedMesh } from '../../../../light-three-gltf/tiny-instancing.js';

function plan(placements) {
	return { placements };
}

test('B"H placements group into one variant per habitat profile', () => {
	const variants = createInstancedGrassVariants(plan([
		{ position: { x: 1, y: 0, z: 2 }, scale: 1, profile: 'meadow-fescue' },
		{ position: { x: 3, y: 0, z: 4 }, scale: 1.2, profile: 'meadow-fescue' },
		{ position: { x: 5, y: 0, z: 6 }, scale: 1.5, profile: 'river-reed' }
	]));
	assert.equal(variants.length, 2);
	const fescue = variants.find(variant => variant.profile === 'meadow-fescue');
	const reed = variants.find(variant => variant.profile === 'river-reed');
	assert.equal(fescue.userData.instanced.count, 2);
	assert.equal(reed.userData.instanced.count, 1);
	assert.ok(isInstancedMesh(fescue));
	assert.ok(isInstancedMesh(reed));
});

test('B"H instance matrices carry placement translation and scale', () => {
	const variants = createInstancedGrassVariants(plan([
		{ position: { x: 7, y: 1.5, z: -3 }, scale: 2, profile: 'soft-rye' }
	]));
	const matrices = variants[0].userData.instanced.matrices;
	assert.equal(matrices.length, 16);
	assert.equal(matrices[12], 7);
	assert.equal(matrices[13], 1.5);
	assert.equal(matrices[14], -3);
	assert.equal(matrices[15], 1);
	// Uniform scale on the diagonal (rotation may redistribute x/z).
	const scaleX = Math.hypot(matrices[0], matrices[1], matrices[2]);
	const scaleY = Math.hypot(matrices[4], matrices[5], matrices[6]);
	assert.ok(Math.abs(scaleX - 2) < 0.0001, `scaleX ${scaleX}`);
	assert.ok(Math.abs(scaleY - 2) < 0.0001, `scaleY ${scaleY}`);
	// Rotation part stays orthonormal.
	const dot = matrices[0] * matrices[8] + matrices[2] * matrices[10];
	assert.ok(Math.abs(dot) < 0.0001, `orthonormal ${dot}`);
});

test('B"H variant geometry is indexed renderer geometry at the origin', () => {
	const variants = createInstancedGrassVariants(plan([
		{ position: { x: 50, y: 0, z: 50 }, scale: 1, profile: 'meadow-fescue' }
	]));
	const geometry = variants[0].geometry;
	assert.equal(geometry.mode, 4);
	assert.ok(geometry.attributes.position.count > 0);
	assert.ok(geometry.attributes.normal.count === geometry.attributes.position.count);
	assert.ok(geometry.attributes.uv.count === geometry.attributes.position.count);
	assert.ok(geometry.index.count > 0);
	// Canonical tuft is built at the origin; placement lives in the matrix.
	const positions = geometry.attributes.position.array;
	let maxRadius = 0;
	for (let index = 0; index < positions.length; index += 3) {
		maxRadius = Math.max(
			maxRadius,
			Math.hypot(positions[index], positions[index + 2])
		);
	}
	assert.ok(maxRadius < 5, `tuft radius ${maxRadius}`);
});

test('B"H empty plans yield no variants', () => {
	assert.deepEqual(createInstancedGrassVariants(plan([])), []);
	assert.deepEqual(createInstancedGrassVariants(null), []);
});
