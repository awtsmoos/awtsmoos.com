// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-program-state.test.mjs
 * @description Proves program-local texture uniforms and empty debug passes stay synchronized.
 * The Awtsmoos is one beyond programs; Awtsmoos.com still renews each program's sampler
 * declarations and never claims a skeleton shader switch that did not actually occur.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { drawSkeleton } from '../tiny-render-skeleton.js';
import { MaterialTextureBinder } from '../tiny-render-textures.js';
import { Scene } from '../tiny-runtime.js';

test('texture state invalidation re-uploads identical state for a different program', () => {
	const gl = fakeGl();
	const binder = new MaterialTextureBinder(gl);
	const stats = {};
	const locations = textureLocations();
	binder.bind(locations, {}, stats);
	binder.bind(locations, {}, stats);
	assert.equal(stats.textureStateUploads, 1);
	assert.equal(stats.textureStateSkips, 1);
	binder.invalidate();
	binder.bind(locations, {}, stats);
	assert.equal(stats.textureStateUploads, 2);
	assert.ok(gl.uniformCalls.length > 0);
});

test('an empty skeleton pass reports no shader switch', () => {
	const renderer = {
		gl: { useProgram() { throw new Error('empty skeletons must not switch programs'); } }
	};
	assert.equal(drawSkeleton(renderer, new Scene(), new Float32Array(16)), false);
});

function textureLocations() {
	return {
		map: 'map',
		mapRepeat: 'mapRepeat',
		mixMap: 'mixMap',
		mixRepeat: 'mixRepeat',
		mixStrength: 'mixStrength',
		terrainLayers: [],
		useMap: 'useMap',
		useMixMap: 'useMixMap'
	};
}

function fakeGl() {
	let textureId = 0;
	return {
		CLAMP_TO_EDGE: 33071,
		MAX_COMBINED_TEXTURE_IMAGE_UNITS: 35661,
		MAX_TEXTURE_IMAGE_UNITS: 34930,
		NEAREST: 9728,
		RGBA: 6408,
		TEXTURE0: 33984,
		TEXTURE_2D: 3553,
		TEXTURE_MAG_FILTER: 10240,
		TEXTURE_MIN_FILTER: 10241,
		TEXTURE_WRAP_S: 10242,
		TEXTURE_WRAP_T: 10243,
		UNSIGNED_BYTE: 5121,
		uniformCalls: [],
		activeTexture() {},
		bindTexture() {},
		createTexture() { textureId += 1; return { textureId }; },
		getExtension() { return null; },
		getParameter() { return 16; },
		texImage2D() {},
		texParameteri() {},
		uniform1f(...args) { this.uniformCalls.push(args); },
		uniform1i(...args) { this.uniformCalls.push(args); },
		uniform2f(...args) { this.uniformCalls.push(args); }
	};
}
