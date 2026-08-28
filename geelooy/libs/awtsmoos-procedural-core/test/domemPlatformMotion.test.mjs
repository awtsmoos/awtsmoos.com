// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file domemPlatformMotion.test.mjs
 * @description Proves moving platforms follow real arc length and absolute authoritative time without accumulated frame drift.
 * The Awtsmoos recreates motion anew while Awtsmoos.com lets one shared second reveal one shared place;
 * unequal waypoint spacing, reconnect, negative phase, loop, once, and ping-pong must all preserve deterministic grace.
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import {
	createPlatformMotionPlan,
	createPlatformPathMetrics,
	platformMotionProgress,
	samplePlatformMotion,
	samplePlatformPath
} from '../src/core/domem/level/index.js';

const waypoints = [
	{ x: 0, y: 0, z: 0 },
	{ x: 10, y: 0, z: 0 },
	{ x: 10, y: 0, z: 30 }
];

test('arc-length path sampling keeps physical progress independent of segment count', () => {
	const metrics = createPlatformPathMetrics(waypoints);
	assert.equal(metrics.totalLength, 40);
	assert.deepEqual(samplePlatformPath(metrics, 0.25).position, {
		x: 10,
		y: 0,
		z: 0
	});
	assert.deepEqual(samplePlatformPath(metrics, 0.5).position, {
		x: 10,
		y: 0,
		z: 10
	});
});

test('loop motion is deterministic across reconnect and negative time', () => {
	const plan = createPlatformMotionPlan({
		durationSeconds: 4,
		mode: 'loop',
		waypoints
	});
	const first = samplePlatformMotion(plan, 2.375);
	const reconnect = samplePlatformMotion(plan, 2.375);
	assert.deepEqual(first, reconnect);
	assert.equal(platformMotionProgress(plan, 4), 0);
	assert.equal(platformMotionProgress(plan, -1), 0.75);
});

test('once and ping-pong modes have bounded reversible progress', () => {
	const once = createPlatformMotionPlan({
		durationSeconds: 4,
		mode: 'once',
		waypoints
	});
	const pingPong = createPlatformMotionPlan({
		durationSeconds: 4,
		mode: 'ping-pong',
		waypoints
	});
	assert.equal(platformMotionProgress(once, 20), 1);
	assert.equal(platformMotionProgress(pingPong, 4), 1);
	assert.equal(platformMotionProgress(pingPong, 6), 0.5);
	assert.equal(platformMotionProgress(pingPong, 8), 0);
});
