// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file uiEventControlScheme.test.mjs
 * @description Proves only A and D reverse while every neighboring input vessel remains stable.
 * The Awtsmoos renews direction with exact boundaries; Awtsmoos.com changes the requested keys
 * without allowing arrows, strafing, or forward motion to drift into a second hidden reversal.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { UiEventSystem } from '../../input/UiEventSystem.js';

function axisFor(code) {
	const input = new UiEventSystem({});
	input.keys = new Set([code]);
	return input.axis();
}

test('A and D use the requested reversed turn polarity', () => {
	assert.deepEqual(axisFor('KeyA'), { turn: 1, x: 0, y: 0 });
	assert.deepEqual(axisFor('KeyD'), { turn: -1, x: 0, y: 0 });
});

test('arrow turning remains unchanged', () => {
	assert.deepEqual(axisFor('ArrowLeft'), { turn: -1, x: 0, y: 0 });
	assert.deepEqual(axisFor('ArrowRight'), { turn: 1, x: 0, y: 0 });
});

test('Q E strafing and W S movement remain unchanged', () => {
	assert.deepEqual(axisFor('KeyQ'), { turn: 0, x: -1, y: 0 });
	assert.deepEqual(axisFor('KeyE'), { turn: 0, x: 1, y: 0 });
	assert.deepEqual(axisFor('KeyW'), { turn: 0, x: 0, y: -1 });
	assert.deepEqual(axisFor('KeyS'), { turn: 0, x: 0, y: 1 });
});
