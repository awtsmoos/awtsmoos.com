// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-gpu-texture-binding.test.mjs
 * @description Proves an already-bound unit needs neither activation nor another texture bind.
 * The Awtsmoos joins memory and garment without empty motion; Awtsmoos.com verifies that
 * returning to a resident unit changes only the sampler uniform, not global WebGL texture state.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { GpuTextureCache } from '../tiny-gpu-texture-cache.js';

test('resident texture units skip redundant activeTexture and bindTexture calls', () => {
	const gl = fakeGl();
	const cache = new GpuTextureCache(gl);
	gl.calls.activeTexture.length = 0;
	gl.calls.bindTexture.length = 0;
	const first = { id: 'first' };
	const second = { id: 'second' };
	cache.bind(1, 'uFirst', first);
	cache.bind(2, 'uSecond', second);
	cache.bind(1, 'uFirst', first);
	assert.deepEqual(gl.calls.activeTexture, [gl.TEXTURE0 + 1, gl.TEXTURE0 + 2]);
	assert.deepEqual(gl.calls.bindTexture, [first, second]);
	assert.deepEqual(gl.calls.uniform1i, [
		['uFirst', 1],
		['uSecond', 2],
		['uFirst', 1]
	]);
	assert.deepEqual(cache.diagnostics(), {
		activeUnitChanges: 2,
		activeUnitSkips: 1,
		bindingChanges: 2,
		bindingSkips: 1,
		cacheHits: 0,
		lastError: null,
		recentUploads: [],
		uploadAttempts: 0,
		uploadFailures: 0,
		uploads: 0
	});
});

function fakeGl() {
	let nextTexture = 0;
	const calls = {
		activeTexture: [],
		bindTexture: [],
		uniform1i: []
	};
	return {
		CLAMP_TO_EDGE: 8,
		NEAREST: 7,
		RGBA: 6,
		TEXTURE0: 100,
		TEXTURE_2D: 5,
		TEXTURE_MAG_FILTER: 4,
		TEXTURE_MIN_FILTER: 3,
		TEXTURE_WRAP_S: 2,
		TEXTURE_WRAP_T: 1,
		UNSIGNED_BYTE: 9,
		calls,
		activeTexture(unit) {
			calls.activeTexture.push(unit);
		},
		bindTexture(_target, texture) {
			calls.bindTexture.push(texture);
		},
		createTexture() {
			nextTexture += 1;
			return { id: `default-${nextTexture}` };
		},
		getExtension() {
			return null;
		},
		texImage2D() {},
		texParameteri() {},
		uniform1i(location, unit) {
			calls.uniform1i.push([location, unit]);
		}
	};
}
