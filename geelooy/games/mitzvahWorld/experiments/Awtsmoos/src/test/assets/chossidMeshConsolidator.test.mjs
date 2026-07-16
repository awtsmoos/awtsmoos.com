// B"H
import assert from 'node:assert/strict';
import test from 'node:test';
import {
	Bone,
	BufferAttribute,
	BufferGeometry,
	Group,
	Mesh,
	MeshStandardMaterial
} from '../../../../light-three-gltf/tiny-runtime.js';
import { consolidateChossidMeshes } from '../../assets/ChossidMeshConsolidator.js';

test('rigid pieces sharing an animated bone and material become one exact chossid batch', () => {
	const root = new Group();
	const head = new Bone();
	head.name = 'mixamorig:Head';
	root.add(head);
	const material = new MeshStandardMaterial({ name: 'hair', color: [0.2, 0.1, 0.05, 1] });
	const left = nodeWithTriangle(material, -1);
	const right = nodeWithTriangle(material, 1);
	head.add(left);
	head.add(right);
	root.updateWorldMatrix();
	const stats = consolidateChossidMeshes(root);
	assert.equal(stats.batches, 1);
	assert.equal(stats.rigidSources, 2);
	assert.equal(stats.savedDraws, 1);
	const batches = head.children.filter(child => child.userData?.AwtsmoosChossidConsolidation);
	assert.equal(batches.length, 1);
	assert.equal(batches[0].geometry.attributes.position.count, 6);
	assert.deepEqual([...batches[0].geometry.attributes.position.array].filter((_, index) => index % 3 === 0), [-1, 0, -1, 1, 2, 1]);
});

function nodeWithTriangle(material, x) {
	const node = new Group();
	node.position.set(x, 0, 0);
	const geometry = new BufferGeometry();
	geometry.setAttribute('position', new BufferAttribute(new Float32Array([
		0, 0, 0,
		1, 0, 0,
		0, 1, 0
	]), 3));
	geometry.setAttribute('normal', new BufferAttribute(new Float32Array([
		0, 0, 1,
		0, 0, 1,
		0, 0, 1
	]), 3));
	const mesh = new Mesh(geometry, material);
	node.add(mesh);
	return node;
}
