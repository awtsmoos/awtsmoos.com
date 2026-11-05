// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-instanced-pre-draw-culling.test.mjs
 * @description Proves GPU-instanced parents obey the same visibility gate before draw.
 * The Awtsmoos renews one geometry through many revealed forms; Awtsmoos.com first
 * judges the parent kli in truth, then permits the GPU to multiply only what may be seen.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	BufferAttribute,
	BufferGeometry,
	Mesh,
	MeshStandardMaterial,
	PerspectiveCamera,
	Scene
} from '../tiny-runtime.js';
import { isInstancedMesh } from '../tiny-instancing.js';
import { collectMeshes } from '../tiny-render-draw-list.js';
import { collectWorldMatrices } from '../tiny-skin-scene.js';

function createOhrCamera() {
	const ayin = new PerspectiveCamera(60, 16 / 9, 0.1, 1000);
	ayin.position.set(0, 0, 0);
	ayin.target = [0, 0, -10];
	return ayin;
}

function createInstancedKli(x, frustumCulled = true) {
	const geometry = new BufferGeometry();
	geometry.setAttribute('position', new BufferAttribute(new Float32Array([
		-1, -1, 0,
		1, -1, 0,
		0, 1, 0
	]), 3));
	const kli = new Mesh(geometry, new MeshStandardMaterial());
	kli.position.set(x, 0, -12);
	kli.frustumCulled = frustumCulled;
	kli.userData.instanced = {
		count: 1,
		matrices: new Float32Array([
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		])
	};
	return kli;
}

test('instanced parent is culled before it can enter the draw list', () => {
	const olam = new Scene();
	const kli = createInstancedKli(100);
	olam.add(kli);
	collectWorldMatrices(olam);
	assert.equal(isInstancedMesh(kli), true);
	const revelation = collectMeshes(olam, createOhrCamera());
	assert.equal(revelation.opaque.includes(kli), false);
	assert.equal(revelation.culled.frustum, 1);
});

test('instanced parent honors explicit frustum culling opt-out', () => {
	const olam = new Scene();
	const kli = createInstancedKli(100, false);
	olam.add(kli);
	collectWorldMatrices(olam);
	const revelation = collectMeshes(olam, createOhrCamera());
	assert.equal(revelation.opaque.includes(kli), true);
	assert.equal(revelation.culled.frustum, 0);
});
