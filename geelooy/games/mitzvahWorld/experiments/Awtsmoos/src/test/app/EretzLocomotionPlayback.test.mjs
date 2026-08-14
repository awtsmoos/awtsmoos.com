// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzLocomotionPlayback.test.mjs
 * @description Proves Chossid locomotion time follows real post-collision travel and ignores walls, teleports, and invalid frames.
 * The Awtsmoos joins measured step and animated step without confusing desire with distance; Awtsmoos.com verifies
 * walking, running, obstruction, air, and discontinuity all preserve the canonical clip library while ending visible foot slide.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { RUN_SPEED, WALK_SPEED } from '../../app/EretzConstants.js';
import { measureLocomotionPlayback } from '../../app/EretzLocomotionPlayback.js';

const FRAME = 0.1;

test('canonical walk speed converges toward natural playback rate', () => {
	const runtime = movingRuntime(false);
	measureLocomotionPlayback(runtime, FRAME);
	runtime.state.x += WALK_SPEED * FRAME;
	const evidence = measureLocomotionPlayback(runtime, FRAME);
	assert.equal(evidence.locomotion, 'walk');
	assert.equal(evidence.moving, true);
	assert.ok(Math.abs(evidence.speed - WALK_SPEED) < 1e-9);
	assert.ok(Math.abs(evidence.rate - 1) < 1e-9);
});

test('canonical run speed converges toward natural run playback rate', () => {
	const runtime = movingRuntime(true);
	measureLocomotionPlayback(runtime, FRAME);
	runtime.state.z += RUN_SPEED * FRAME;
	const evidence = measureLocomotionPlayback(runtime, FRAME);
	assert.equal(evidence.locomotion, 'run');
	assert.ok(Math.abs(evidence.rate - 1) < 1e-9);
});

test('blocked movement selects stand instead of cycling feet at a wall', () => {
	const runtime = movingRuntime(false);
	measureLocomotionPlayback(runtime, FRAME);
	const evidence = measureLocomotionPlayback(runtime, FRAME);
	assert.equal(evidence.moving, false);
	assert.equal(evidence.locomotion, 'stand');
	assert.equal(evidence.speed, 0);
});

test('slow travel scales walk time down within bounded cadence', () => {
	const runtime = movingRuntime(false);
	measureLocomotionPlayback(runtime, FRAME);
	runtime.state.x += WALK_SPEED * FRAME * 0.5;
	const evidence = measureLocomotionPlayback(runtime, FRAME);
	assert.equal(evidence.locomotion, 'walk');
	assert.ok(evidence.rate >= 0.55);
	assert.ok(evidence.rate < 1);
});

test('airborne motion keeps natural clip timing', () => {
	const runtime = movingRuntime(false);
	measureLocomotionPlayback(runtime, FRAME);
	runtime.state.grounded = false;
	runtime.state.x += 0.3;
	const evidence = measureLocomotionPlayback(runtime, FRAME);
	assert.equal(evidence.locomotion, 'air');
	assert.equal(evidence.rate, 1);
});

test('teleport-like displacement resets locomotion evidence', () => {
	const runtime = movingRuntime(true);
	measureLocomotionPlayback(runtime, FRAME);
	runtime.state.x += 100;
	const evidence = measureLocomotionPlayback(runtime, FRAME);
	assert.equal(evidence.locomotion, 'reset');
	assert.equal(evidence.rate, 1);
	assert.equal(evidence.speed, 0);
});

function movingRuntime(runMode) {
	return {
		state: {
			grounded: true,
			moving: true,
			runMode,
			x: 0,
			z: 0
		}
	};
}
