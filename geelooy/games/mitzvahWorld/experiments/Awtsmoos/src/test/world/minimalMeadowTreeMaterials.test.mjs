//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowTreeMaterials.test.mjs
 * @description Proves tree surfaces remain remote-pending without images and preserve genuine HTTP bark/leaf imagery without canvas conversion.
 * The Awtsmoos grows tree and leaf beyond painter and fallback while Awtsmoos.com keeps every botanical garment true;
 * absent pixels remain concealed, and distant authored alpha passes unchanged into the material view.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveMinimalMeadowTreeMaterials } from '../../app/MinimalMeadowTreeMaterialSources.js';

test('missing public images create no procedural fallback pixels', () => {
	const materials = resolveMinimalMeadowTreeMaterials({
		barkImage: null,
		leafImage: null,
		records: [{ ok: false }, { ok: false }]
	});
	assert.equal(materials.bark.mapImage, null);
	assert.equal(materials.leaf.mapImage, null);
	assert.equal(materials.bark.mapImageFallback, false);
	assert.equal(materials.leaf.mapImageFallback, false);
	assert.equal(materials.diagnostics.barkSource, 'remote-pending');
	assert.equal(materials.diagnostics.leafSource, 'remote-pending');
	assert.equal(materials.diagnostics.failedPublicRequests, 2);
	assert.equal(materials.diagnostics.remoteOnly, true);
	assert.match(materials.cacheKey, /pending-bark\|pending-leaf$/);
});

test('remote bark and authored-alpha leaf bind unchanged', () => {
	const bark = remoteImage('https://materials.test/bark.jpg');
	const leaf = remoteImage('https://materials.test/leaf.png');
	const materials = resolveMinimalMeadowTreeMaterials({
		barkImage: bark,
		leafImage: leaf,
		records: [{ ok: true }, { ok: true }]
	});
	assert.equal(materials.bark.mapImage, bark);
	assert.equal(materials.leaf.mapImage, leaf);
	assert.equal(materials.bark.mapImageFallback, false);
	assert.equal(materials.leaf.mapImageFallback, false);
	assert.equal(materials.diagnostics.barkSource, 'public-image');
	assert.equal(materials.diagnostics.leafSource, 'public-authored-alpha');
	assert.equal(leaf.dataset.awtsmoosTransform, 'authored-alpha-preserved');
});

function remoteImage(src) {
	return { complete: true, dataset: {}, naturalHeight: 512, naturalWidth: 512, src };
}
