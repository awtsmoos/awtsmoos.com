// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file webGlStagedBoot.test.mjs
 * @description Proves startup prefers WebGL with a truthful Canvas2D fallback and cannot await a frame forever.
 * The Awtsmoos reveals light before landscape; Awtsmoos.com records the selected backend,
 * framebuffer, bounded scheduling, and the absence of every WebGPU doorway.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { paintEretzWebGlBootFrame } from '../../app/EretzWebGlBootFrame.js';
import { nextLaunchFrame } from '../../app/RuntimeLaunchProgress.js';

const APP_ROOT_URL = new URL('../../app/', import.meta.url);
const source = fileName => readFile(new URL(fileName, APP_ROOT_URL), 'utf8');

test('live staged startup uses the WebGL-first fallback renderer and no WebGPU selector', async () => {
	const [services, frame, staged, runtime] = await Promise.all([
		source('EretzFoundationServices.js'),
		source('EretzWebGlBootFrame.js'),
		source('EretzStagedRuntime.js'),
		source('createEretzRuntime.js')
	]);
	const startup = [services, frame, staged, runtime].join(String.fromCharCode(10));
	assert.match(services, /createMinimalMeadowRenderer/);
	assert.match(startup, /renderer\.gl/);
	assert.doesNotMatch(startup, /WebGPURenderer|navigator\.gpu|three\/webgpu/i);
	assert.doesNotMatch(runtime, /playable-runtime|PLAYABLE_BUNDLE_URL/);
});

test('WebGL boot frame clears the real framebuffer without shader compilation', () => {
	const calls = [];
	const gl = {
		COLOR_BUFFER_BIT: 1,
		DEPTH_BUFFER_BIT: 2,
		DEPTH_TEST: 3,
		clear: mask => calls.push(['clear', mask]),
		clearColor: (...value) => calls.push(['clearColor', ...value]),
		clearDepth: value => calls.push(['clearDepth', value]),
		enable: value => calls.push(['enable', value]),
		flush: () => calls.push(['flush']),
		isContextLost: () => false
	};
	const renderer = {
		canvas: { clientHeight: 50, clientWidth: 100 },
		clearColor: [0.1, 0.2, 0.3, 1],
		gl,
		setSize(width, height) {
			this.canvas.width = width;
			this.canvas.height = height;
		}
	};
	const services = { camera: {}, renderer };
	const receipt = paintEretzWebGlBootFrame(
		services,
		{ maxDpr: 1.5 },
		{ devicePixelRatio: 2, innerHeight: 50, innerWidth: 100 }
	);
	assert.equal(receipt.backend, 'webgl');
	assert.deepEqual(receipt.pixels, [150, 75]);
	assert.equal(services.camera.aspect, 2);
	assert.deepEqual(calls.at(-1), ['flush']);
	assert.ok(calls.some(call => call[0] === 'clear'));
});

test('launch-frame yield uses its timer when animation frames never fire', async () => {
	const callbacks = {};
	const environment = {
		clearTimeout(id) { callbacks.cleared = id; },
		requestAnimationFrame(callback) { callbacks.frame = callback; },
		setTimeout(callback, milliseconds) {
			callbacks.timer = callback;
			callbacks.milliseconds = milliseconds;
			return 17;
		}
	};
	const wait = nextLaunchFrame(environment, 32);
	assert.equal(callbacks.milliseconds, 32);
	callbacks.timer();
	await wait;
	assert.equal(callbacks.cleared, 17);
	callbacks.frame();
});
