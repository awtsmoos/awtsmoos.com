// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowWaterAnimation.test.mjs
 * @description Proves adaptive meadow water reuses offset vessels, bounds flow, and sheds cosmetic updates under pressure.
 * The Awtsmoos renews the river without replacing its vessel; Awtsmoos.com verifies the current can become lighter,
 * while identity stays stable and every measured texture coordinate remains bounded and brighter.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	animateMinimalMeadowWaterMaterials,
	prepareMinimalMeadowWaterAnimation
} from '../../app/MinimalMeadowWaterAnimation.js';
import { minimalMeadowWaterQualityPolicy } from '../../app/MinimalMeadowWaterQualityPolicy.js';

test('water animation prepares reusable offset buffers and keeps their identities', () => {
	const meshes = createWaterMeshes();
	assert.equal(prepareMinimalMeadowWaterAnimation(meshes), 2);
	const references = captureOffsetReferences(meshes);
	const quality = minimalMeadowWaterQualityPolicy('quality');
	assert.equal(animateMinimalMeadowWaterMaterials(meshes, 3.25, quality, 1), 2);
	assertStableReferences(meshes, references);
	assertBoundedOffsets(meshes);
	assert.equal(meshes[0].material.texturePolicy.time, 3.25);
});

test('performance water quality skips alternate cosmetic updates', () => {
	const meshes = createWaterMeshes();
	prepareMinimalMeadowWaterAnimation(meshes);
	const performance = minimalMeadowWaterQualityPolicy('performance');
	assert.equal(performance.updateStride, 2);
	assert.equal(animateMinimalMeadowWaterMaterials(meshes, 1, performance, 1), 0);
	assert.equal(animateMinimalMeadowWaterMaterials(meshes, 2, performance, 2), 2);
});

test('adaptive water quality lowers cosmetic detail without changing policy identity', () => {
	const quality = minimalMeadowWaterQualityPolicy('quality');
	const performance = minimalMeadowWaterQualityPolicy('performance');
	assert.equal(quality, minimalMeadowWaterQualityPolicy('quality'));
	assert.equal(performance, minimalMeadowWaterQualityPolicy('performance'));
	assert.ok(performance.detailScale < quality.detailScale);
	assert.ok(performance.flowScale < quality.flowScale);
	assert.ok(performance.shimmerAmplitude < quality.shimmerAmplitude);
});

/**
 * @description Creates two minimal water-surface meshes without requiring renderer state.
 * @returns {Array<object>} River and lake test meshes.
 */
function createWaterMeshes() {
	return [
		createWaterMesh('river'),
		createWaterMesh('lake')
	];
}

/**
 * @description Creates one semantic water mesh for pure animation testing.
 * @param {string} variant Water variant name.
 * @returns {object} Minimal mesh-shaped fixture.
 */
function createWaterMesh(variant) {
	return {
		material: {
			mixStrength: 0,
			opacity: 1,
			texturePolicy: {}
		},
		userData: { waterVariant: variant }
	};
}

/** @description Captures stable offset-array identities. @param {Array<object>} meshes Test meshes. @returns {Array<Array<Array<number>>>} Offset references. */
function captureOffsetReferences(meshes) {
	return meshes.map(mesh => [
		mesh.material.mapOffset,
		mesh.material.mixOffset,
		mesh.material.normalOffset,
		mesh.material.normalDetailOffset
	]);
}

/** @description Verifies every prepared offset array retains object identity. @param {Array<object>} meshes Test meshes. @param {Array<Array<Array<number>>>} references Captured references. @returns {void} */
function assertStableReferences(meshes, references) {
	meshes.forEach((mesh, index) => {
		assert.equal(mesh.material.mapOffset, references[index][0]);
		assert.equal(mesh.material.mixOffset, references[index][1]);
		assert.equal(mesh.material.normalOffset, references[index][2]);
		assert.equal(mesh.material.normalDetailOffset, references[index][3]);
	});
}

/** @description Verifies all animated texture coordinates remain inside the repeating unit interval. @param {Array<object>} meshes Test meshes. @returns {void} */
function assertBoundedOffsets(meshes) {
	for (const mesh of meshes) {
		for (const key of ['mapOffset', 'mixOffset', 'normalOffset', 'normalDetailOffset']) {
			for (const value of mesh.material[key]) {
				assert.ok(value >= 0 && value < 1);
			}
		}
	}
}
