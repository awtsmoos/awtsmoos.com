// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-static-batching.test.mjs
 * @description Proves conservative batching, tint baking, spatial cells, and cache reuse.
 * The Awtsmoos joins static forms while each visible hue remains exact; Awtsmoos.com leaves
 * moving and transparent vessels separate and reuses unchanged world-space merged geometry.
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
import { collectMeshes } from '../tiny-render-draw-list.js';
import { StaticOpaqueBatcher } from '../tiny-static-opaque-batcher.js';

test('static cottage surfaces merge while moving and transparent meshes stay independent', () => {
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
	const result = collect(scene, 100);
	assert.equal(result.staticBatch.batchedSourceMeshes, 2);
	assert.equal(result.staticBatch.savedDraws, 1);
	assert.equal(result.opaque.length, 2);
	assert.equal(result.transparent.length, 1);
	assert.ok(result.opaque.some(mesh => mesh.name.startsWith('AwtsmoosStaticBatch:')));
	assert.ok(result.opaque.includes(moving));
});

test('different static tints merge and remain exact in baked vertex colors', () => {
	const scene = new Scene();
	const sharedMap = { naturalHeight: 64, naturalWidth: 64 };
	const red = material([0.8, 0.25, 0.2, 1], sharedMap);
	const green = material([0.2, 0.75, 0.3, 1], sharedMap);
	scene.add(triangle(red, 1, 'functional-house', [0.5, 0.8, 1, 1]));
	scene.add(triangle(green, 2, 'functional-house', [0.5, 0.8, 1, 1]));
	const result = collect(scene, 100);
	assert.equal(result.staticBatch.batchedSourceMeshes, 2);
	assert.equal(result.opaque.length, 1);
	const batch = result.opaque[0];
	assert.deepEqual(batch.material.color, [1, 1, 1, 1]);
	assert.equal(batch.material.mapImage, sharedMap);
	assert.equal(batch.material.userData.AwtsmoosStaticBatchMaterial.tintBakedIntoVertexColor, true);
	const colors = Array.from(batch.geometry.attributes.color.array);
	assert.deepEqual(colors.slice(0, 4), [0.4, 0.2, 0.2, 1]);
	assert.deepEqual(colors.slice(12, 16), [0.1, 0.6, 0.3, 1]);
});

test('static batches stay spatially partitioned for effective frustum culling', () => {
	const scene = new Scene();
	const shared = new MeshStandardMaterial({ color: [0.7, 0.6, 0.5, 1] });
	for (const x of [1, 2, 198, 199]) {
		scene.add(triangle(shared, x, 'reference-village-district'));
	}
	const result = collect(scene, 300);
	assert.equal(result.staticBatch.batchMeshes, 2);
	assert.equal(result.staticBatch.batchedSourceMeshes, 4);
	assert.equal(result.staticBatch.savedDraws, 2);
	assert.equal(result.opaque.length, 1);
	assert.equal(result.culled.frustum, 1);
});

test('unchanged static membership reuses the prepared grouping result', () => {
	const scene = new Scene();
	const shared = new MeshStandardMaterial({ color: [0.7, 0.6, 0.5, 1] });
	scene.add(triangle(shared, 1, 'reference-village-district'));
	scene.add(triangle(shared, 2, 'reference-village-district'));
	scene.updateWorldMatrix();
	const camera = cameraAt(100);
	const staticBatcher = new StaticOpaqueBatcher();
	const first = collectMeshes(scene, camera, { staticBatcher });
	const second = collectMeshes(scene, camera, { staticBatcher });
	assert.equal(second.staticBatch, first.staticBatch);
	assert.equal(second.opaque[0], first.opaque[0]);
});

function collect(scene, distance) {
	scene.updateWorldMatrix();
	return collectMeshes(scene, cameraAt(distance), {
		culling: true,
		defaultRenderDistance: distance,
		staticBatcher: new StaticOpaqueBatcher()
	});
}

function cameraAt(far) {
	const camera = new PerspectiveCamera(60, 1, 0.1, far);
	camera.position.set(0, 2, 8);
	camera.target = [0, 0, 0];
	return camera;
}

function material(color, mapImage) {
	const value = new MeshStandardMaterial({ color });
	value.mapImage = mapImage;
	return value;
}

function triangle(materialValue, x, family, vertexColor = [1, 1, 1, 1]) {
	const geometry = new BufferGeometry();
	geometry.setAttribute('position', attribute([-0.5, 0, 0, 0.5, 0, 0, 0, 1, 0], 3));
	geometry.setAttribute('color', attribute([...vertexColor, ...vertexColor, ...vertexColor], 4));
	const mesh = new Mesh(geometry, materialValue);
	mesh.position.set(x, 0, 0);
	mesh.userData.family = family;
	return mesh;
}

function attribute(values, size) {
	return new BufferAttribute(new Float32Array(values), size);
}
