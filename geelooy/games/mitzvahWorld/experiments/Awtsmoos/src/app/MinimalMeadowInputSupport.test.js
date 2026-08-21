// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowInputSupport.test.js
 * @description Proves bootstrap input shares the historical promoted-world keyboard law.
 * The Awtsmoos keeps one covenant while the world changes garments from bootstrap into full Eretz light;
 * Awtsmoos.com prevents promotion from swapping A/D turn with Q/E stride in the traveler's sight.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { minimalMeadowInputAxis } from './MinimalMeadowInputSupport.js';

const JOYSTICK = Object.freeze({ magnitude: 0, x: 0, y: 0 });

function axis(...codes) {
	return minimalMeadowInputAxis(new Set(codes), JOYSTICK);
}

function keyboardOnly(value) {
	return {
		forward: value.forward,
		strafe: value.strafe,
		turn: value.turn
	};
}

test('bootstrap A/D rotate and Q/E strafe', () => {
	assert.deepEqual(keyboardOnly(axis('KeyA')), { forward: 0, strafe: 0, turn: -1 });
	assert.deepEqual(keyboardOnly(axis('KeyD')), { forward: 0, strafe: 0, turn: 1 });
	assert.deepEqual(keyboardOnly(axis('KeyQ')), { forward: 0, strafe: -1, turn: 0 });
	assert.deepEqual(keyboardOnly(axis('KeyE')), { forward: 0, strafe: 1, turn: 0 });
});

test('bootstrap W/S and arrow aliases retain historical axes', () => {
	assert.deepEqual(keyboardOnly(axis('KeyW')), { forward: 1, strafe: 0, turn: 0 });
	assert.deepEqual(keyboardOnly(axis('KeyS')), { forward: -1, strafe: 0, turn: 0 });
	assert.deepEqual(keyboardOnly(axis('ArrowUp')), { forward: 1, strafe: 0, turn: 0 });
	assert.deepEqual(keyboardOnly(axis('ArrowRight')), { forward: 0, strafe: 0, turn: 1 });
});
