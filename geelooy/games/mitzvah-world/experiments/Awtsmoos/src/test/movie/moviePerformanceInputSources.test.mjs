// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file moviePerformanceInputSources.test.mjs
 * @description Proves input sources merge independently and lifecycle reset remains globally authoritative.
 * The Awtsmoos joins many finite intentions without one erasing another; Awtsmoos.com
 * keeps keyboard, touch, gamepad, API, release, normalization, and destruction in truthful rhyme.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MoviePerformanceGamepad } from '../../movie/MoviePerformanceGamepad.js';
import { MoviePerformanceInputState } from '../../movie/MoviePerformanceInputState.js';

test('clearing one source preserves independent movement intent', () => {
	const input = new MoviePerformanceInputState();
	input.setIntent({ forward: 1, run: true }, 'keyboard');
	input.setIntent({ strafe: 0.5 }, 'touch');
	input.setIntent({ turn: -0.75 }, 'api');
	input.clearSource('touch', 'touch-release');
	assert.equal(input.snapshot().forward, 1);
	assert.equal(input.snapshot().run, true);
	assert.equal(input.snapshot().strafe, 0);
	assert.equal(input.snapshot().turn, -0.75);
	assert.equal(input.snapshot().resetReason, 'touch-release');
});

test('global reset clears every source and pending jump', () => {
	const input = new MoviePerformanceInputState();
	input.setIntent({ forward: 1, jump: true }, 'keyboard');
	input.setIntent({ run: true }, 'gamepad');
	input.reset('character-change');
	assert.equal(input.snapshot().forward, 0);
	assert.equal(input.snapshot().run, false);
	assert.equal(input.snapshot().jump, false);
	assert.equal(input.snapshot().resetReason, 'character-change');
});

test('disconnected gamepad never clears keyboard intent', () => {
	const input = new MoviePerformanceInputState();
	input.setIntent({ forward: 1 }, 'keyboard');
	const gamepad = new MoviePerformanceGamepad({
		active: () => true,
		environment: {
			navigator: {
				getGamepads: () => []
			}
		},
		input,
		onLook() {}
	});
	const result = gamepad.update();
	assert.deepEqual(result, { connected: false, reason: 'disconnected' });
	assert.equal(input.snapshot().forward, 1);
	assert.equal(input.snapshot().resetReason, null);
});

test('gamepad disconnect clears only its previously connected source', () => {
	const input = new MoviePerformanceInputState();
	input.setIntent({ strafe: 1 }, 'keyboard');
	let connected = true;
	const pad = {
		axes: [0, -1, 0, 0],
		buttons: Array.from({ length: 12 }, () => ({ pressed: false })),
		connected: true,
		id: 'test-pad',
		index: 0,
		mapping: 'standard'
	};
	const gamepad = new MoviePerformanceGamepad({
		active: () => true,
		environment: {
			navigator: {
				getGamepads: () => connected ? [pad] : []
			}
		},
		input,
		onLook() {}
	});
	gamepad.update();
	assert.equal(input.snapshot().forward > 0, true);
	assert.equal(input.snapshot().strafe > 0, true);
	connected = false;
	gamepad.update();
	assert.equal(input.snapshot().forward, 0);
	assert.equal(input.snapshot().strafe, 1);
	assert.equal(input.snapshot().resetReason, 'gamepad-disconnected');
});
