// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzLocomotionStride.test.mjs
 * @description Proves the no-slide contract (stride phase advances proportional to
 * measured world distance), footstep event timing, planting when idle, bob/roll
 * presentation shape, and smoothed visual facing.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	advanceLocomotionStride,
	applyLocomotionStridePresentation,
	createLocomotionStride,
	drainLocomotionFootsteps
} from './EretzLocomotionStride.js';

const TAU = Math.PI * 2;

function input(overrides = {}) {
	return {
		clipDuration: 1,
		deltaTime: 1 / 60,
		facing: 0,
		locomotion: 'walk',
		moving: true,
		referenceSpeed: 3.7,
		speed: 3.7,
		...overrides
	};
}

function near(actual, expected, epsilon = 1e-9, label = '') {
	assert.ok(Math.abs(actual - expected) <= epsilon, `${label} ${actual} != ${expected}`);
}

test('stride phase advances proportional to distance traveled (no slide)', () => {
	const slow = createLocomotionStride();
	advanceLocomotionStride(slow, input({ speed: 1.85 }));
	const fast = createLocomotionStride();
	advanceLocomotionStride(fast, input({ speed: 3.7 }));
	near(fast.phase / slow.phase, 2, 1e-9, 'phase ratio matches speed ratio');
	const expected = (3.7 / 60) * TAU / (3.7 * 1);
	near(fast.phase, expected, 1e-9, 'exact no-slide phase');
});

test('phase freezes and no footsteps fire while planted', () => {
	const stride = createLocomotionStride();
	advanceLocomotionStride(stride, input({ moving: false, locomotion: 'stand', speed: 0 }));
	near(stride.phase, 0, 1e-12, 'phase stays planted');
	assert.equal(stride.footstepEvents.length, 0);
	assert.equal(stride.stepIndex, 0);
});

test('footstep events fire once per half cycle with locomotion evidence', () => {
	const stride = createLocomotionStride();
	// One full clip cycle at rate 1 travels exactly referenceSpeed * clipDuration
	// (frame deltas clamp at 0.2s, so five frames make the full second).
	for (let i = 0; i < 5; i++) {
		advanceLocomotionStride(stride, input({ deltaTime: 0.2, speed: 3.7 }));
	}
	assert.equal(stride.stepIndex, 2, 'two footsteps per full stride cycle');
	const events = drainLocomotionFootsteps(stride);
	assert.equal(events.length, 2);
	assert.equal(events[0].stepIndex, 1);
	assert.equal(events[1].stepIndex, 2);
	assert.equal(events[0].locomotion, 'walk');
	near(events[0].speed, 3.7, 1e-12);
	assert.equal(stride.footstepEvents.length, 0, 'drain clears the queue');
});

test('bob and roll breathe with the stride and settle when stopping', () => {
	const stride = createLocomotionStride();
	advanceLocomotionStride(stride, input({ deltaTime: 0.25, speed: 3.7 }));
	assert.ok(stride.strideWeight > 0.5, 'weight eases in while moving');
	const bobMidStride = stride.bobY;
	advanceLocomotionStride(stride, input({ deltaTime: 0.25, speed: 3.7 }));
	assert.notEqual(stride.bobY, bobMidStride, 'bob oscillates with phase');
	assert.ok(Math.abs(stride.bobY) <= 0.023, 'walk bob stays subtle');
	assert.ok(Math.abs(stride.roll) <= 0.026, 'walk roll stays subtle');
	for (let i = 0; i < 120; i++) {
		advanceLocomotionStride(stride, input({ deltaTime: 1 / 60, moving: false, locomotion: 'stand', speed: 0 }));
	}
	near(stride.strideWeight, 0, 1e-6, 'weight decays when planted');
	near(stride.bobY, 0, 1e-9, 'bob settles to zero');
	near(stride.roll, 0, 1e-9, 'roll settles to zero');
});

test('visual yaw smooths toward facing along the shortest arc', () => {
	const stride = createLocomotionStride();
	advanceLocomotionStride(stride, input({ facing: 0 }));
	near(stride.visualYaw, 0, 1e-12, 'first frame snaps');
	advanceLocomotionStride(stride, input({ deltaTime: 0.01, facing: Math.PI }));
	assert.ok(stride.visualYaw > 0 && stride.visualYaw < Math.PI, 'yaw eases, never pops');
	// Shortest arc from 3.0 to -3.0 passes through PI, not through 0.
	const wrapped = createLocomotionStride();
	advanceLocomotionStride(wrapped, input({ facing: 3.0 }));
	advanceLocomotionStride(wrapped, input({ deltaTime: 0.01, facing: -3.0 }));
	assert.ok(wrapped.visualYaw > 3.0, `takes the short way around PI: ${wrapped.visualYaw}`);
	for (let i = 0; i < 120; i++) {
		advanceLocomotionStride(wrapped, input({ deltaTime: 1 / 60, facing: -3.0 }));
	}
	near(wrapped.visualYaw, -3.0, 1e-6, 'yaw converges');
});

test('walk/run label cannot flutter at the boundary but stopping is instant', () => {
	const stride = createLocomotionStride();
	advanceLocomotionStride(stride, input({ locomotion: 'run', deltaTime: 0.05 }));
	assert.equal(stride.smoothedLocomotion, 'stand', 'run label debounces');
	advanceLocomotionStride(stride, input({ locomotion: 'run', deltaTime: 0.2 }));
	assert.equal(stride.smoothedLocomotion, 'run', 'sustained run switches');
	advanceLocomotionStride(stride, input({ locomotion: 'stand', moving: false, speed: 0, deltaTime: 1 / 60 }));
	assert.equal(stride.smoothedLocomotion, 'stand', 'stopping plants immediately');
});

test('presentation applies bob and smoothed yaw without touching state', () => {
	const stride = createLocomotionStride();
	advanceLocomotionStride(stride, input({ deltaTime: 0.1, facing: 1.2, speed: 3.7 }));
	const model = {
		position: { x: 5, y: 9, z: 6, set(x, y, z) { this.x = x; this.y = y; this.z = z; } },
		quaternion: { set(x, y, z, w) { this.x = x; this.y = y; this.z = z; this.w = w; } }
	};
	const state = { facing: 1.2, renderY: 3 };
	model.position.set(5, 3, 6);
	applyLocomotionStridePresentation(model, state, stride);
	near(model.position.y, 3 + stride.bobY, 1e-12, 'bob offsets rendered height only');
	assert.equal(state.renderY, 3, 'authoritative state untouched');
	assert.equal(state.facing, 1.2, 'authoritative facing untouched');
	const length = Math.hypot(model.quaternion.x, model.quaternion.y, model.quaternion.z, model.quaternion.w);
	near(length, 1, 1e-9, 'quaternion stays unit');
});

test('identical inputs produce identical stride output (deterministic)', () => {
	const run = () => {
		const stride = createLocomotionStride();
		for (let i = 0; i < 30; i++) {
			advanceLocomotionStride(stride, input({ deltaTime: 1 / 60, facing: i * 0.01, speed: 3.7 }));
		}
		return stride;
	};
	const a = run();
	const b = run();
	near(a.phase, b.phase, 0, 'phase deterministic');
	near(a.bobY, b.bobY, 0, 'bob deterministic');
	near(a.roll, b.roll, 0, 'roll deterministic');
	near(a.visualYaw, b.visualYaw, 0, 'yaw deterministic');
	assert.deepEqual(
		a.footstepEvents.map(event => [event.stepIndex, event.locomotion]),
		b.footstepEvents.map(event => [event.stepIndex, event.locomotion])
	);
});
