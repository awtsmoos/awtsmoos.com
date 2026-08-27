// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-transparency.test.mjs
 * @description Proves cutout depth, blended distance order, shader discard, and safe culling.
 * The Awtsmoos distinguishes concealment from translucency; Awtsmoos.com verifies leaves
 * remain depth-writing solids while water and haze compose from farthest to nearest.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { fragmentShader } from '../tiny-fragment-shader.js';
import {
	BufferAttribute,
	BufferGeometry,
	Mesh,
	MeshStandardMaterial,
	PerspectiveCamera,
	Scene
} from '../tiny-runtime.js';
import {
	collectMeshes,
	isTransparent,
	shouldCullBackfaces
} from '../tiny-render-draw-list.js';
import { collectWorldMatrices } from '../tiny-skin-scene.js';

test('MASK remains opaque while BLEND sorts back-to-front', () => {
	const scene = new Scene();
	const nearWater = triangle(-5, new MeshStandardMaterial({
		alphaMode: 'BLEND',
		opacity: 0.55
	}));
	const leaves = triangle(-10, new MeshStandardMaterial({
		alphaCutoff: 0.2,
		alphaMode: 'MASK',
		doubleSided: true,
		opacity: 0.45,
		transparent: true
	}));
	const farMist = triangle(-25, new MeshStandardMaterial({
		alphaMode: 'BLEND',
		opacity: 0.35
	}));
	scene.add(nearWater);
	scene.add(leaves);
	scene.add(farMist);
	collectWorldMatrices(scene);
	const result = collectMeshes(scene, camera(), { culling: false });
	assert.equal(isTransparent(leaves), false);
	assert.equal(isTransparent(nearWater), true);
	assert.equal(result.opaque.includes(leaves), true);
	assert.deepEqual(result.transparent, [farMist, nearWater]);
});

test('MASK discard and safe opaque culling remain explicit', () => {
	assert.match(
		fragmentShader,
		/if\(uAlphaMode==1&&mixedColor\.a<uAlphaCutoff\)discard/
	);
	const ordinary = triangle(-4, new MeshStandardMaterial());
	const optedOut = triangle(-5, {
		alphaMode: 'OPAQUE',
		backfaceCull: false,
		doubleSided: false,
		opacity: 1
	});
	const twoSided = triangle(-6, new MeshStandardMaterial({ doubleSided: true }));
	const blended = triangle(-7, new MeshStandardMaterial({
		alphaMode: 'BLEND',
		opacity: 0.5
	}));
	const blendedTwoSided = triangle(-8, new MeshStandardMaterial({
		alphaMode: 'BLEND',
		doubleSided: true,
		opacity: 0.5
	}));
	assert.equal(shouldCullBackfaces(ordinary), true);
	assert.equal(shouldCullBackfaces(optedOut), false);
	assert.equal(shouldCullBackfaces(twoSided), false);
	assert.equal(shouldCullBackfaces(blended), true);
	assert.equal(shouldCullBackfaces(blendedTwoSided), false);
});

function triangle(z, material) {
	const geometry = new BufferGeometry();
	geometry.setAttribute('position', new BufferAttribute(new Float32Array([
		-1, -1, 0,
		1, -1, 0,
		0, 1, 0
	]), 3));
	const mesh = new Mesh(geometry, material);
	mesh.position.z = z;
	return mesh;
}

function camera() {
	const result = new PerspectiveCamera(60, 1, 0.1, 100);
	result.position.set(0, 0, 0);
	result.target = [0, 0, -10];
	return result;
}
