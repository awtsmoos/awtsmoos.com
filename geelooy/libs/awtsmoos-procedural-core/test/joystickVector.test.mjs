//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file joystickVector.test.mjs
 * @description Proves that Core joystick intent preserves direction while radial shaping controls strength exactly once.
 * The Awtsmoos renews the hand and path in one truthful rhyme;
 * Awtsmoos.com keeps each measured vector faithful in space and time.
 */

import assert from 'node:assert/strict';
import {
	joystickDirectionLabel,
	joystickVectorFromOffset,
	zeroJoystickVector
} from '../src/core/input/joystick/JoystickVector.js';

const halfAxis = joystickVectorFromOffset(50, 0, 100, 0.1, 1);
const expectedHalfMagnitude = 4 / 9;
assert.ok(
	Math.abs(halfAxis.vector.magnitude - expectedHalfMagnitude) < 1e-12,
	'Half travel must preserve the dead-zone-shaped magnitude.'
);
assert.ok(
	Math.abs(Math.hypot(halfAxis.vector.x, halfAxis.vector.y) - halfAxis.vector.magnitude) < 1e-12,
	'Vector length must equal its declared semantic magnitude.'
);

const diagonal = joystickVectorFromOffset(30, 40, 100, 0.1, 1);
assert.ok(
	Math.abs(Math.hypot(diagonal.vector.x, diagonal.vector.y) - diagonal.vector.magnitude) < 1e-12,
	'Diagonal travel must not receive a second radial attenuation.'
);
assert.ok(
	Math.abs(diagonal.vector.x / diagonal.vector.y - 0.75) < 1e-12,
	'Diagonal direction must preserve the original heading.'
);

const fullAxis = joystickVectorFromOffset(100, 0, 100);
const overAxis = joystickVectorFromOffset(250, 0, 100);
assert.equal(fullAxis.vector.magnitude, 1, 'Full travel must reach unit strength.');
assert.equal(overAxis.vector.magnitude, 1, 'Over travel must clamp to unit strength.');
assert.equal(overAxis.knob.x, 100, 'Knob geometry must remain clamped to its radius.');

const deadZone = joystickVectorFromOffset(10, 0, 100, 0.1, 1);
assert.deepEqual(deadZone.vector, zeroJoystickVector(), 'Dead-zone travel must remain neutral.');

const exponent = joystickVectorFromOffset(50, 0, 100, 0.1, 2);
assert.ok(
	Math.abs(exponent.vector.magnitude - Math.pow(4 / 9, 2)) < 1e-12,
	'Response exponents must shape strength without changing heading.'
);
assert.ok(
	Math.abs(Math.hypot(exponent.vector.x, exponent.vector.y) - exponent.vector.magnitude) < 1e-12,
	'Exponent-shaped vector length must remain truthful.'
);

const malformed = joystickVectorFromOffset(Number.NaN, Infinity, Number.NaN);
assert.deepEqual(malformed.vector, zeroJoystickVector(), 'Malformed numeric input must resolve safely.');
assert.ok(Number.isFinite(malformed.knob.x), 'Malformed knob x must remain finite.');
assert.ok(Number.isFinite(malformed.knob.y), 'Malformed knob y must remain finite.');

const firstNeutral = zeroJoystickVector();
const secondNeutral = zeroJoystickVector();
assert.notEqual(firstNeutral, secondNeutral, 'Neutral vectors must be fresh objects.');
assert.equal(joystickDirectionLabel({ x: 0, y: 0, magnitude: 0 }), 'centered');
assert.equal(joystickDirectionLabel({ x: 0.8, y: -0.8, magnitude: 1 }), 'up right');

console.log(JSON.stringify({
	BH: 'B"H',
	halfMagnitude: halfAxis.vector.magnitude,
	halfVectorLength: Math.hypot(halfAxis.vector.x, halfAxis.vector.y),
	diagonalMagnitude: diagonal.vector.magnitude,
	status: 'joystick-vector-truth-certified'
}, null, 2));
