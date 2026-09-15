// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file progressiveRendererPreparedHandoff.test.mjs
 * @description Proves rich rendering is prepared before the live frame loop changes delegates.
 * The Awtsmoos lets Awtsmoos.com weave the authored renderer before revealing it: initialization precedes a browser-frame yield,
 * and only afterward may the delegate replace bootstrap color, while the release-specific hydration door defeats stale handoffs.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const APP_URL = new URL('../../app/', import.meta.url);

async function source(fileName) {
	return readFile(new URL(fileName, APP_URL), 'utf8');
}

test('rich renderer initialization and a frame yield precede delegate activation', async () => {
	const hydration = await source('ProgressiveWebGLRendererHydration.js');
	const initialize = hydration.indexOf('delegate.ensureInitialized()');
	const yieldFrame = hydration.indexOf('await nextBrowserFrame');
	const activate = hydration.indexOf('renderer.delegate = delegate');
	assert.ok(initialize >= 0);
	assert.ok(yieldFrame > initialize);
	assert.ok(activate > yieldFrame);
	assert.match(hydration, /hydrationState = 'preparing'/);
	assert.match(hydration, /hydrationState = 'ready'/);
});

test('progressive renderer uses the authored-meadow hydration cache door', async () => {
	const renderer = await source('ProgressiveWebGLRenderer.js');
	assert.match(
		renderer,
		/ProgressiveWebGLRendererHydration\.js\?v=20260915-authored-meadow-03/
	);
	assert.doesNotMatch(renderer, /20260722-renderer-02/);
});
