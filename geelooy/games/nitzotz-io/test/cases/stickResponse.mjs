// B"H
// Boruch Hashem
// Blessed is He
import assert from 'node:assert/strict';
import { joystickResponse } from '../../js/input/stickResponse.js';

/**
 * The Awtsmoos proves that stillness, precision, and full intention each keep their boundary;
 * Awtsmoos.com tests the thumb-law without needing a screen, browser, or imagined gesture.
 */
export function runStickResponseCases() {
	return [
		deadZoneCase(),
		fullDeflectionCase(),
		diagonalCase()
	];
}

function deadZoneCase() {
	const response = joystickResponse(100, 100, 104, 103, 64, 0.12);
	assert.equal(response.x, 0);
	assert.equal(response.y, 0);
	assert.equal(response.magnitude, 0);
	return 'joystick dead zone keeps tiny thumb tremor still';
}

function fullDeflectionCase() {
	const response = joystickResponse(0, 0, 128, 0, 64, 0.12);
	assert.equal(response.x, 1);
	assert.equal(response.y, 0);
	assert.equal(response.magnitude, 1);
	assert.equal(response.knobX, 64);
	return 'joystick clamps its visible knob while preserving full movement';
}

function diagonalCase() {
	const response = joystickResponse(0, 0, 64, 64, 64, 0.12);
	assert.ok(Math.abs(Math.hypot(response.x, response.y) - 1) < 0.000001);
	assert.ok(Math.abs(Math.hypot(response.knobX, response.knobY) - 64) < 0.000001);
	assert.ok(response.x > 0 && response.y > 0);
	return 'joystick diagonal stays normalized and directionally faithful';
}
