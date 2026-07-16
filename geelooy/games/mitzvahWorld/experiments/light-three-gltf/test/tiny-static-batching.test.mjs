// B"H
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
import { collectMeshes } from '../tiny-render-draw-list.js';
import { StaticOpaqueBatcher } from '../tiny-static-opaque-batcher.js';

test('visible static cottage surfaces merge while moving and transparent meshes stay independent', () => {
	const scene = new Scene();
	const material = new MeshStandardMaterial({ color: [0.7, 0.6, 0.5, 1] });
	const first = triangle(material, 1, 'reference-village-district');
	const second = triangle(material, 2, 'reference-village-district');
	const moving = triangle(material, 3, 'reference-village-district');
	moving.name = 'animated-chossid';
	const waterMaterial = new MeshStandardMaterial({ color: [0.2, 0.5, 0.8, 0.7] });
	waterMaterial.transparent = true;
	waterMaterial.alphaMode = 'BLEND';
	const water = triangle(waterMaterial, 0, 'reference-arrival-composition');
	for (const mesh of [first, second, moving, water]) scene.add(mesh);
	scene.updateWorldMatrix();
	const camera = new PerspectiveCamera(60, 1, 0.1, 100);
	camera.position.set(0, 2, 8);
	camera.target = [0, 0, 0];
	const result = collectMeshes(scene, camera, {
		culling: true,
		defaultRenderDistance: 100,
		staticBatcher: new StaticOpaqueBatcher()
	});
	assert.equal(result.staticBatch.batchedSourceMeshes, 2);
	assert.equal(result.staticBatch.savedDraws, 1);
	assert.equal(result.opaque.length, 2);
	assert.equal(result.transparent.length, 1);
	assert.ok(result.opaque.some(mesh => mesh.name.startsWith('AwtsmoosStaticBatch:')));
	assert.ok(result.opaque.includes(moving));
});

test('static batches stay spatially partitioned for effective frustum culling', () => {
	const scene = new Scene();
	const material = new MeshStandardMaterial({ color: [0.7, 0.6, 0.5, 1] });
	for (const x of [1, 2, 98, 99]) {
		scene.add(triangle(material, x, 'reference-village-district'));
	}
	scene.updateWorldMatrix();
	const camera = new PerspectiveCamera(60, 1, 0.1, 200);
	camera.position.set(0, 2, 8);
	camera.target = [0, 0, 0];
	const result = collectMeshes(scene, camera, {
		culling: true,
		defaultRenderDistance: 200,
		staticBatcher: new StaticOpaqueBatcher()
	});
	assert.equal(result.staticBatch.batchMeshes, 2);
	assert.equal(result.staticBatch.batchedSourceMeshes, 4);
	assert.equal(result.staticBatch.savedDraws, 2);
	assert.equal(result.opaque.length, 1);
	assert.equal(result.culled.frustum, 1);
});

test('unchanged static membership reuses the prepared grouping result', () => {
	const scene = new Scene();
	const material = new MeshStandardMaterial({ color: [0.7, 0.6, 0.5, 1] });
	scene.add(triangle(material, 1, 'reference-village-district'));
	scene.add(triangle(material, 2, 'reference-village-district'));
	scene.updateWorldMatrix();
	const camera = new PerspectiveCamera(60, 1, 0.1, 100);
	camera.position.set(0, 2, 8);
	camera.target = [0, 0, 0];
	const staticBatcher = new StaticOpaqueBatcher();
	const options = { staticBatcher };
	const first = collectMeshes(scene, camera, options);
	const second = collectMeshes(scene, camera, options);
	assert.equal(second.staticBatch, first.staticBatch);
	assert.equal(second.opaque[0], first.opaque[0]);
});

function triangle(material, x, family) {
	const geometry = new BufferGeometry();
	geometry.setAttribute('position', new BufferAttribute(new Float32Array([
		-0.5, 0, 0,
		0.5, 0, 0,
		0, 1, 0
	]), 3));
	const mesh = new Mesh(geometry, material);
	mesh.position.set(x, 0, 0);
	mesh.userData.family = family;
	return mesh;
}
