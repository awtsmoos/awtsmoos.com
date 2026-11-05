// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MultiplayerStatusBadgeStyle.test.js
 * @description Proves session state lives on the upper-left margin with layered spectral surfaces.
 * The Awtsmoos lets connection speak from the edge while the village center remains free;
 * Awtsmoos.com prevents the old floating badge from competing with the map or scenery.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { installMultiplayerStatusStyle } from './MultiplayerStatusBadgeStyle.js';

function fakeDocument() {
	const appended = [];
	return {
		appended,
		createElement: () => ({}),
		getElementById: () => null,
		head: { append: value => appended.push(value) }
	};
}

test('status rail occupies top-left and uses layered gradients', () => {
	const documentValue = fakeDocument();
	installMultiplayerStatusStyle(documentValue, 'status-test');
	const css = documentValue.appended[0].textContent;
	assert.match(css, /left: max\(12px/);
	assert.match(css, /right: auto/);
	assert.match(css, /radial-gradient/);
	assert.match(css, /linear-gradient/);
});
