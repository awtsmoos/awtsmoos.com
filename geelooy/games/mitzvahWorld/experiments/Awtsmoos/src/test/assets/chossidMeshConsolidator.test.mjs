// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file chossidMeshConsolidator.test.mjs
 * @description Proves rigid and skinned Chossid parts consolidate without losing bind truth.
 * The Awtsmoos reveals one person beneath many authored pieces; Awtsmoos.com preserves
 * geometry, joints, weights, colors, and parent space while reducing repeated body draws.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	BufferAttribute,
	BufferGeometry,
	Group,
	Mesh,
	MeshStandardMaterial
} from '../../../../light-three-gltf/tiny-runtime.js';
import { consolidateChossidMeshes } from '../../assets/ChossidMeshConsolidator.js';

test('consolidates compatible rigid pieces and prunes helper geometry', () => {
	const root = new Group();
	const material = new MeshStandardMaterial({ color: [1, 1, 1, 1] });
	root.add(meshWithNormals('body-a', material, 0));
	root.add(meshWithNormals('body-b', material, 2));
	root.add(meshWithoutNormals('helper', material));
	const stats = consolidateChossidMeshes(root);
	assert.equal(stats.originalDraws, 2);
	assert.equal(stats.consolidatedDraws, 1);
	assert.equal(stats.savedDraws, 1);
	assert.equal(stats.prunedHelpers, 1);
	assert.equal(root.children[0].visible, false);
	assert.equal(root.children[1].visible, false);
	assert.equal(root.children[2].visible, false);
	const batch = root.children.find(child => child.userData.AwtsmoosChossidConsolidation);
	assert.equal(batch.geometry.attributes.position.count, 6);
	assert.equal(batch.geometry.index.count, 6);
});

test('merges same-skeleton body tints into one neutral skinned batch', () => {
	const root = new Group();
	const parent = new Group();
	parent.name = 'Scene';
	root.add(parent);
	const skeleton = { joints: [] };
	const red = skinnedMesh('red-body', [0.8, 0.2, 0.1, 1], skeleton, 0);
	const blue = skinnedMesh('blue-body', [0.1, 0.3, 0.9, 1], skeleton, 2);
	parent.add(red);
	parent.add(blue);
	const stats = consolidateChossidMeshes(root);
	assert.equal(stats.skinnedSources, 2);
	assert.equal(stats.consolidatedDraws, 1);
	assert.equal(stats.savedDraws, 1);
	const batch = parent.children.find(child => child.userData.AwtsmoosChossidConsolidation);
	assert.equal(batch.isSkinnedMesh, true);
	assert.equal(batch.skeleton, skeleton);
	assert.deepEqual(batch.material.color, [1, 1, 1, 1]);
	assert.equal(batch.geometry.attributes.joints.count, 6);
	assert.equal(batch.geometry.attributes.weights.count, 6);
	const colors = Array.from(batch.geometry.attributes.color.array);
	assertApprox(colors.slice(0, 4), [0.8, 0.2, 0.1, 1]);
	assertApprox(colors.slice(12, 16), [0.1, 0.3, 0.9, 1]);
});

function meshWithNormals(name, material, x) {
	const geometry = triangleGeometry();
	const mesh = new Mesh(geometry, material);
	mesh.name = name;
	mesh.position.x = x;
	return mesh;
}

function skinnedMesh(name, color, skeleton, x) {
	const material = new MeshStandardMaterial({ color });
	const mesh = meshWithNormals(name, material, x);
	mesh.isSkinnedMesh = true;
	mesh.skeleton = skeleton;
	mesh.geometry.setAttribute('joints', attribute(new Array(12).fill(0), 4));
	mesh.geometry.setAttribute('weights', attribute([1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0], 4));
	return mesh;
}

function triangleGeometry() {
	const geometry = new BufferGeometry();
	geometry.setAttribute('position', attribute([0, 0, 0, 1, 0, 0, 0, 1, 0], 3));
	geometry.setAttribute('normal', attribute([0, 0, 1, 0, 0, 1, 0, 0, 1], 3));
	geometry.setAttribute('uv', attribute([0, 0, 1, 0, 0, 1], 2));
	return geometry;
}

function meshWithoutNormals(name, material) {
	const geometry = new BufferGeometry();
	geometry.setAttribute('position', attribute([0, 0, 0, 0, 1, 0, 1, 0, 0], 3));
	const mesh = new Mesh(geometry, material);
	mesh.name = name;
	return mesh;
}

function attribute(values, itemSize) {
	return new BufferAttribute(new Float32Array(values), itemSize);
}

function assertApprox(actual, expected) {
	for (let index = 0; index < expected.length; index += 1) {
		assert.ok(Math.abs(actual[index] - expected[index]) < 0.000001);
	}
}
