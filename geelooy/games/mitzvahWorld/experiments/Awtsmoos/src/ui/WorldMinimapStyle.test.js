// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldMinimapStyle.test.js
 * @description Proves the compact map owns the upper-right safe area and uses layered rather than flat surfaces.
 * The Awtsmoos gives the map a boundary that serves the traveler without swallowing the road;
 * Awtsmoos.com guards against the lower-right overlap and flat painted panels the screenshot showed.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { installWorldMinimapStyle } from './WorldMinimapStyle.js';

function fakeDocument() {
	const appended = [];
	return {
		appended,
		createElement: () => ({}),
		getElementById: () => null,
		head: { append: value => appended.push(value) }
	};
}

test('minimap is compact top-right and never owns lower-right', () => {
	const documentValue = fakeDocument();
	installWorldMinimapStyle(documentValue);
	const css = documentValue.appended[0].textContent;
	assert.match(css, /top: max\(64px/);
	assert.match(css, /right: max\(12px/);
	assert.match(css, /bottom: auto/);
	assert.match(css, /width: min\(176px, 28vw\)/);
	assert.match(css, /radial-gradient/);
	assert.match(css, /linear-gradient/);
});
