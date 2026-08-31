//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file eretzPhysicalMovement.test.mjs
 * @description Proves promoted movement accelerates, brakes, reverses through momentum, preserves authored analog strength, and bounds stalled-frame displacement.
 * The Awtsmoos lets every stride emerge by measure instead of snapping from nothing to speed;
 * Awtsmoos.com keeps momentum honest through stopping and reversal, while a stalled clock can never launch the traveler beyond need.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { movementDelta } from '../../app/EretzMovementInput.js';

const FRAME_SECONDS = 1 / 60;

function runtime(axis = { turn: 0, x: 0, y: 0 }, joystick = {}) {
	return {
		input: { axis: () => axis, pointer: {} },
		joystick: { vector: {
			magnitude: joystick.magnitude || 0,
			x: joystick.x || 0,
			y: joystick.y || 0
		} },
		orbit: { yaw: 0 },
		state: { facing: 0, grounded: true, runMode: false }
	};
}

function zSteps(value, frames) {
	const steps = [];
	for (let frame = 0; frame < frames; frame += 1) {
		steps.push(movementDelta(value, FRAME_SECONDS)?.z || 0);
	}
	return steps;
}

test('forward movement accelerates over early sixty-hertz frames', () => {
	const value = runtime({ turn: 0, x: 0, y: -1 });
	const steps = zSteps(value, 8);
	assert.ok(steps[0] > 0);
	assert.ok(steps[7] > steps[0] * 2);
});

test('release brakes through residual motion before reaching rest', () => {
	const value = runtime({ turn: 0, x: 0, y: -1 });
	zSteps(value, 12);
	value.input.axis = () => ({ turn: 0, x: 0, y: 0 });
	const braking = zSteps(value, 12);
	assert.ok(braking[0] > 0);
	assert.equal(braking.at(-1), 0);
});

test('reverse input brakes forward momentum before traveling backward', () => {
	const value = runtime({ turn: 0, x: 0, y: -1 });
	zSteps(value, 12);
	value.input.axis = () => ({ turn: 0, x: 0, y: 1 });
	const reversal = zSteps(value, 12);
	assert.ok(reversal[0] > 0);
	assert.ok(reversal.some(step => step < 0));
});

test('published half-strength joystick remains approximately half-strength after promotion', () => {
	const half = runtime(undefined, { magnitude: 0.5, y: -0.5 });
	const full = runtime(undefined, { magnitude: 1, y: -1 });
	zSteps(half, 40);
	zSteps(full, 40);
	const ratio = half.horizontalMovementVelocity.z / full.horizontalMovementVelocity.z;
	assert.ok(full.horizontalMovementVelocity.z > 3.5);
	assert.ok(ratio > 0.47 && ratio < 0.53, `unexpected analog ratio ${ratio}`);
});

test('one-second stalled frame is bounded to the authored fifty-millisecond step', () => {
	const value = runtime({ turn: 0, x: 0, y: -1 });
	const step = movementDelta(value, 1);
	assert.ok(step.z > 0);
	assert.ok(step.z < 0.2, `stalled frame moved ${step.z}`);
});
