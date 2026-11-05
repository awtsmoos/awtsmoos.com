//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file minimalMeadowMobileMovementMode.test.mjs
 * @description Proves mobile camera-relative movement through the current Bootstrap movement authority.
 * The Awtsmoos turns bounded intention into travel without reviving a vanished seam;
 * Awtsmoos.com tests the living controller itself, where joystick, camera, pace, and collision meet in one stream.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	advanceMobileMovementRuntime,
	createMobileMovementRuntime,
	mobileJoystickAxis
} from './MobileMovementRuntimeFixture.mjs';

test('camera-relative mobile cardinals match screen direction', () => {
	const right = createMobileMovementRuntime(mobileJoystickAxis(0, 1));
	const left = createMobileMovementRuntime(mobileJoystickAxis(0, -1));
	const forward = createMobileMovementRuntime(mobileJoystickAxis(1, 0));
	const backward = createMobileMovementRuntime(mobileJoystickAxis(-1, 0));

	[right, left, forward, backward].forEach((runtime) => {
		advanceMobileMovementRuntime(runtime);
	});

	assert.ok(right.state.x > 0);
	assert.ok(left.state.x < 0);
	assert.ok(forward.state.z < 0);
	assert.ok(backward.state.z > 0);
});

test('camera-relative diagonal remains bounded without speed inflation', () => {
	const cardinal = createMobileMovementRuntime(mobileJoystickAxis(0, 1));
	const diagonal = createMobileMovementRuntime(mobileJoystickAxis(1, 1));
	advanceMobileMovementRuntime(cardinal);
	advanceMobileMovementRuntime(diagonal);
	const cardinalTravel = Math.hypot(cardinal.state.x, cardinal.state.z);
	const diagonalTravel = Math.hypot(diagonal.state.x, diagonal.state.z);

	assert.ok(diagonal.state.x > 0);
	assert.ok(diagonal.state.z < 0);
	assert.ok(diagonalTravel <= cardinalTravel * 1.000001);
});

test('selected Run and Shift override change actual mobile travel mode', () => {
	const walking = createMobileMovementRuntime(mobileJoystickAxis(0, 1));
	const running = createMobileMovementRuntime(mobileJoystickAxis(0, 1), true, false);
	const shifted = createMobileMovementRuntime(mobileJoystickAxis(0, 1), false, true);
	const walkController = advanceMobileMovementRuntime(walking, 60);
	const runController = advanceMobileMovementRuntime(running, 60);
	const shiftController = advanceMobileMovementRuntime(shifted, 60);

	assert.ok(Math.abs(running.state.x) > Math.abs(walking.state.x) * 1.5);
	assert.equal(walkController.snapshot().selectedMode, 'walk');
	assert.equal(runController.snapshot().selectedMode, 'run');
	assert.equal(shiftController.snapshot().effectiveMode, 'run');
});
