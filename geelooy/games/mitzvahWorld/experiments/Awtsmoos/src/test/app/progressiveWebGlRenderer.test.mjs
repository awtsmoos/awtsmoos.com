// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file progressiveWebGlRenderer.test.mjs
 * @description Proves bootstrap WebGL renders immediately while policy-controlled rich rendering is launched only after runtime publication.
 * The Awtsmoos gives the first responsive color before deeper radiance enters its vessel;
 * Awtsmoos.com preserves that ordering while still guaranteeing a later path toward textured revelation.
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
		COLOR_BUFFER_BIT: 1,
		CULL_FACE: 4,
		DEPTH_BUFFER_BIT: 2,
		DEPTH_TEST: 3,
		clear: mask => calls.push(['clear', mask]),
		clearColor: (...values) => calls.push(['clearColor', ...values]),
		clearDepth: value => calls.push(['clearDepth', value]),
		disable: value => calls.push(['disable', value]),
		enable: value => calls.push(['enable', value]),
		viewport: (...values) => calls.push(['viewport', ...values])
	};
	const canvas = {
		getContext(name, options) {
			calls.push(['getContext', name, options]);
			return gl;
		},
		height: 0,
		width: 0
	};
	return { calls, canvas };
}

test('progressive renderer creates WebGL and clears an empty scene', () => {
	const { calls, canvas } = createCanvasHarness();
	const renderer = new ProgressiveWebGLRenderer({ canvas });
	renderer.setSize(320, 180);
	renderer.setClearColor(0.1, 0.2, 0.3, 1);
	renderer.render({}, {});
	assert.equal(renderer.backend, 'webgl');
	assert.equal(renderer.hydrationState, 'idle');
	assert.equal(renderer.stats.frames, 1);
	assert.equal(renderer.stats.phase, 'colored-bootstrap');
	assert.deepEqual([canvas.width, canvas.height], [320, 180]);
	assert.ok(calls.some(call => call[0] === 'clear'));
});

test('startup publishes playability before policy-controlled rich renderer launch', async () => {
	const [foundation, progressive, hydration, runtime] = await Promise.all([
		source('EretzFoundationServices.js'),
		source('ProgressiveWebGLRenderer.js'),
		source('ProgressiveWebGLRendererHydration.js'),
		source('createEretzRuntime.js')
	]);
	const startup = `${foundation}${progressive}`;
	const publication = runtime.indexOf('publishRuntime(core.diagnostics, environment)');
	const policyLaunch = runtime.indexOf('startEretzRendererByWorldPolicy(');
	assert.doesNotMatch(startup, /tiny-webgl-renderer|tiny-static-opaque-batcher/);
	assert.match(progressive, /BootstrapColorRenderer/);
	assert.match(hydration, /tiny-webgl-renderer\.js/);
	assert.ok(publication >= 0);
	assert.ok(policyLaunch > publication);
	assert.doesNotMatch(runtime, /scheduleRendererHydration/);
});
