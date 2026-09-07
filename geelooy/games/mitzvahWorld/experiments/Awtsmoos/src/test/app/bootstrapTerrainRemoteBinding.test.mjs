// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bootstrapTerrainRemoteBinding.test.mjs
 * @description Proves genuine decoded grass crosses generated/source chunk boundaries without allowing generated pixels or unverified records onto terrain.
 * The Awtsmoos lets a remote ImageBitmap lose local WeakMap identity without losing its truthful catalog origin;
 * Awtsmoos.com requires successful HTTP(S) record evidence and decoded non-generated shape before the visible grass field may be clothed.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	bindBootstrapTerrainRecord,
	bindBootstrapTerrainRole
} from '../../app/BootstrapTerrainRemoteBinding.js';

const GRASS_URL = 'https://awtsmoos.com/drive/file/grass-4';

function remoteImage(url = GRASS_URL) {
	return {
		complete: true,
		dataset: { publicUrl: url },
		height: 256,
		width: 256
	};
}

function imageBitmapShape() {
	return {
		constructor: { name: 'ImageBitmap' },
		height: 1254,
		width: 1254
	};
}

function fixture() {
	const generated = {
		dataset: { generatedTexture: 'true' },
		height: 128,
		width: 128
	};
	const material = {
		color: [0.4, 0.6, 0.3, 1],
		map: generated,
		mapImage: generated,
		texturePolicy: { realMapImage: false, remoteOnly: true }
	};
	return { generated, group: { children: [{ material }] }, material };
}

test('B"H preferred remote record replaces the generated fallback when decoded image is present', () => {
	const { generated, group, material } = fixture();
	const image = remoteImage();
	assert.equal(bindBootstrapTerrainRecord(group, { image, ok: true, url: GRASS_URL }, GRASS_URL), true);
	assert.notEqual(material.mapImage, generated);
	assert.equal(material.mapImage, image);
	assert.equal(material.textureUrl, GRASS_URL);
	assert.equal(material.texturePolicy.realMapImage, true);
});

test('B"H nonpreferred or unsuccessful records cannot dress the field', () => {
	const { generated, group, material } = fixture();
	assert.equal(bindBootstrapTerrainRecord(group, {
		image: remoteImage('https://awtsmoos.com/drive/file/cobble'),
		ok: true,
		url: 'https://awtsmoos.com/drive/file/cobble'
	}, GRASS_URL), false);
	assert.equal(bindBootstrapTerrainRole(group, {
		images: { grassFour: remoteImage() },
		records: { grassFour: { ok: false, url: GRASS_URL } }
	}), false);
	assert.equal(material.mapImage, generated);
});

test('B"H cross-chunk ImageBitmap binds from successful HTTPS record without local provenance marker', () => {
	const { group, material } = fixture();
	const image = imageBitmapShape();
	const bound = bindBootstrapTerrainRole(group, {
		images: { grassFour: image },
		records: { grassFour: { ok: true, url: GRASS_URL } }
	});
	assert.equal(bound, true);
	assert.equal(material.textureUrl, GRASS_URL);
	assert.equal(material.mapImage, image);
	assert.equal(material.texturePolicy.realMapImage, true);
	assert.equal(material.texturePolicy.remoteOnly, true);
});

test('B"H generated canvas-shaped image remains rejected even with remote URL text', () => {
	const { generated, group, material } = fixture();
	const canvas = { constructor: { name: 'HTMLCanvasElement' }, height: 256, tagName: 'CANVAS', width: 256 };
	assert.equal(bindBootstrapTerrainRole(group, {
		images: { grassFour: canvas },
		records: { grassFour: { ok: true, url: GRASS_URL } }
	}), false);
	assert.equal(material.mapImage, generated);
});
