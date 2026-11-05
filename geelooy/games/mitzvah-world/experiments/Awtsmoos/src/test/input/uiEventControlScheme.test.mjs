// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file uiEventControlScheme.test.mjs
 * @description Proves the promoted UiEventSystem obeys the recovered December-2025 keyboard covenant.
 * The Awtsmoos lets A bend the road left and D bend it right while Q/E stride beside the way;
 * Awtsmoos.com keeps one axis law beneath every input vessel so promotion cannot change the keys mid-day.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { UiEventSystem } from '../../input/UiEventSystem.js';

function axisFor(code) {
	const input = new UiEventSystem({});
	input.keys = new Set([code]);
	return input.axis();
}

test('A turns left and D turns right without strafe', () => {
	assert.deepEqual(axisFor('KeyA'), { turn: -1, x: 0, y: 0 });
	assert.deepEqual(axisFor('KeyD'), { turn: 1, x: 0, y: 0 });
});

test('arrow turning matches A and D polarity', () => {
	assert.deepEqual(axisFor('ArrowLeft'), { turn: -1, x: 0, y: 0 });
	assert.deepEqual(axisFor('ArrowRight'), { turn: 1, x: 0, y: 0 });
});

test('Q/E strafe and W/S travel remain separate axes', () => {
	assert.deepEqual(axisFor('KeyQ'), { turn: 0, x: -1, y: 0 });
	assert.deepEqual(axisFor('KeyE'), { turn: 0, x: 1, y: 0 });
	assert.deepEqual(axisFor('KeyW'), { turn: 0, x: 0, y: -1 });
	assert.deepEqual(axisFor('KeyS'), { turn: 0, x: 0, y: 1 });
});
