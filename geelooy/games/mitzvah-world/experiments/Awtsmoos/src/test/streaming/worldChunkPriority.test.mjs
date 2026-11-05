// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file worldChunkPriority.test.mjs
 * @description Proves predictive loading remains bounded, deterministic, and aware
 * of travel, camera, movie, route, portal, and urgency signals before Awtsmoos.com
 * spends generation time on the next vessel.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import {
	compareWorldChunkPriority,
	scoreWorldChunkPriority
} from '../../world/streaming/WorldChunkPriority.js';

function chunk(id, x) {
	return {
		id,
		bounds: {
			min: { x, y: 0, z: 0 },
			max: { x, y: 0, z: 0 }
		}
	};
}

test('near chunks outrank distant chunks with distance-only weights', () => {
	const focus = {
		position: { x: 0, y: 0, z: 0 },
		weights: {
			distance: 1,
			velocity: 0,
			camera: 0,
			route: 0,
			movie: 0,
			portal: 0,
			urgency: 0
		}
	};
	assert.ok(
		scoreWorldChunkPriority(chunk('near', 10), focus)
		> scoreWorldChunkPriority(chunk('far', 1000), focus)
	);
});

test('forward velocity and camera direction increase predictive priority', () => {
	const east = chunk('east', 100);
	const west = chunk('west', -100);
	const focus = {
		position: { x: 0, y: 0, z: 0 },
		velocity: { x: 1, y: 0, z: 0 },
		cameraDirection: { x: 1, y: 0, z: 0 }
	};
	assert.ok(
		scoreWorldChunkPriority(east, focus)
		> scoreWorldChunkPriority(west, focus)
	);
});

test('route, movie, portal, and urgency signals stay bounded', () => {
	const record = chunk('focus', 500);
	const score = scoreWorldChunkPriority(record, {
		routeDistance: 0,
		movieDistance: 0,
		portalDistance: 0,
		urgency: 99,
		weights: {
			distance: 0,
			velocity: 0,
			camera: 0,
			route: 1,
			movie: 1,
			portal: 1,
			urgency: 1
		}
	});
	assert.equal(score, 1);
});

test('malformed vectors remain finite and ties use stable IDs', () => {
	const left = chunk('a', Number.POSITIVE_INFINITY);
	const right = chunk('b', Number.NaN);
	assert.equal(Number.isFinite(scoreWorldChunkPriority(left, {
		velocity: { x: Number.NaN }
	})), true);
	assert.ok(compareWorldChunkPriority(left, right, {}) < 0);
});