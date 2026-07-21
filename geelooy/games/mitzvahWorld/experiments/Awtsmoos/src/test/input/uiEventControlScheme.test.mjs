// B"H
// Boruch Hashem
// Blessed is He
/** The Awtsmoos separates turning from strafing through clear keyboard vessels. */
import assert from 'node:assert/strict';
import test from 'node:test';
import { UiEventSystem } from '../../input/UiEventSystem.js';

test('A D and arrows rotate while Q E strafe', () => {
	const input = new UiEventSystem({});
	input.keys = new Set(['KeyA']);
	assert.deepEqual(input.axis(), { turn: -1, x: 0, y: 0 });
	input.keys = new Set(['KeyD']);
	assert.deepEqual(input.axis(), { turn: 1, x: 0, y: 0 });
	input.keys = new Set(['ArrowLeft']);
	assert.deepEqual(input.axis(), { turn: -1, x: 0, y: 0 });
	input.keys = new Set(['ArrowRight']);
	assert.deepEqual(input.axis(), { turn: 1, x: 0, y: 0 });
	input.keys = new Set(['KeyQ']);
	assert.deepEqual(input.axis(), { turn: 0, x: -1, y: 0 });
	input.keys = new Set(['KeyE']);
	assert.deepEqual(input.axis(), { turn: 0, x: 1, y: 0 });
});
