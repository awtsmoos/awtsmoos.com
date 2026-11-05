// B"H // Boruch Hashem // Blessed is He

/**
 * @file worldChunkCollisionGeneratedBoundaryContinuity.test.mjs
 * @description Proves factory-generated children preserve real seam continuity.
 * The Awtsmoos lets the traveler cross generated octants without falling through;
 * Awtsmoos.com tests capsule, ground, and camera rays around the exact x-axis seam.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { clipCameraEye } from '../../camera/CameraClipSystem.js';
import { AwtsmoosCollisionMover } from '../../collision/AwtsmoosCollisionMover.js';
import { WorldGround } from '../../world/WorldGround.js';
import { WorldChunkCollisionQueryFacade } from '../../world/streaming/WorldChunkCollisionQueryFacade.js';
import {
	activeQueryEntry,
	collisionQueryIndex
} from './WorldChunkCollisionQueryFixture.mjs';
import {
	GENERATED_PARENT_ID,
	createGeneratedBoundaryChildren
} from './WorldChunkCollisionGeneratedFixture.mjs';

const SEAM_SAMPLES = [-0.001, 0, 0.001];

function createGeneratedFacade() {
	const generated = createGeneratedBoundaryChildren();
	const entries = generated.definitions.map((definition) => activeQueryEntry({
		chunkId: definition.chunkId,
		parentId: GENERATED_PARENT_ID,
		octree: definition.octree,
		generationVersion: definition.generationVersion,
		handoffId: 'generated-children'
	}));
	return new WorldChunkCollisionQueryFacade(collisionQueryIndex(entries));
}

test('generated child ground rays preserve floor height across x seam', () => {
	const facade = createGeneratedFacade();
	const ground = new WorldGround({
		terrainHeightAt: () => -2,
		octree: facade,
		top: 4
	});
	const heights = SEAM_SAMPLES.map((x) => ground.heightAt(x, 1, { maxY: 1 }));
	for (const height of heights) {
		assert.ok(Math.abs(height) < 1e-9);
	}
	assert.equal(facade.diagnostics().ownerIds.length, 8);
});

test('generated child camera rays preserve clipped eye across x seam', () => {
	const facade = createGeneratedFacade();
	const clippedEyes = SEAM_SAMPLES.map((x) => clipCameraEye(
		{ x, y: 1.2, z: 2 },
		{ x, y: 1.2, z: -2 },
		facade,
		0.2
	));
	for (const clipped of clippedEyes) {
		assert.ok(clipped.hit);
		assert.ok(Math.abs(clipped.eye.z - 0.42) < 1e-9);
	}
});

test('generated child capsule movement resolves one wall across x seam', () => {
	const facade = createGeneratedFacade();
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
