// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file skinGpuUploadReuse.test.mjs
 * @description Proves one authored skeleton does not resend the same GPU palette for every visible mesh garment.
 * The Awtsmoos animates one Chossid through many primitives; Awtsmoos.com counts one truthful palette upload,
 * then records reuse until frame or palette revision changes require a genuinely new GPU binding.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { bindSkin } from '../../../../light-three-gltf/tiny-render-skin.js';

test('uniform skin palette uploads once per frame/program/skeleton revision', () => {
	let uniformUploads = 0;
	const renderer = rendererFixture('uniform', {
		uniformMatrix4fv() { uniformUploads += 1; }
	});
	const skeleton = skeletonFixture();
	const mesh = { matrixWorld: new Float32Array(16), skeleton };
	bindSkin(renderer, { jointMatrices: {} }, mesh);
	bindSkin(renderer, { jointMatrices: {} }, mesh);
	assert.equal(uniformUploads, 1);
	assert.equal(renderer.stats.skinGpuUploads, 1);
	assert.equal(renderer.stats.skinGpuUploadReuses, 1);
	renderer.frameToken += 1;
	bindSkin(renderer, { jointMatrices: {} }, mesh);
	assert.equal(uniformUploads, 2);
	assert.equal(renderer.stats.skinGpuUploads, 2);
});

test('texture skin palette remains resident until skeleton revision changes', () => {
	let textureUploads = 0;
	const renderer = rendererFixture('texture', {
		activeTexture() {}, bindTexture() {}, pixelStorei() {}, texParameteri() {},
		texImage2D() { textureUploads += 1; }, uniform1f() {}, uniform1i() {}
	});
	const skeleton = skeletonFixture();
	const mesh = { matrixWorld: new Float32Array(16), skeleton };
	const locations = { jointTexture: {}, jointTextureHeight: {} };
	bindSkin(renderer, locations, mesh);
	bindSkin(renderer, locations, mesh);
	assert.equal(textureUploads, 1);
	skeleton.paletteRevision += 1;
	bindSkin(renderer, locations, mesh);
	assert.equal(textureUploads, 2);
	assert.equal(renderer.stats.skinGpuUploadReuses, 1);
});

function rendererFixture(jointMode, glMethods) {
	return {
		activeProgram: {}, errors: [], frameToken: 1,
		gl: {
			TEXTURE0: 0, TEXTURE_2D: 3553, UNPACK_ALIGNMENT: 3317,
			TEXTURE_MIN_FILTER: 10241, TEXTURE_MAG_FILTER: 10240,
			TEXTURE_WRAP_S: 10242, TEXTURE_WRAP_T: 10243,
			NEAREST: 9728, CLAMP_TO_EDGE: 33071, RGBA: 6408, FLOAT: 5126,
			...glMethods
		},
		identityMatrix: new Float32Array(16), jointMode,
		maxUniformJoints: 96, skinTexture: {},
		stats: {
			jointsUploaded: 0, skinGpuUploadReuses: 0, skinGpuUploads: 0,
			skinPaletteRecomputes: 0, skinPaletteReuses: 0,
			skinTextureUploads: 0, skinUniformUploads: 0, skinnedMeshes: 0
		}
	};
}

function skeletonFixture() {
	return {
		jointCount: 2, jointMatrices: new Float32Array(32),
		lastPaletteRecomputed: false, paletteRevision: 1,
		updateCached() { return 0; }
	};
}
