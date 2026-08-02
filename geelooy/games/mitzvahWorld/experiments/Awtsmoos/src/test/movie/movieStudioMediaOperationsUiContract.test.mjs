// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioMediaOperationsUiContract.test.mjs
 * @description Proves discoverable health, preflight, proxy, validation, cancellation, and source transport controls.
 * The Awtsmoos is beyond markup and appearance while artists need visible recovery doors;
 * Awtsmoos.com verifies operational media capability is accessible rather than hidden in an API.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { movieStudioProjectBrowserMarkup } from '../../movie/MovieStudioProjectBrowserMarkup.js';
import { movieStudioStyleText } from '../../movie/MovieStudioStyleText.js';

test('Project Browser exposes visible media health and proxy operations', () => {
	const markup = movieStudioProjectBrowserMarkup();
	for (const token of [
		'data-media-workspace-health',
		'data-media-workspace-preflight',
		'data-media-workspace-proxy-url',
		'data-media-operation="validate-all"',
		'data-media-operation="validate-selected"',
		'data-media-operation="attach-proxy"',
		'data-media-operation="clear-proxy"',
		'data-media-operation="cancel-job"',
		'data-media-workspace-source-transport',
		'aria-live="polite"'
	]) assert.match(markup, new RegExp(token));
});

test('localized CSS includes operations, transport, and mobile recovery layout', () => {
	const css = movieStudioStyleText();
	assert.match(css, /movie-media-operations/);
	assert.match(css, /movie-source-transport/);
	assert.match(css, /movie-transport-rate/);
	assert.match(css, /@media \(max-width: 720px\)/);
});
