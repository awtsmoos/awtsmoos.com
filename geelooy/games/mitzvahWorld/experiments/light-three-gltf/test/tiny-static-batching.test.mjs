// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-static-batching.test.mjs
 * @description Proves eligibility, tint baking, broad cells, and conservative culling.
 * The Awtsmoos joins static forms while every hue remains exact; Awtsmoos.com leaves moving
 * and transparent vessels separate and divides the valley into broad, still-cullable quadrants.
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

test('static cottages merge while moving and transparent meshes remain separate', () => {
	const scene = new Scene();
	const material = new MeshStandardMaterial({ color: [0.7, 0.6, 0.5, 1] });
	const moving = triangle(material, 3, 'reference-village-district');
	moving.name = 'animated-chossid';
	const waterMaterial = new MeshStandardMaterial({ color: [0.2, 0.5, 0.8, 0.7] });
	waterMaterial.transparent = true;
	waterMaterial.alphaMode = 'BLEND';
	for (const mesh of [
		triangle(material, 1, 'reference-village-district'),
		triangle(material, 2, 'reference-village-district'),
		moving,
		triangle(waterMaterial, 0, 'reference-arrival-composition')
	]) scene.add(mesh);
	const result = collect(scene, 100);
	assert.equal(result.staticBatch.batchedSourceMeshes, 2);
	assert.equal(result.staticBatch.savedDraws, 1);
	assert.equal(result.opaque.length, 2);
	assert.equal(result.transparent.length, 1);
	assert.ok(result.opaque.includes(moving));
});

test('different static tints merge into exact baked vertex colors', () => {
	const scene = new Scene();
	const mapImage = { naturalHeight: 64, naturalWidth: 64 };
	scene.add(triangle(material([0.8, 0.25, 0.2, 1], mapImage), 1, 'functional-house', [0.5, 0.8, 1, 1]));
	scene.add(triangle(material([0.2, 0.75, 0.3, 1], mapImage), 2, 'village-static-props', [0.5, 0.8, 1, 1]));
	const result = collect(scene, 100);
	assert.equal(result.staticBatch.batchedSourceMeshes, 2);
	assert.equal(result.opaque.length, 1);
	const batch = result.opaque[0];
	assert.deepEqual(batch.material.color, [1, 1, 1, 1]);
	assert.equal(batch.material.mapImage, mapImage);
	const colors = Array.from(batch.geometry.attributes.color.array);
	assertApprox(colors.slice(0, 4), [0.4, 0.2, 0.2, 1]);
	assertApprox(colors.slice(12, 16), [0.1, 0.6, 0.3, 1]);
});

test('384-unit cells preserve a culled far quadrant', () => {
	const scene = new Scene();
	const shared = new MeshStandardMaterial({ color: [0.7, 0.6, 0.5, 1] });
	for (const x of [1, 2, 398, 399]) {
		scene.add(triangle(shared, x, 'reference-village-district'));
	}
	const result = collect(scene, 500);
	assert.equal(result.staticBatch.batchMeshes, 2);
	assert.equal(result.staticBatch.batchedSourceMeshes, 4);
	assert.equal(result.staticBatch.savedDraws, 2);
	assert.equal(result.opaque.length, 1);
	assert.equal(result.culled.frustum, 1);
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

function assertApprox(actual, expected) {
	for (let index = 0; index < expected.length; index += 1) {
		assert.ok(Math.abs(actual[index] - expected[index]) < 0.000001);
	}
}
