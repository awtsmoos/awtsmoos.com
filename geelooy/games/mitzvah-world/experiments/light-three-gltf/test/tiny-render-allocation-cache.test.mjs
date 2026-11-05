// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-allocation-cache.test.mjs
 * @description Proves frame, transform, world-map, and bounds storage reuse without math drift.
 * The Awtsmoos renews every coordinate; Awtsmoos.com verifies the same finite vessels may
 * receive those exact values again instead of becoming short-lived frame garbage.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { lookAt, multiply, perspective } from '../tiny-math.js';
import { worldBoundingSphere } from '../tiny-render-bounds.js';
import { renderFrame } from '../tiny-render-frame.js';
import {
	BufferAttribute,
	BufferGeometry,
	Group,
	Mesh,
	MeshStandardMaterial,
	PerspectiveCamera,
	Scene
} from '../tiny-runtime.js';
import { collectWorldMatrices } from '../tiny-skin-scene.js';

test('world traversal reuses map, snapshots, hierarchy matrices, and sphere storage', () => {
	const scene = new Scene();
	const group = new Group();
	const mesh = triangle();
	mesh.position.z = -10;
	group.add(mesh);
	scene.add(group);
	const firstMap = collectWorldMatrices(scene);
	const firstStats = firstMap.stats;
	const firstSnapshot = group._localTransformSnapshot;
	const firstLocal = group._localMatrixCache;
	const firstGroupWorld = group.matrixWorld;
	const firstMeshWorld = mesh.matrixWorld;
	const firstSphere = worldBoundingSphere(mesh);
	const firstCenter = firstSphere.center;
	const secondMap = collectWorldMatrices(scene, firstMap);
	assert.equal(secondMap, firstMap);
	assert.equal(secondMap.stats, firstStats);
	assert.equal(group._localTransformSnapshot, firstSnapshot);
	assert.equal(group._localMatrixCache, firstLocal);
	assert.equal(group.matrixWorld, firstGroupWorld);
	assert.equal(mesh.matrixWorld, firstMeshWorld);
	assert.equal(worldBoundingSphere(mesh), firstSphere);
	assert.equal(secondMap.stats.updatedNodes, 0);
	assert.equal(secondMap.stats.reusedNodes, 3);
	group.position.x = 4;
	collectWorldMatrices(scene, secondMap);
	const movedSphere = worldBoundingSphere(mesh);
	assert.equal(group._localTransformSnapshot, firstSnapshot);
	assert.equal(group._localMatrixCache, firstLocal);
	assert.equal(group.matrixWorld, firstGroupWorld);
	assert.notEqual(mesh.matrixWorld, firstMeshWorld);
	assert.equal(movedSphere, firstSphere);
	assert.equal(movedSphere.center, firstCenter);
	assert.equal(Number(movedSphere.center[0].toFixed(4)), 4);
	assert.equal(Number(movedSphere.center[2].toFixed(4)), -10);
});

test('render frames reuse camera matrices, camera position, and world map exactly', () => {
	const scene = new Scene();
	const camera = new PerspectiveCamera(60, 16 / 9, 0.1, 900);
	camera.position.set(3, 4, 8);
	camera.target = [0, 1, -4];
	const renderer = fakeRenderer();
	renderFrame(renderer, scene, camera);
	const map = renderer.worldByNode;
	const cameraPosition = renderer.frameCameraPosition;
	const projection = renderer._frameMatrixCache.projection;
	const view = renderer._frameMatrixCache.view;
	const projectionView = renderer._frameMatrixCache.projectionView;
	assert.deepEqual(
		Array.from(projectionView),
		Array.from(multiply(
			perspective(camera.fov, camera.aspect, camera.near, camera.far),
			lookAt(camera.position.toArray(), camera.target)
		))
	);
	camera.position.x = 5;
	renderFrame(renderer, scene, camera);
	assert.equal(renderer.worldByNode, map);
	assert.equal(renderer.frameCameraPosition, cameraPosition);
	assert.equal(renderer._frameMatrixCache.projection, projection);
	assert.equal(renderer._frameMatrixCache.view, view);
	assert.equal(renderer._frameMatrixCache.projectionView, projectionView);
	assert.equal(renderer.frameCameraPosition.x, 5);
	assert.deepEqual(
		Array.from(projectionView),
		Array.from(multiply(
			perspective(camera.fov, camera.aspect, camera.near, camera.far),
			lookAt(camera.position.toArray(), camera.target)
		))
	);
});

function triangle() {
	const geometry = new BufferGeometry();
	geometry.setAttribute('position', new BufferAttribute(new Float32Array([
		-1, -1, 0,
		1, -1, 0,
		0, 1, 0
	]), 3));
	return new Mesh(geometry, new MeshStandardMaterial());
}

function fakeRenderer() {
	const gl = {
		BACK: 1029,
		BLEND: 3042,
		COLOR_BUFFER_BIT: 16384,
		CULL_FACE: 2884,
		DEPTH_BUFFER_BIT: 256,
		DEPTH_TEST: 2929,
		ONE_MINUS_SRC_ALPHA: 771,
		SRC_ALPHA: 770,
		blendFunc() {},
		clear() {},
		clearColor() {},
		depthMask() {},
		disable() {},
		enable() {}
	};
	return {
		buffers: { beginFrame() {} },
		clearColor: [0, 0, 0, 1],
		errors: [],
		frameCameraPosition: { x: 0, y: 0, z: 0 },
		frameToken: 0,
		gl,
	glStateCache: null,
		interactor: { x: 0, y: 0, z: 0 },
		materialState: { beginFrame() {}, previous: null },
		options: { culling: false, showSkeleton: false }
	};
}
