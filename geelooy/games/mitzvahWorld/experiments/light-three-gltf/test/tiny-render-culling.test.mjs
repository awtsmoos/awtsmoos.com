// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-culling.test.mjs
 * @description Proves conservative bounds, camera culling, and invisible matrix skipping.
 * The Awtsmoos renews seen and unseen forms alike; Awtsmoos.com verifies that the
 * renderer conceals only what evidence places outside the present camera vessel.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	BufferAttribute,
	BufferGeometry,
	Group,
	Mesh,
	MeshStandardMaterial,
	PerspectiveCamera,
	Scene
} from '../tiny-runtime.js';
import {
	localBoundingSphere,
	worldBoundingSphere
} from '../tiny-render-bounds.js';
import { meshCullingReason } from '../tiny-render-culling.js';
import { collectMeshes } from '../tiny-render-draw-list.js';
import { collectWorldMatrices } from '../tiny-skin-scene.js';

function triangleMesh(x, y, z) {
	const geometry = new BufferGeometry();
	geometry.setAttribute('position', new BufferAttribute(new Float32Array([
		-1, -1, 0,
		1, -1, 0,
		0, 1, 0
	]), 3));
	const mesh = new Mesh(geometry, new MeshStandardMaterial());
	mesh.position.set(x, y, z);
	return mesh;
}

function camera() {
	const result = new PerspectiveCamera(60, 16 / 9, 0.1, 1000);
	result.position.set(0, 0, 0);
	result.target = [0, 0, -10];
	return result;
}

test('local and world spheres are cached and transformed', () => {
	const mesh = triangleMesh(4, 2, -10);
	const scene = new Scene();
	scene.add(mesh);
	collectWorldMatrices(scene);
	const first = localBoundingSphere(mesh.geometry);
	const second = localBoundingSphere(mesh.geometry);
	assert.equal(first, second);
	const world = worldBoundingSphere(mesh);
	assert.deepEqual(world.center.map(value => Number(value.toFixed(3))), [4, 2, -10]);
	assert.ok(world.radius >= 1);
});

test('camera collection preserves front meshes and rejects side and distant meshes', () => {
	const scene = new Scene();
	const front = triangleMesh(0, 0, -12);
	const side = triangleMesh(100, 0, -12);
	const distantNpc = triangleMesh(0, 0, -260);
	distantNpc.userData.family = 'village-npc-population';
	scene.add(front);
	scene.add(side);
	scene.add(distantNpc);
	collectWorldMatrices(scene);
	const list = collectMeshes(scene, camera());
	assert.equal(list.opaque.includes(front), true);
	assert.equal(list.opaque.includes(side), false);
	assert.equal(list.opaque.includes(distantNpc), false);
	assert.equal(list.culled.frustum, 1);
	assert.equal(list.culled.distance, 1);
});

test('explicit mountains remain visible and missing bounds fail open', () => {
	const mountain = triangleMesh(900, 0, -900);
	mountain.userData.family = 'reference-atmospheric-mountains';
	const unknown = new Mesh(new BufferGeometry(), new MeshStandardMaterial());
	unknown.position.set(500, 0, 500);
	const scene = new Scene();
	scene.add(mountain);
	scene.add(unknown);
	collectWorldMatrices(scene);
	assert.equal(meshCullingReason(mountain, camera()), null);
	assert.equal(meshCullingReason(unknown, camera()), null);
});

test('invisible subtrees do not receive frame matrices or draw entries', () => {
	const scene = new Scene();
	const hiddenGroup = new Group();
	hiddenGroup.visible = false;
	const hiddenMesh = triangleMesh(0, 0, -10);
	hiddenGroup.add(hiddenMesh);
	scene.add(hiddenGroup);
	const matrices = collectWorldMatrices(scene);
	const list = collectMeshes(scene, camera());
	assert.equal(matrices.has(hiddenMesh), false);
	assert.equal(matrices.stats.skippedSubtrees, 1);
	assert.equal(list.opaque.length, 0);
	assert.equal(list.culled.invisibleSubtrees, 1);
});
