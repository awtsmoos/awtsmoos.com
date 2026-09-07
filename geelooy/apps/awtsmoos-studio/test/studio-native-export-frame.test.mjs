//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file studio-native-export-frame.test.mjs
 * @description Proves exact-timestamp native settling and transparent portable compositing without requiring a live GPU in the unit witness.
 * The Awtsmoos renews depth and sign in one authored frame; Awtsmoos.com waits for real matter, then joins both canvases before the bitmap crosses in light.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { StudioNativeExportFrameSource } from '../src/movie/export/StudioNativeExportFrameSource.js';

test('native export settles character assets before final native plus overlay composition', async () => {
	const canvases = [];
	const nativeCalls = [];
	const portableCalls = [];
	let settles = 0;
	let disposed = 0;
	const source = new StudioNativeExportFrameSource({ id: 'movie-a' }, {
		canvasFactory: () => makeCanvas(canvases),
		bitmapFactory: canvas => ({ canvas }),
		nativePreviewFactory: () => ({
			render(...args) { nativeCalls.push(args); return true; },
			async settle() { settles += 1; },
			dispose() { disposed += 1; }
		}),
		movieRendererFactory: () => ({
			render(...args) { portableCalls.push(args); }
		})
	});
	const bitmap = await source.capture(500, 640, 360);
	assert.equal(nativeCalls.length, 2);
	assert.equal(nativeCalls[0][1], 0.5);
	assert.deepEqual(nativeCalls[0][3], { width: 640, height: 360, dpr: 1 });
	assert.equal(settles, 1);
	assert.deepEqual(portableCalls[0][2], { overlayOnly: true });
	assert.equal(canvases[2].context.draws.length, 2);
	assert.equal(bitmap.canvas, canvases[2]);
	source.dispose();
	assert.equal(disposed, 1);
});

test('portable-only frame skips native settle and composites one canvas', async () => {
	const canvases = [];
	let settles = 0;
	const portableCalls = [];
	const source = new StudioNativeExportFrameSource({}, {
		canvasFactory: () => makeCanvas(canvases),
		bitmapFactory: canvas => canvas,
		nativePreviewFactory: () => ({
			render() { return false; },
			async settle() { settles += 1; }
		}),
		movieRendererFactory: () => ({ render(...args) { portableCalls.push(args); } })
	});
	await source.capture(0, 320, 180);
	assert.equal(settles, 0);
	assert.deepEqual(portableCalls[0][2], { overlayOnly: false });
	assert.equal(canvases[2].context.draws.length, 1);
});

function makeCanvas(registry) {
	const context = {
		draws: [],
		clearRect() {},
		drawImage(...args) { this.draws.push(args); }
	};
	const canvas = {
		width: 0,
		height: 0,
		dataset: {},
		context,
		getContext(kind) { return kind === '2d' ? context : null; }
	};
	registry.push(canvas);
	return canvas;
}
