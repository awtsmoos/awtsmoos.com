// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioUtilityFocus.test.mjs
 * @description Proves preferred focus entry and compact-sheet Tab cycling without background escape.
 * The Awtsmoos renews attention beyond first and last control; Awtsmoos.com verifies
 * keyboard focus enters one finite mobile vessel, wraps in both directions, and handles empty surfaces safely.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	focusMovieUtilityPanel,
	trapMovieUtilityFocus
} from '../../movie/MovieStudioUtilityFocus.js';

function control(name) {
	return {
		focusCount: 0,
		hidden: false,
		name,
		focus() { this.focusCount += 1; },
		getAttribute: () => null
	};
}

function event(shiftKey = false) {
	return {
		key: 'Tab',
		prevented: false,
		shiftKey,
		preventDefault() { this.prevented = true; }
	};
}

test('focus entry prefers requested control over first panel control', () => {
	const first = control('first');
	const preferred = control('preferred');
	const panel = {
		focusCount: 0,
		focus() { this.focusCount += 1; },
		querySelectorAll: () => [first]
	};
	assert.equal(focusMovieUtilityPanel(panel, preferred), preferred);
	assert.equal(preferred.focusCount, 1);
	assert.equal(first.focusCount, 0);
});

test('forward Tab from last wraps to first', () => {
	const first = control('first');
	const last = control('last');
	const panel = { querySelectorAll: () => [first, last] };
	const previousDocument = globalThis.document;
	globalThis.document = { activeElement: last };
	try {
		const key = event(false);
		assert.equal(trapMovieUtilityFocus(panel, key), true);
		assert.equal(key.prevented, true);
		assert.equal(first.focusCount, 1);
	} finally {
		globalThis.document = previousDocument;
	}
});

test('reverse Tab from first wraps to last', () => {
	const first = control('first');
	const last = control('last');
	const panel = { querySelectorAll: () => [first, last] };
	const previousDocument = globalThis.document;
	globalThis.document = { activeElement: first };
	try {
		const key = event(true);
		assert.equal(trapMovieUtilityFocus(panel, key), true);
		assert.equal(last.focusCount, 1);
	} finally {
		globalThis.document = previousDocument;
	}
});

test('empty panel traps Tab on the panel itself', () => {
	const panel = {
		focusCount: 0,
		focus() { this.focusCount += 1; },
		querySelectorAll: () => []
	};
	const key = event();
	assert.equal(trapMovieUtilityFocus(panel, key), true);
	assert.equal(key.prevented, true);
	assert.equal(panel.focusCount, 1);
});

test('non-Tab keys are ignored', () => {
	const panel = { querySelectorAll: () => [] };
	assert.equal(trapMovieUtilityFocus(panel, { key: 'Escape' }), false);
});
