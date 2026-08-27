// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file primitiveNativeTextureDensity.test.mjs
 * @description Proves physical primitives bake world UVs and repeat untouched source pixels.
 * The Awtsmoos grants image and geometry their own finite dimensions; Awtsmoos.com verifies
 * that material identity can be shared without resizing either geometry or source resolution.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveNativeTextureRepeat } from '../../../../light-three-gltf/tiny-native-texture-density.js';
import { createPrimitiveMesh } from '../../world/Box3D.js';

test('box faces bake one UV unit per world unit before source repetition', () => {
	const source = image(2048, 1024);
	const mesh = createPrimitiveMesh({
		color: '#ffffff',
		id: 'Awtsmoos_native_stone_box',
		mapImage: source,
		position: { x: 0, y: 0, z: 0 },
		shape: 'box',
		size: { x: 8, y: 4, z: 6 },
		texturePolicy: { texelsPerWorld: 96, tileWorld: 2 }
	});
	assertPair(mesh.material.texturePolicy.uvUnitsPerWorld, [1, 1]);
	assertPair(mesh.userData.AwtsmoosTextureDensity.measuredUnits, [0.5, 0.5]);
	assertPair(resolveNativeTextureRepeat(
		source,
		mesh.material.mapRepeat,
		mesh.material.texturePolicy
	), [0.046875, 0.09375]);
	assert.equal(mesh.material.mapImage, source);
});

test('authored manual UVs become a measured shared world basis', () => {
	const source = image(1024, 512);
	const mesh = createPrimitiveMesh({
		color: '#ffffff',
		faces: [[0, 1, 2, 3]],
		id: 'Awtsmoos_native_plaster_wall',
		mapImage: source,
		shape: 'manual',
		texturePolicy: { texelsPerWorld: 96 },
		uvs: [0, 0, 1, 0, 1, 1, 0, 1],
		vertices: [[0, 0, 0], [4, 0, 0], [4, 2, 0], [0, 2, 0]]
	});
	assertPair(mesh.material.texturePolicy.uvUnitsPerWorld, [1, 1]);
	assert.deepEqual(
		Array.from(mesh.geometry.attributes.uv.array),
		[0, 0, 4, 0, 4, 2, 0, 2]
	);
	assertPair(resolveNativeTextureRepeat(
		source,
		mesh.material.mapRepeat,
		mesh.material.texturePolicy
	), [0.09375, 0.1875]);
});

test('sign cards remain whole unless explicitly declared physical', () => {
	const source = image(1024, 512);
	const sign = createPrimitiveMesh({
		color: '#ffffff',
		id: 'Awtsmoos_bilingual_sign_card',
		mapImage: source,
		mapRepeat: [3, 4],
		position: { x: 0, y: 0, z: 0 },
		shape: 'box',
		size: { x: 3, y: 1, z: 0.1 }
	});
	assert.equal(sign.material.texturePolicy.nativeTexelDensity, false);
	assert.deepEqual(resolveNativeTextureRepeat(
		source,
		sign.material.mapRepeat,
		sign.material.texturePolicy
	), [3, 4]);
});

function image(width, height) {
	return { complete: true, height, width };
}

function assertPair(actual, expected) {
	assert.equal(actual.length, expected.length);
	for (let index = 0; index < expected.length; index += 1) {
		assert.ok(Math.abs(actual[index] - expected[index]) < 1e-9);
	}
}
