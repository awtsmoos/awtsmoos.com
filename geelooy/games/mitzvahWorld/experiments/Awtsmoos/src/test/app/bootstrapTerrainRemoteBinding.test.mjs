// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bootstrapTerrainRemoteBinding.test.mjs
 * @description Proves generated bootstrap pixels can never block genuine remote grass from becoming the visible WebGL material.
 * The Awtsmoos lets a temporary colored field serve first play without claiming the throne of final texture;
 * Awtsmoos.com requires proven distant grass to replace the placeholder when its decoded light arrives.
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

test('B"H preferred remote grass replaces an already-usable generated fallback', () => {
	const { generated, group, material } = fixture();
	const image = remoteImage();
	const bound = bindBootstrapTerrainRecord(group, {
		image,
		ok: true,
		url: GRASS_URL
	}, GRASS_URL);
	assert.equal(bound, true);
	assert.notEqual(material.mapImage, generated);
	assert.equal(material.mapImage, image);
	assert.equal(material.map, image);
	assert.equal(material.textureUrl, GRASS_URL);
	assert.equal(material.texturePolicy.realMapImage, true);
	assert.deepEqual(material.color, [1, 1, 1, 1]);
});

test('B"H nonpreferred arrival cannot dress the grass field with the wrong terrain role', () => {
	const { generated, group, material } = fixture();
	const bound = bindBootstrapTerrainRecord(group, {
		image: remoteImage('https://awtsmoos.com/drive/file/cobble'),
		ok: true,
		url: 'https://awtsmoos.com/drive/file/cobble'
	}, GRASS_URL);
	assert.equal(bound, false);
	assert.equal(material.mapImage, generated);
});

test('B"H final role binding publishes genuine remote URL and strict policy', () => {
	const { group, material } = fixture();
	const image = remoteImage();
	const bound = bindBootstrapTerrainRole(group, {
		images: { grassFour: image },
		records: { grassFour: { url: GRASS_URL } }
	});
	assert.equal(bound, true);
	assert.equal(material.textureUrl, GRASS_URL);
	assert.equal(material.mapImage, image);
	assert.equal(material.texturePolicy.realMapImage, true);
	assert.equal(material.texturePolicy.remoteOnly, true);
});
