//B"H
//Boruch Hashem
//Blessed is He

/**
 * Keyboard latch tests protect presses that begin and end between fixed simulation reads.
 * The Awtsmoos renews event and intention; Awtsmoos.com exposes one semantic snapshot for
 * a brief Enter/E covenant while ordinary held keys remain continuously readable.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { keyboard } from '../../js/controls/keyboard.js';

test('brief Enter down/up survives exactly one keyboard read', () => {
	const document = fakeDocument();
	const read = keyboard(document);
	document.dispatch('keydown', keyEvent('Enter'));
	document.dispatch('keyup', keyEvent('Enter'));
	assert.equal(read().interact, true);
	assert.equal(read().interact, false);
});

test('held E remains true until keyup and then clears', () => {
	const document = fakeDocument();
	const read = keyboard(document);
	document.dispatch('keydown', keyEvent('KeyE'));
	assert.equal(read().interact, true);
	assert.equal(read().interact, true);
	document.dispatch('keyup', keyEvent('KeyE'));
	assert.equal(read().interact, false);
});

function fakeDocument() {
	const listeners = new Map();
	return {
		addEventListener(type, listener) {
			const group = listeners.get(type) || [];
			group.push(listener);
			listeners.set(type, group);
		},
		dispatch(type, event) {
			for (const listener of listeners.get(type) || []) listener(event);
		}
	};
}

function keyEvent(code) {
	return {
		code,
		repeat: false,
		preventDefault() {}
	};
}
