// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file progressiveWebGlRenderer.test.mjs
 * @description Proves WebGL bootstrap capability exists internally while authored rich rendering is awaited before visible-world readiness.
 * The Awtsmoos lets a hidden first vessel test the device, then clothes it in richer radiance before gameplay may appear;
 * Awtsmoos.com turns renderer hydration from post-play decoration into a prerequisite the loading covenant must hear.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { ProgressiveWebGLRenderer } from '../../app/ProgressiveWebGLRenderer.js';

const APP_URL = new URL('../../app/', import.meta.url);
const source = file => readFile(new URL(file, APP_URL), 'utf8');

function createCanvasHarness() {
	const calls = [];
	const gl = {
		COLOR_BUFFER_BIT: 1, CULL_FACE: 4, DEPTH_BUFFER_BIT: 2, DEPTH_TEST: 3,
		clear: mask => calls.push(['clear', mask]),
		clearColor: (...values) => calls.push(['clearColor', ...values]),
		clearDepth: value => calls.push(['clearDepth', value]),
		disable: value => calls.push(['disable', value]),
		enable: value => calls.push(['enable', value]),
		viewport: (...values) => calls.push(['viewport', ...values])
	};
	return { calls, canvas: { getContext: () => gl, height: 0, width: 0 } };
}

test('progressive renderer creates WebGL and clears an internal capability scene', () => {
	const { calls, canvas } = createCanvasHarness();
	const renderer = new ProgressiveWebGLRenderer({ canvas });
	renderer.setSize(320, 180);
	renderer.setClearColor(0.1, 0.2, 0.3, 1);
	renderer.render({}, {});
	assert.equal(renderer.backend, 'webgl');
	assert.equal(renderer.stats.phase, 'colored-bootstrap');
	assert.ok(calls.some(call => call[0] === 'clear'));
});

test('world foundation awaits authored visual gate before visible-world readiness', async () => {
	const foundation = await source('EretzWorldFoundation.js');
	const hydrate = foundation.indexOf('await visualModule.prepareEretzEssentialVisuals');
	const ready = foundation.indexOf('markVisibleWorldReady(options)');
	assert.ok(hydrate >= 0);
	assert.ok(ready > hydrate);
	assert.match(foundation, /EretzEssentialVisualGate\.js/);
});
