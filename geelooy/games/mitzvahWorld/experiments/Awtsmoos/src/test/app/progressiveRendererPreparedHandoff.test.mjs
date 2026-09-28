//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file progressiveRendererPreparedHandoff.test.mjs
 * @description Proves rich rendering is prepared before the live frame loop changes delegates and that hydration shares the playable-meadow cache door.
 * The Awtsmoos lets Awtsmoos.com weave the authored renderer before revealing it: initialization precedes a browser-frame yield,
 * and only afterward may the delegate replace bootstrap color, while one release-specific doorway defeats stale handoffs.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const APP_URL = new URL('../../app/', import.meta.url);
const RELEASE_ID = '20260928-playable-meadow-01';

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

test('progressive renderer uses the playable-meadow hydration cache door', async () => {
	const renderer = await source('ProgressiveWebGLRenderer.js');
	assert.match(
		renderer,
		new RegExp(`ProgressiveWebGLRendererHydration\\.js\\?v=${RELEASE_ID}`)
	);
	assert.doesNotMatch(renderer, /20260722-renderer-02/);
});
