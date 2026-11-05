//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file remoteMaterialProvenance.test.mjs
 * @description Proves HTTP(S) origin is mandatory, including safe acceptance of temporary blob transport only after verified remote provenance is attached.
 * The Awtsmoos is beyond path and transport while Awtsmoos.com distinguishes distant origin from a local disguise;
 * direct HTTP and stamped remote blobs may reveal, while local, data, canvas, and unstamped blob images remain outside.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { rememberPublicMaterialImage } from '../../assets/PublicMaterialCacheState.js';
import {
	isRealMaterialImage,
	materialHasRealMap
} from '../../assets/RemoteMaterialImageValidity.js';

const remoteUrl = 'https://materials.test/verified.png';

test('direct HTTP decoded image qualifies while local and data images do not', () => {
	assert.equal(isRealMaterialImage(image(remoteUrl)), true);
	assert.equal(isRealMaterialImage(image('/local.png')), false);
	assert.equal(isRealMaterialImage(image('data:image/png;base64,AA==')), false);
});

test('unstamped blob is rejected but verified remote blob transport qualifies', () => {
	const blob = image('blob:https://awtsmoos.com/object-id');
	assert.equal(isRealMaterialImage(blob), false);
	rememberPublicMaterialImage([remoteUrl], blob);
	assert.equal(isRealMaterialImage(blob), true);
	assert.equal(materialHasRealMap({ mapImage: blob }), true);
});

test('remote provenance can qualify decoded bitmap objects with no src', () => {
	const bitmap = { complete: true, height: 64, width: 64 };
	assert.equal(isRealMaterialImage(bitmap), false);
	rememberPublicMaterialImage([remoteUrl], bitmap);
	assert.equal(isRealMaterialImage(bitmap), true);
});

test('canvas-like and DataTexture-like sources never qualify', () => {
	const canvas = image(remoteUrl);
	canvas.tagName = 'CANVAS';
	assert.equal(isRealMaterialImage(canvas), false);
	assert.equal(materialHasRealMap({ map: { image: image(remoteUrl), isDataTexture: true } }), false);
});

function image(src) {
	return { complete: true, dataset: {}, naturalHeight: 64, naturalWidth: 64, src };
}
