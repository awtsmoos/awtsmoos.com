// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import { Aabb } from '../math/Aabb.js';
import { AwtsmoosOctree } from '../collision/AwtsmoosOctree.js';
import { primitiveColliders } from '../world/Box3D.js';
import { clipCameraEye } from './CameraClipSystem.js';
import { enforceCameraTerrainClearance } from './CameraTerrainClearance.js';

/**
 * @file CameraWallTerrainClip.test.mjs
 * @description Round 7 physics sweep: camera collision against the REAL
 * octree (not a stub) — clipCameraEye must pull the eye to the target side
 * of a solid wall, and enforceCameraTerrainClearance must lift an eye that
 * sank below the canonical terrain back above it.
 */

test('clipCameraEye stops at a real octree wall', () => {
	const octree = new AwtsmoosOctree(new Aabb(
		{ x: -140, y: -48, z: -140 },
		{ x: 140, y: 96, z: 140 }
	), 0, 7);
	for (const collider of primitiveColliders({
		id: 'cam-wall',
		position: { x: 0, y: 1.625, z: -10 },
		shape: 'box',
		size: { x: 16, y: 3.25, z: 0.4 }
	})) octree.insert(collider);
	const clipped = clipCameraEye(
		{ x: 0, y: 1.6, z: -6 },
		{ x: 0, y: 1.6, z: -14 },
		octree,
		1.25
	);
	assert.ok(clipped.hit, 'a wall contact must be reported');
	assert.ok(clipped.eye.z > -9.8, `eye must stay on the target side of the wall, z=${clipped.eye.z}`);
	assert.ok(clipped.eye.z < -9.0, `eye must actually be clipped back, z=${clipped.eye.z}`);
});

test('camera terrain clearance lifts a sunken eye above the hill', () => {
	const sunk = enforceCameraTerrainClearance({ eye: { x: -120, y: 0.5, z: -120 }, hit: null });
	assert.equal(sunk.terrainClipped, true);
	assert.ok(sunk.eye.y > 61, `eye must rise above the ~61 m hill, y=${sunk.eye.y}`);
});
