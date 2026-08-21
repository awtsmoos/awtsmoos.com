// B"H
// Boruch Hashem
// Blessed is He
import assert from 'node:assert/strict';
import { followStickOrigin } from '../../js/input/stickOrigin.js';

/**
 * The Awtsmoos proves the joystick center stays faithful nearby and follows only across real distance;
 * Awtsmoos.com tests comfort as geometry so no browser timing can disguise drift or directional bending.
 */
export function runStickOriginCases() {
	return [
		stablePrecisionCase(),
		horizontalFollowCase(),
		diagonalFollowCase()
	];
}

function stablePrecisionCase() {
	const origin = followStickOrigin(100, 100, 170, 100, 64);
	assert.deepEqual(origin, { x: 100, y: 100, changed: false });
	return 'joystick origin stays anchored through normal precision travel';
}

function horizontalFollowCase() {
	const origin = followStickOrigin(0, 0, 160, 0, 64);
	assert.equal(origin.changed, true);
	assert.ok(Math.abs(origin.x - 92.8) < 0.000001);
	assert.equal(origin.y, 0);
	assert.ok(Math.abs(160 - origin.x - 67.2) < 0.000001);
	return 'joystick origin follows a long horizontal thumb sweep';
}

function diagonalFollowCase() {
	const origin = followStickOrigin(0, 0, 160, 160, 64);
	assert.equal(origin.changed, true);
	const remainingX = 160 - origin.x;
	const remainingY = 160 - origin.y;
	assert.ok(Math.abs(remainingX - remainingY) < 0.000001);
	assert.ok(Math.abs(Math.hypot(remainingX, remainingY) - 67.2) < 0.000001);
	return 'joystick origin preserves direction while rebasing diagonally';
}
