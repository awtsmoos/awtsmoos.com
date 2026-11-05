// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file moviePerformanceInput.test.mjs
 * @description Proves binding normalization, input references, jump edges, focus safety, and release.
 * The Awtsmoos gives every control an instant and boundary; Awtsmoos.com keeps
 * actor, camera, keyboard, editor, and interrupted focus from corrupting one another's rhyme.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createMoviePerformancePreferences } from '../../movie/MoviePerformanceConstants.js';
import { MoviePerformanceInputAdapter } from '../../movie/MoviePerformanceInputAdapter.js';
import { MoviePerformanceInputState } from '../../movie/MoviePerformanceInputState.js';
import { MoviePerformanceKeyboard } from '../../movie/MoviePerformanceKeyboard.js';


test('jump is one-shot while continuous diagonal intent remains normalized', () => {
	const input = new MoviePerformanceInputState();
	input.setIntent({ forward: 1, jump: true, run: true, strafe: 1 });
	assert.equal(input.snapshot().jump, true);
	assert.equal(input.consumeJump(), true);
	assert.equal(input.consumeJump(), false);
	assert.equal(input.snapshot().jump, false);
	assert.ok(Math.abs(Math.hypot(input.snapshot().forward, input.snapshot().strafe) - 1) < 0.000001);
});


test('reference adapter maps one intent to native keyboard or joystick axes', () => {
	const input = new MoviePerformanceInputState();
	input.setIntent({ forward: 1, strafe: 0.5, turn: -0.5 });
	const adapter = new MoviePerformanceInputAdapter(input, 'character');
	assert.equal(adapter.axis().forward > 0, true);
	assert.equal(adapter.axis().joystickForward, 0);
	adapter.setReference('camera');
	assert.equal(adapter.axis().forward, 0);
	assert.equal(adapter.axis().joystickForward > 0, true);
	assert.equal(adapter.axis().turn, -0.5);
});


test('keyboard supports arrows, ignores editors, prevents claimed scroll, and releases blur', () => {
	const input = new MoviePerformanceInputState();
	const environment = eventEnvironment();
	const preferences = createMoviePerformancePreferences();
	const keyboard = new MoviePerformanceKeyboard({
		active: () => true,
		bindings: () => preferences.bindings,
		environment,
		input
	});
	let prevented = 0;
	keyboard.onKeyDown(keyEvent('ArrowUp', false, () => { prevented += 1; }));
	assert.equal(input.snapshot().forward, 1);
	assert.equal(prevented, 1);
	keyboard.onKeyDown(keyEvent('KeyS', true, () => { prevented += 1; }));
	assert.equal(prevented, 1);
	keyboard.handleBlur();
	assert.equal(input.snapshot().forward, 0);
	assert.equal(input.snapshot().resetReason, 'blur');
	keyboard.destroy();
});

function keyEvent(code, editable, preventDefault) {
	return {
		code,
		preventDefault,
		repeat: false,
		target: {
			closest() {
				return editable ? {} : null;
			}
		}
	};
}

function eventEnvironment() {
	return {
		addEventListener() {},
		document: {
			addEventListener() {},
			hidden: false,
			removeEventListener() {}
		},
		removeEventListener() {}
	};
}
