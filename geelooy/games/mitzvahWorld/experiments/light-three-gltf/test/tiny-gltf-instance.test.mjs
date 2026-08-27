// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-gltf-instance.test.mjs
 * @description Proves resource sharing and mutable skeleton isolation between actors.
 * The Awtsmoos renews each body through one shared form; Awtsmoos.com verifies that
 * geometry and palette vessels are reused while bones and transforms remain independent.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { instantiateTinyGltf } from '../tiny-gltf-instance.js';
import {
	Bone,
	BufferGeometry,
	Group,
	Mesh
} from '../tiny-runtime.js';

function template() {
	const root = new Group();
	const bone = new Bone();
	const node = new Group();
	const geometry = new BufferGeometry();
	const material = { color: [1, 1, 1, 1], name: 'jacket' };
	geometry.attributes.joints = { array: new Uint16Array([0, 0, 0, 0]) };
	geometry.attributes.weights = { array: new Float32Array([1, 0, 0, 0]) };
	bone.userData.nodeIndex = 0;
	node.userData.nodeIndex = 1;
	const mesh = new Mesh(geometry, material);
	mesh.skinIndex = 0;
	node.add(mesh);
	root.add(bone);
	root.add(node);
	root.userData = {
		accessors: [],
		allNodes: [bone, node],
		gltf: {
			animations: [],
			skins: [{ joints: [0], name: 'Armature' }]
		},
		nodeMap: new Map([[0, bone], [1, node]]),
		sourceUrl: 'memory://actor.glb'
	};
	return {
		json: root.userData.gltf,
		scene: root,
		stats: { meshes: 1 }
	};
}

function find(root, predicate) {
	let found = null;
	root.traverse(node => {
		if (!found && predicate(node)) found = node;
	});
	return found;
}

test('instances share geometry and default material but not bones', () => {
	const source = template();
	const first = instantiateTinyGltf(source, { label: 'first' });
	const second = instantiateTinyGltf(source, { label: 'second' });
	const firstMesh = find(first.scene, node => node.isMesh);
	const secondMesh = find(second.scene, node => node.isMesh);
	const firstBone = first.scene.userData.nodeMap.get(0);
	const secondBone = second.scene.userData.nodeMap.get(0);
	assert.equal(firstMesh.geometry, secondMesh.geometry);
	assert.equal(firstMesh.material, secondMesh.material);
	assert.notEqual(firstBone, secondBone);
	assert.notEqual(firstMesh.skeleton, secondMesh.skeleton);
	assert.equal(firstMesh.skeleton.joints[0], firstBone);
	assert.equal(secondMesh.skeleton.joints[0], secondBone);
	firstBone.position.x = 9;
	assert.equal(secondBone.position.x, 0);
});

test('palette resolvers can share one variant across many instances', () => {
	const source = template();
	const variant = { color: [0.1, 0.2, 0.3, 1], name: 'jacket@blue' };
	const options = {
		label: 'blue',
		materialResolver: material => material.name === 'jacket' ? variant : material
	};
	const first = instantiateTinyGltf(source, options);
	const second = instantiateTinyGltf(source, options);
	const firstMesh = find(first.scene, node => node.isMesh);
	const secondMesh = find(second.scene, node => node.isMesh);
	assert.equal(firstMesh.material, variant);
	assert.equal(secondMesh.material, variant);
	assert.equal(first.stats.sharedGeometries, 1);
	assert.equal(first.stats.sharedTemplate, true);
});
