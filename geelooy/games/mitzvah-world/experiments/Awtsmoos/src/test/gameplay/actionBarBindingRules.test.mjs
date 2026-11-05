// B"H
// Boruch Hashem
// Blessed is He

/** @file actionBarBindingRules.test.mjs @description Verifies edge-safe hotbar input mappings. */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	actionBarKeyLabel,
	gamepadActionSlot,
	keyboardActionSlot
} from '../../gameplay/actionbar/ActionBarBindingRules.js';

test('keyboard edges map 1 through equals and reject held or editing input', () => {
	assert.equal(keyboardActionSlot({ code: 'Digit1' }), 0);
	assert.equal(keyboardActionSlot({ code: 'Equal' }), 11);
	assert.equal(keyboardActionSlot({ code: 'Digit1', repeat: true }), null);
	assert.equal(keyboardActionSlot({ code: 'Digit1', target: { tagName: 'INPUT' } }), null);
	assert.equal(keyboardActionSlot({ code: 'Digit1', secondRow: true }), 0);
	assert.equal(keyboardActionSlot({ code: 'Digit1' }, { secondRow: true }), 12);
});

test('gamepad bindings resolve both rows without scanning action state', () => {
	assert.equal(gamepadActionSlot(0), 0);
	assert.equal(gamepadActionSlot(9), 11);
	assert.equal(gamepadActionSlot(0, { secondRow: true }), 12);
	assert.equal(gamepadActionSlot(99), null);
});

test('labels remain stable across both rows', () => {
	assert.equal(actionBarKeyLabel(0), '1');
	assert.equal(actionBarKeyLabel(11), '=');
	assert.equal(actionBarKeyLabel(12), '1');
	assert.equal(actionBarKeyLabel(24), '');
});
