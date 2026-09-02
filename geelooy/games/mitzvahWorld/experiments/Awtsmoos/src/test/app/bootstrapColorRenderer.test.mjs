// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bootstrapColorRenderer.test.mjs
 * @description Proves the internal capability renderer can draw bounded world geometry without manufacturing a bootstrap human.
 * The Awtsmoos may test earth and WebGL before the authored traveler is revealed; Awtsmoos.com keeps that hidden vessel lean,
 * so the capability frame contains no generated person even while rich renderer and texture prepare the final scene.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { PerspectiveCamera, Scene } from '../../../../light-three-gltf/tiny-runtime.js';
import { BootstrapColorRenderer } from '../../app/BootstrapColorRenderer.js';
import { createProgressiveStats } from '../../app/ProgressiveWebGLDefaults.js';
import { createBootstrapVisibleWorld } from '../../app/BootstrapVisibleWorld.js';
import { createBootstrapColorFakeGl } from '../helpers/bootstrapColorFakeGl.mjs';

test('colored bootstrap renderer draws bounded world geometry without a human placeholder', () => {
	const { calls, gl } = createBootstrapColorFakeGl();
	const stats = createProgressiveStats();
	const renderer = new BootstrapColorRenderer(gl, stats);
	const scene = new Scene();
	scene.add(createBootstrapVisibleWorld());
	const expected = sceneMetrics(scene);
	const camera = new PerspectiveCamera(45, 16 / 9, 0.1, 200);
	camera.position.set(0, 4.2, -7);
	camera.target = [0, 1.25, 0];
	renderer.render(scene, camera, [0.36, 0.56, 0.72, 1]);
	assert.equal(calls.programs, 1);
	assert.equal(calls.draws, expected.meshes);
	assert.equal(stats.meshes, expected.meshes);
	assert.ok(expected.meshes > 0);
});

function sceneMetrics(scene) {
	const metrics = { meshes: 0 };
	scene.traverse(object => {
		if ((object.isMesh || object.isSkinnedMesh) && object.visible !== false && object.userData?.bootstrapVisual) {
			metrics.meshes += 1;
		}
	});
	return metrics;
}
