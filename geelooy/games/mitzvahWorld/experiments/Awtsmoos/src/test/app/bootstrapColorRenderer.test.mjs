// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bootstrapColorRenderer.test.mjs
 * @description Proves every current bootstrap mesh is drawn once through shared buffers.
 * The Awtsmoos renews the world as its bounded shape evolves; Awtsmoos.com measures the scene
 * that actually exists instead of preserving an obsolete count from an earlier meadow.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { PerspectiveCamera, Scene } from '../../../../light-three-gltf/tiny-runtime.js';
import { BootstrapColorRenderer } from '../../app/BootstrapColorRenderer.js';
import { createProgressiveStats } from '../../app/ProgressiveWebGLDefaults.js';
import { createBootstrapVisiblePlayer } from '../../app/BootstrapVisiblePlayer.js';
import { createBootstrapVisibleWorld } from '../../app/BootstrapVisibleWorld.js';
import { createBootstrapColorFakeGl } from '../helpers/bootstrapColorFakeGl.mjs';

test('colored bootstrap renderer draws the bounded current world and player', () => {
	const { calls, gl } = createBootstrapColorFakeGl();
	const stats = createProgressiveStats();
	const renderer = new BootstrapColorRenderer(gl, stats);
	const scene = createScene();
	const expected = sceneMetrics(scene);
	const camera = new PerspectiveCamera(45, 16 / 9, 0.1, 200);
	camera.position.set(0, 4.2, -7);
	camera.target = [0, 1.25, 0];
	renderer.render(scene, camera, [0.36, 0.56, 0.72, 1]);
	assert.equal(calls.programs, 1);
	assert.equal(calls.buffers, 2);
	assert.equal(calls.draws, expected.meshes);
	assert.equal(calls.constantColors, expected.uncoloredMeshes);
	assert.equal(stats.draws, expected.meshes);
	assert.equal(stats.meshes, expected.meshes);
	assert.equal(stats.triangles, expected.triangles);
	assert.ok(expected.meshes <= 24);
});

function createScene() {
	const scene = new Scene();
	scene.add(createBootstrapVisibleWorld());
	scene.add(createBootstrapVisiblePlayer());
	return scene;
}

function sceneMetrics(scene) {
	const metrics = { meshes: 0, triangles: 0, uncoloredMeshes: 0 };
	scene.traverse(object => {
		if (!isBootstrapMesh(object)) return;
		metrics.meshes += 1;
		const geometry = object.geometry;
		const count = geometry.index?.count || geometry.attributes?.position?.count || 0;
		metrics.triangles += Math.floor(count / 3);
		if (!geometry.attributes?.color) metrics.uncoloredMeshes += 1;
	});
	return metrics;
}

function isBootstrapMesh(object) {
	return (object.isMesh || object.isSkinnedMesh)
		&& object.visible !== false
		&& object.userData?.bootstrapVisual;
}
