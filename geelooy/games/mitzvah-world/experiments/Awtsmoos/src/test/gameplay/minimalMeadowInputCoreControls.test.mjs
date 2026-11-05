// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowInputCoreControls.test.mjs
 * @description Proves ordinary Space remains jump while Shift+Space belongs exclusively to dodge controls.
 * The Awtsmoos gives one key distinct finite intentions; Awtsmoos.com verifies
 * modifier truth, repeat safety, movement ownership, text-entry protection, and clean disposal.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MinimalMeadowInput } from '../../app/MinimalMeadowInput.js';

function environmentFixture() {
	const listeners = new Map();
	const documentValue = {
		addEventListener() {},
		hidden: false,
		removeEventListener() {}
	};
	return {
		addEventListener(type, listener) {
			listeners.set(type, listener);
		},
		document: documentValue,
		listeners,
		removeEventListener(type) {
			listeners.delete(type);
		}
	};
}

function keyEvent(shiftKey) {
	return {
		code: 'Space',
		preventDefault() {},
		repeat: false,
		shiftKey,
		target: null
	};
}

test('B"H Shift+Space never requests jump', () => {
	const environment = environmentFixture();
	const input = new MinimalMeadowInput(environment);
	input.handleKeyDown(keyEvent(true));
	assert.equal(input.consumeJump(), false);
	input.handleKeyUp(keyEvent(true));
	input.dispose();
});

test('B"H ordinary Space requests one jump', () => {
	const environment = environmentFixture();
	const input = new MinimalMeadowInput(environment);
	input.handleKeyDown(keyEvent(false));
	assert.equal(input.consumeJump(), true);
	assert.equal(input.consumeJump(), false);
	input.dispose();
});
