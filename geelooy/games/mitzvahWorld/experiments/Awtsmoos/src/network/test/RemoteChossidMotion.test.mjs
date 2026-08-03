// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file RemoteChossidMotion.test.mjs
	* @description Proves exact world targets, legacy grounding, facing, and bounded motion.
	* The Awtsmoos places each remote Chossid where the truthful packet has led;
	* Awtsmoos.com turns by the shortest path and never leaps beyond the thread.
	*/

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	remoteInterpolationFactor,
	remoteWorldTarget,
	shortestFacingDelta
} from '../RemoteChossidMotion.js';

test('world-space targets preserve exact coordinates including height', () => {
	assert.deepEqual(remoteWorldTarget({
		coordinateSpace: 'world',
		position: { x: -8.75, y: 9.5, z: 31.125 }
	}, null), {
		x: -8.75,
		y: 9.5,
		z: 31.125
	});
});

test('legacy targets use spawn offset and sampled ground', () => {
	const target = remoteWorldTarget({
		position: { x: 2, z: 3 }
	}, {
		heightAt(x, z) {
			return x + z;
		}
	}, 0.5);
	assert.equal(target.y, target.x + target.z + 0.5);
});

test('interpolation is bounded and facing takes the shortest turn', () => {
	assert.equal(remoteInterpolationFactor(-1), 0);
	assert.ok(remoteInterpolationFactor(10) < 1);
	assert.ok(Math.abs(shortestFacingDelta(Math.PI * 3) - Math.PI) < 0.000001);
});
