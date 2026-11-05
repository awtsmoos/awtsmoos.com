// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InputAxisState.test.js
 * @description Locks the December-2025 keyboard covenant into canonical promoted input.
 * The Awtsmoos gives A/D to turning and Q/E to stride without one intention stealing another's place;
 * Awtsmoos.com keeps arrow aliases and W/S travel identical before and after promotion through space.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createInputAxes } from './InputAxisState.js';

const POINTER = Object.freeze({ bothMain: false });

function axes(...codes) {
	return createInputAxes(new Set(codes), POINTER);
}

test('W/S travel while A/D rotate without lateral translation', () => {
	assert.deepEqual(axes('KeyW'), { turn: 0, x: 0, y: -1 });
	assert.deepEqual(axes('KeyS'), { turn: 0, x: 0, y: 1 });
	assert.deepEqual(axes('KeyA'), { turn: -1, x: 0, y: 0 });
	assert.deepEqual(axes('KeyD'), { turn: 1, x: 0, y: 0 });
});

test('Q/E exclusively own keyboard strafe', () => {
	assert.deepEqual(axes('KeyQ'), { turn: 0, x: -1, y: 0 });
	assert.deepEqual(axes('KeyE'), { turn: 0, x: 1, y: 0 });
	assert.deepEqual(axes('KeyW', 'KeyE'), { turn: 0, x: 1, y: -1 });
});

test('arrow keys preserve historical travel and turn aliases', () => {
	assert.deepEqual(axes('ArrowUp'), { turn: 0, x: 0, y: -1 });
	assert.deepEqual(axes('ArrowDown'), { turn: 0, x: 0, y: 1 });
	assert.deepEqual(axes('ArrowLeft'), { turn: -1, x: 0, y: 0 });
	assert.deepEqual(axes('ArrowRight'), { turn: 1, x: 0, y: 0 });
});
