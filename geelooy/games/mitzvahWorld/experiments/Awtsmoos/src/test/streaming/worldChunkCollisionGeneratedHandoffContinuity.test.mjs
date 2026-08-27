// B"H // Boruch Hashem // Blessed is He

/**
 * @file worldChunkCollisionGeneratedHandoffContinuity.test.mjs
 * @description Proves real seams after prepared, activated, and retired ownership.
 * The Awtsmoos remains continuous after the parent vessel withdraws; Awtsmoos.com
 * tests the actual handed-off facade through ground, camera, and capsule movement.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { clipCameraEye } from '../../camera/CameraClipSystem.js';
import { AwtsmoosCollisionMover } from '../../collision/AwtsmoosCollisionMover.js';
import { WorldGround } from '../../world/WorldGround.js';
import { completeGeneratedHandoff } from './WorldChunkCollisionGeneratedHandoffFixture.mjs';

const SEAM_SAMPLES = [-0.001, 0, 0.001];

function completedFacade() {
	return completeGeneratedHandoff().facade;
}

test('ground rays remain continuous after actual parent retirement', () => {
	const facade = completedFacade();
	const ground = new WorldGround({
		terrainHeightAt: () => -2,
		octree: facade,
		top: 4
	});
	for (const x of SEAM_SAMPLES) {
		assert.ok(Math.abs(ground.heightAt(x, 1, { maxY: 1 })) < 1e-9);
	}
	assert.equal(facade.diagnostics().ownerIds.length, 8);
});

test('camera rays remain continuous after actual parent retirement', () => {
	const facade = completedFacade();
	for (const x of SEAM_SAMPLES) {
		const clipped = clipCameraEye(
			{ x, y: 1.2, z: 2 },
			{ x, y: 1.2, z: -2 },
			facade,
			0.2
		);
		assert.ok(clipped.hit);
		assert.ok(Math.abs(clipped.eye.z - 0.42) < 1e-9);
	}
});

test('capsule movement remains continuous after actual parent retirement', () => {
	const facade = completedFacade();
	const resolved = SEAM_SAMPLES.map((x) => {
		const mover = new AwtsmoosCollisionMover({ octree: facade });
		const position = { x, y: 0, z: 0.7 };
		const result = mover.move(
			position,
			{ x: 0, y: 0, z: -0.6 },
			{ grounded: false, floorY: 0, maxStepHeight: 0.3 }
		);
		assert.ok(result.contacts > 0);
		return position.z;
	});
	assert.ok(Math.min(...resolved) > 0.35);
	assert.ok(Math.max(...resolved) - Math.min(...resolved) < 0.01);
});
