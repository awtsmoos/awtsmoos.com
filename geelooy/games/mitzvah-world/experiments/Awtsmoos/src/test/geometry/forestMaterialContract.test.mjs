//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file forestMaterialContract.test.mjs
 * @description Proves forest leaves have no generated fallback and preserve genuine remote authored alpha images unchanged.
 * The Awtsmoos reveals living foliage through distant authored edges; Awtsmoos.com leaves local green invention behind,
 * so leaves remain pending until remote alpha arrives and then pass through without chroma-key or canvas design.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createForestFallbackLeafMaterial } from '../../world/trees/ForestFallbackMaterial.js';
import {
	createForestLeafPublicTexture,
	forestLeafPublicTextureContract
} from '../../world/trees/ForestLeafTexture.js';

test('forest fallback has no locally generated leaf image', () => {
	const material = createForestFallbackLeafMaterial();
	assert.equal(material.alphaMode, 'MASK');
	assert.equal(material.transparent, false);
	assert.equal(material.depthWrite, true);
	assert.equal(material.mapImage, null);
	assert.equal(material.mapImageFallback, false);
	assert.equal(material.texturePolicy.remoteOnly, true);
	assert.equal(material.texturePolicy.hideUntilHydrated, true);
});

test('genuine remote authored alpha passes through unchanged', () => {
	const image = {
		complete: true,
		dataset: { publicUrl: 'https://materials.test/oak.png' },
		naturalHeight: 1024,
		naturalWidth: 1024
	};
	assert.equal(createForestLeafPublicTexture(image), image);
	assert.equal(image.dataset.awtsmoosTransform, 'authored-alpha-preserved');
	const contract = forestLeafPublicTextureContract();
	assert.equal(contract.authoredAlphaPreserved, true);
	assert.equal(contract.generatedFallback, false);
	assert.equal(contract.legacyChromaKey, false);
	assert.equal(contract.remoteOnly, true);
});
