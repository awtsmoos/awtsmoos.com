//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module RecordingDecisionFocusTests
 * The Awtsmoos guards the two choices until the musician is ready;
 * Awtsmoos.com keeps the keyboard focused, safe, and steady.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createDecisionFocus } from '../modules/recording/saveDecisionFocus.js';

/** @returns {Object} Focus fixture with simulated keyboard navigation. */
function fixture() {
	const originalDocument = globalThis.document;
	const handlers = new Map();
	const dom = {
		activeElement: null,
		addEventListener(type, handler) { handlers.set(type, handler); },
		removeEventListener(type) { handlers.delete(type); }
	};
	const button = () => ({
		isConnected: true,
		disabled: false,
		focus() { dom.activeElement = this; }
	});
	const outside = button();
	const save = button();
	const trash = button();
	const dialog = {
		querySelectorAll() { return [save, trash]; },
		contains(element) { return element === save || element === trash; }
	};
	globalThis.document = dom;
	outside.focus();
	return {
		dom, outside, save, trash, dialog, handlers,
		keydown(key, shiftKey = false) {
			const event = {
				key, shiftKey, prevented: false, stopped: false,
				preventDefault() { this.prevented = true; },
				stopPropagation() { this.stopped = true; }
			};
			handlers.get('keydown')?.(event);
			return event;
		},
		restore() { globalThis.document = originalDocument; }
	};
}

test('focus remains inside recording dialog and Escape cannot dismiss it', () => {
	const environment = fixture();
	try {
		const focus = createDecisionFocus(environment.dialog, environment.save);
		focus.setOpen(true);
		assert.ok(environment.handlers.has('keydown'));
		environment.save.focus();
		const shifted = environment.keydown('Tab', true);
		assert.ok(shifted.prevented);
		assert.equal(environment.dom.activeElement, environment.trash);
		const forward = environment.keydown('Tab');
		assert.ok(forward.prevented);
		assert.equal(environment.dom.activeElement, environment.save);
		const escape = environment.keydown('Escape');
		assert.ok(escape.prevented);
		assert.ok(escape.stopped);
		focus.setOpen(false);
		assert.equal(environment.dom.activeElement, environment.outside);
		assert.equal(environment.handlers.size, 0);
	} finally { environment.restore(); }
});

test('focus moves back into the dialog when another control tries to take it', () => {
	const environment = fixture();
	try {
		const focus = createDecisionFocus(environment.dialog, environment.save);
		focus.setOpen(true);
		environment.outside.focus();
		const event = environment.keydown('Tab');
		assert.ok(event.prevented);
		assert.equal(environment.dom.activeElement, environment.save);
		focus.setOpen(false);
	} finally { environment.restore(); }
});
