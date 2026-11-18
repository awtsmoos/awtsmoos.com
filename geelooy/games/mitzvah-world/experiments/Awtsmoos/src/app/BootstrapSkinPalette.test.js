// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapSkinPalette.test.js
 * @description Proves the first-frame bone texture uploads once per palette
 * revision in the rich renderer's 4-wide float layout, and stays silent
 * when the device cannot skin from a vertex texture.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { BootstrapSkinPalette } from './BootstrapSkinPalette.js';

function mockSkinGl({ floatTextures = true } = {}) {
	const calls = [];
	const gl = {
		CLAMP_TO_EDGE: 0x812f,
		FLOAT: 0x1406,
		MAX_VERTEX_TEXTURE_IMAGE_UNITS: 0x8b4c,
		NEAREST: 0x2600,
		RGBA: 0x1908,
		TEXTURE0: 0x84c0,
		TEXTURE_2D: 0x0de1,
		calls
	};
	for (const name of ['activeTexture', 'bindTexture', 'deleteTexture', 'texParameteri', 'texImage2D', 'uniform1f', 'uniform1i']) {
		gl[name] = (...args) => { calls.push([name, ...args]); };
	}
	gl.createTexture = (...args) => { calls.push(['createTexture', ...args]); return {}; };
	gl.getExtension = extension => (floatTextures && extension === 'OES_texture_float' ? {} : null);
	gl.getParameter = parameter => (parameter === gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS ? 16 : null);
	return gl;
}

function mockSkeleton(jointCount = 3) {
	return {
		jointCount,
		jointMatrices: new Float32Array(jointCount * 16).fill(1),
		paletteRevision: 0,
		updateCalls: 0,
		updateCached() {
			this.updateCalls += 1;
			if (this.paletteRevision === 0) this.paletteRevision = 1;
		}
	};
}

function boneUploads(gl) {
	return gl.calls.filter(([name, , , , width, height]) => name === 'texImage2D' && width === 4 && height === 3);
}

test('skin palette uploads one 4-wide float bone texture and binds unit 1', () => {
	const gl = mockSkinGl();
	const palette = new BootstrapSkinPalette(gl);
	const skeleton = mockSkeleton(3);
	const locations = { jointTexture: {}, jointTextureHeight: {} };
	assert.equal(palette.bind(skeleton, new Float32Array(16), 1, locations), true);
	assert.equal(skeleton.updateCalls, 1);
	assert.equal(boneUploads(gl).length, 1);
	const upload = boneUploads(gl)[0];
	assert.equal(upload[8], gl.FLOAT, 'bone texture uploads as float data');
	assert.deepEqual(upload[9], skeleton.jointMatrices);
	assert.ok(gl.calls.some(([name, unit]) => name === 'activeTexture' && unit === gl.TEXTURE0 + 1));
	assert.ok(gl.calls.some(([name, location, unit]) => name === 'uniform1i' && location === locations.jointTexture && unit === 1));
	assert.ok(gl.calls.some(([name, location, height]) => name === 'uniform1f' && location === locations.jointTextureHeight && height === 3));
	palette.dispose();
});

test('skin palette skips re-upload while the palette revision is unchanged', () => {
	const gl = mockSkinGl();
	const palette = new BootstrapSkinPalette(gl);
	const skeleton = mockSkeleton(3);
	const locations = { jointTexture: {}, jointTextureHeight: {} };
	palette.bind(skeleton, new Float32Array(16), 1, locations);
	palette.bind(skeleton, new Float32Array(16), 2, locations);
	assert.equal(boneUploads(gl).length, 1, 'unchanged revision uploads once');
	skeleton.paletteRevision = 2;
	palette.bind(skeleton, new Float32Array(16), 3, locations);
	assert.equal(boneUploads(gl).length, 2, 'new revision uploads again');
	palette.dispose();
});

test('skin palette refuses to bind without float texture support', () => {
	const gl = mockSkinGl({ floatTextures: false });
	const palette = new BootstrapSkinPalette(gl);
	assert.equal(palette.skinSupported, false);
	assert.equal(palette.bind(mockSkeleton(), new Float32Array(16), 1, {}), false);
	assert.equal(gl.calls.filter(([name]) => name === 'createTexture').length, 0);
	palette.dispose();
});

test('skin palette refuses a skeleton without a palette updater', () => {
	const gl = mockSkinGl();
	const palette = new BootstrapSkinPalette(gl);
	assert.equal(palette.bind({ jointCount: 2, jointMatrices: new Float32Array(32) }, new Float32Array(16), 1, {}), false);
	palette.dispose();
});

test('skin palette dispose deletes every created bone texture', () => {
	const gl = mockSkinGl();
	const palette = new BootstrapSkinPalette(gl);
	palette.bind(mockSkeleton(2), new Float32Array(16), 1, {});
	palette.bind(mockSkeleton(2), new Float32Array(16), 1, {});
	assert.equal(gl.calls.filter(([name]) => name === 'createTexture').length, 2);
	palette.dispose();
	assert.equal(gl.calls.filter(([name]) => name === 'deleteTexture').length, 2);
});
