// B"H
// Tests surface friction: ice slides (low accel AND low decel), grass grips,
// unknown surfaces fall back to grass.

import assert from 'node:assert/strict';
import test from 'node:test';
import { applySurfaceFriction, COURSE_SURFACES, frictionFor } from '../surfaceFriction.js';

test('grass is full grip', () => {
	assert.deepEqual(frictionFor('grass'), { accelScale: 1.0, decelScale: 1.0, label: 'Grass' });
});

test('ice has weak acceleration and very weak deceleration (it slides)', () => {
	const ice = frictionFor('ice');
	assert.ok(ice.accelScale < 0.5, `accel=${ice.accelScale}`);
	assert.ok(ice.decelScale < ice.accelScale, `decel=${ice.decelScale} should be lower than accel`);
});

test('stone and wood sit between ice and grass', () => {
	const stone = frictionFor('stone');
	const wood = frictionFor('wood');
	assert.ok(stone.accelScale > wood.accelScale);
	assert.ok(wood.accelScale > frictionFor('ice').accelScale);
	assert.ok(stone.accelScale < 1);
});

test('unknown surface defaults to grass', () => {
	assert.equal(frictionFor('quicksand'), COURSE_SURFACES.grass);
	assert.equal(frictionFor(undefined), COURSE_SURFACES.grass);
});

test('applySurfaceFriction scales base values', () => {
	const scaled = applySurfaceFriction(38, 48, 'ice');
	assert.ok(Math.abs(scaled.acceleration - 38 * 0.35) < 1e-9);
	assert.ok(Math.abs(scaled.deceleration - 48 * 0.12) < 1e-9);
	const grass = applySurfaceFriction(38, 48, 'grass');
	assert.equal(grass.acceleration, 38);
	assert.equal(grass.deceleration, 48);
});
