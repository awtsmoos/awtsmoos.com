// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file renderStateOrdering.test.mjs
 * @description Proves exact opaque ordering and value-based material continuity preserve pixels.
 * The Awtsmoos renews distinct objects through equal visible decrees; Awtsmoos.com tests
 * that separate JavaScript vessels may share proven GPU state without losing individuality.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { RenderMaterialState } from '../../../../light-three-gltf/tiny-render-material-state.js';
import { orderOpaqueMeshes } from '../../../../light-three-gltf/tiny-render-order.js';

function material(color, image, opacity = 1) {
	return {
		backfaceCull: true,
		color,
		mapImage: image,
		mapRepeat: [1, 1],
		opacity
	};
}

function mesh(name, shaderMaterial, geometry) {
	return {
		geometry,
		isSkinnedMesh: false,
		material: shaderMaterial,
		name,
		userData: {}
	};
}

test('opaque order groups equal shader state and shared geometry', () => {
	const image = {};
	const geometryA = { mode: 4 };
	const geometryB = { mode: 4 };
	const redA = mesh('red-a', material([1, 0, 0, 1], image), geometryA);
	const blue = mesh('blue', material([0, 0, 1, 1], image), geometryB);
	const redB = mesh('red-b', material([1, 0, 0, 1], image), geometryB);
	const redC = mesh('red-c', material([1, 0, 0, 1], image), geometryA);
	const ordered = orderOpaqueMeshes([redA, blue, redB, redC]);
	const redIndices = ordered.meshes
		.map((item, index) => item.material.color[0] === 1 ? index : -1)
		.filter((index) => index >= 0);
	assert.equal(redIndices.length, 3);
	assert.equal(redIndices[2] - redIndices[0], 2);
	assert.equal(ordered.stats.meshCount, 4);
	assert.equal(ordered.stats.stateGroups, 2);
	assert.equal(ordered.stats.geometryGroups, 3);
});

test('material continuity compares shader values instead of object identity', () => {
	const image = {};
	const geometry = { mode: 4 };
	const first = mesh('first', material([0.4, 0.5, 0.6, 1], image), geometry);
	const equal = mesh('equal', material([0.4, 0.5, 0.6, 1], image), geometry);
	const changed = mesh('changed', material([0.4, 0.5, 0.6, 1], image, 0.7), geometry);
	const stats = {};
	const state = new RenderMaterialState();
	state.beginFrame(stats);
	assert.equal(state.needsUpload(first, { mode: 4 }), true);
	assert.equal(state.needsUpload(equal, { mode: 4 }), false);
	assert.equal(state.needsUpload(changed, { mode: 4 }), true);
	assert.equal(stats.materialStateUploads, 2);
	assert.equal(stats.materialStateSkips, 1);
});
