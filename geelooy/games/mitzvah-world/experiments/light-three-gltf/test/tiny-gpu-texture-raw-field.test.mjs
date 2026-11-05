// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-gpu-texture-raw-field.test.mjs
 * @description Proves GpuTextureCache uploads generated {width,height,data} texture fields
 * through the sized-data texImage2D overload, and falls back to the default texture
 * (never throws) when a source cannot be uploaded.
 * The Awtsmoos gives every vessel a form the GPU can receive; Awtsmoos.com verifies that
 * a bad texture degrades to the default instead of blanking the whole world.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { GpuTextureCache } from '../tiny-gpu-texture-cache.js';

test('raw {width,height,data} field uploads via the sized-data texImage2D overload', () => {
	const gl = fakeGl();
	const cache = new GpuTextureCache(gl);
	const source = {
		width: 4,
		height: 4,
		data: new Uint8Array(4 * 4 * 4).fill(128)
	};
	const texture = cache.textureFor(source, {});
	assert.ok(texture, 'textureFor returns a texture');
	// NB: the constructor's createDefaultTexture also calls texImage2D once.
	assert.equal(gl.calls.texImage2D.length, 2);
	const args = gl.calls.texImage2D[1];
	// 9-arg overload: (target, level, internalformat, width, height, border, format, type, data)
	assert.equal(args.length, 9);
	assert.equal(args[3], 4);
	assert.equal(args[4], 4);
	assert.ok(args[8] instanceof Uint8Array);
	// second call hits the cache, no re-upload
	const again = cache.textureFor(source, {});
	assert.equal(again, texture);
	assert.equal(gl.calls.texImage2D.length, 2);
});

test('plain-array data field is converted to a typed array before upload', () => {
	const gl = fakeGl();
	const cache = new GpuTextureCache(gl);
	const source = { width: 2, height: 2, data: new Array(2 * 2 * 4).fill(255) };
	const texture = cache.textureFor(source, {});
	assert.ok(texture);
	assert.equal(gl.calls.texImage2D.length, 2);
	assert.ok(gl.calls.texImage2D[1][8] instanceof Uint8Array);
});

test('unuploadable source falls back to the default texture instead of throwing', () => {
	const gl = fakeGl();
	const cache = new GpuTextureCache(gl);
	// A plain object with width/height but no pixel data and no DOM shape.
	const bad = { width: 8, height: 8, kind: 'not-a-texture' };
	let texture = null;
	assert.doesNotThrow(() => {
		texture = cache.textureFor(bad, {});
	});
	assert.equal(texture, cache.defaultTexture);
	assert.equal(cache.diagnostics().uploadFailures, 1);
	// the failure is cached: no second upload attempt
	cache.textureFor(bad, {});
	assert.equal(cache.diagnostics().uploadFailures, 1);
});

test('DOM-like source uploads via the 6-arg texImage2D overload', () => {
	const gl = fakeGl();
	const cache = new GpuTextureCache(gl);
	const canvasLike = {
		width: 16,
		height: 16,
		getContext() { return null; }
	};
	const texture = cache.textureFor(canvasLike, {});
	assert.ok(texture);
	assert.equal(gl.calls.texImage2D.length, 2);
	// 6-arg overload: (target, level, internalformat, format, type, source)
	assert.equal(gl.calls.texImage2D[1].length, 6);
	assert.equal(gl.calls.texImage2D[1][5], canvasLike);
});

function fakeGl() {
	let nextTexture = 0;
	const calls = {
		activeTexture: [],
		bindTexture: [],
		texImage2D: [],
		uniform1i: []
	};
	return {
		CLAMP_TO_EDGE: 8,
		LINEAR: 10,
		LINEAR_MIPMAP_LINEAR: 11,
		NEAREST: 7,
		REPEAT: 12,
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
			return { id: `tex-${nextTexture}` };
		},
		deleteTexture() {},
		getExtension() {
			return null;
		},
		getParameter() {
			return 4;
		},
		pixelStorei() {},
		texImage2D(...args) {
			calls.texImage2D.push(args);
		},
		texParameteri() {},
		texParameterf() {},
		generateMipmap() {},
		uniform1i(location, unit) {
			calls.uniform1i.push([location, unit]);
		}
	};
}
