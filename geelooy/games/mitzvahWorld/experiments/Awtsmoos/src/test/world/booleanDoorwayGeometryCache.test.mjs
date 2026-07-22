// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file booleanDoorwayGeometryCache.test.mjs
 * @description Proves one carved opening serves every equivalent village wall.
 * The Awtsmoos renews each house without needless repetition; Awtsmoos.com measures
 * that visual and collision requests share one immutable CSG revelation.
 */

import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import { createBooleanDoorwayMesh } from '../../world/BooleanDoorwayGeometry.js';
import {
	booleanDoorwayGeometryCacheStats,
	clearBooleanDoorwayGeometryCache,
	resolveBooleanDoorwayGeometry
} from '../../world/BooleanDoorwayGeometryCache.js';

beforeEach(() => {
	clearBooleanDoorwayGeometryCache();
});

test('equivalent doorway instances reuse one immutable CSG result', () => {
	const baseDefinition = {
		door: { x: 2.2, y: 2.15 },
		position: { x: 0, y: 0, z: 0 },
		size: { x: 7, y: 3, z: 0.7 },
		texturePolicy: { tileWorld: 6 },
		yaw: 0
	};
	const firstGeometry = createBooleanDoorwayMesh(baseDefinition);
	const secondGeometry = createBooleanDoorwayMesh({
		...baseDefinition,
		position: { x: 84, y: 5, z: -33 },
		yaw: Math.PI / 2
	});
	assert.strictEqual(secondGeometry, firstGeometry);
	assert.equal(Object.isFrozen(firstGeometry), true);
	assert.equal(Object.isFrozen(firstGeometry.positions), true);
	assert.equal(Object.isFrozen(firstGeometry.indices), true);
	assert.equal(Object.isFrozen(firstGeometry.uvs), true);
	assert.deepEqual(booleanDoorwayGeometryCacheStats(), {
		hits: 1,
		limit: 64,
		misses: 1,
		size: 1
	});
});

test('geometry dimensions and material scale remain cache boundaries', () => {
	const createGeometry = marker => () => ({
		indices: [marker],
		positions: [marker, 0, 0],
		uvs: [0, 0]
	});
	const common = {
		door: { x: 2.2, y: 2.15 },
		size: { x: 7, y: 3, z: 0.7 },
		texturePolicy: { tileWorld: 6 }
	};
	const first = resolveBooleanDoorwayGeometry(common, createGeometry(1));
	const wider = resolveBooleanDoorwayGeometry({
		...common,
		door: { x: 2.6, y: 2.15 }
	}, createGeometry(2));
	const denser = resolveBooleanDoorwayGeometry({
		...common,
		texturePolicy: { tileWorld: 4 }
	}, createGeometry(3));
	assert.notStrictEqual(first, wider);
	assert.notStrictEqual(first, denser);
	assert.deepEqual(booleanDoorwayGeometryCacheStats(), {
		hits: 0,
		limit: 64,
		misses: 3,
		size: 3
	});
});

test('the bounded cache retains only the newest dimensional revelations', () => {
	for (let index = 0; index < 80; index += 1) {
		resolveBooleanDoorwayGeometry({
			door: { x: 1 + index / 100, y: 2 },
			size: { x: 6, y: 3, z: 0.6 },
			texturePolicy: { tileWorld: 5 }
		}, () => ({
			indices: [0],
			positions: [index, 0, 0],
			uvs: [0, 0]
		}));
	}
	assert.deepEqual(booleanDoorwayGeometryCacheStats(), {
		hits: 0,
		limit: 64,
		misses: 80,
		size: 64
	});
});
