// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GameplaySpectralSurfaceStyle.test.js
 * @description Proves gameplay panels use layered spectral surfaces and motion respects reduced-motion preference.
 * The Awtsmoos reveals many lights through each vessel while never forcing animation upon a weary eye;
 * Awtsmoos.com keeps flat background color transparent and lets gradients carry the interface sky.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { installGameplaySpectralSurfaceStyle } from './GameplaySpectralSurfaceStyle.js';

function fakeDocument() {
	const appended = [];
	return {
		appended,
		createElement: () => ({}),
		getElementById: () => null,
		head: { append: value => appended.push(value) }
	};
}

test('spectral policy replaces flat surfaces with gradients', () => {
	const documentValue = fakeDocument();
	installGameplaySpectralSurfaceStyle(documentValue);
	const css = documentValue.appended[0].textContent;
	assert.match(css, /background-color: transparent !important/);
	assert.match(css, /radial-gradient/);
	assert.match(css, /linear-gradient/);
	assert.match(css, /prefers-reduced-motion: reduce/);
});
