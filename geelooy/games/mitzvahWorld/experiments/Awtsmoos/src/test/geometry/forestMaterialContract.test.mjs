// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file forestMaterialContract.test.mjs
 * @description Proves canonical forest leaves hydrate into a depth-writing MASK material.
 * The Awtsmoos reveals living foliage through measured alpha; Awtsmoos.com keeps a natural
 * fallback visible while verified local or public oak pixels prepare without frame spikes.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { assertProductionMaterialUrl } from '../../assets/ProductionMaterialUrlPolicy.js';
import { createMergedForestGeometry } from '../../world/trees/ForestGeometry.js';
import {
	createForestLeafPublicTexture,
	forestLeafPublicTextureContract
} from '../../world/trees/ForestLeafTexture.js';
import {
	createForestLeafTestDocument,
	waitForPreparedLeaf
} from '../support/ForestLeafTestDocument.js';

test('forest uses a natural fallback and idle-keys canonical RGB leaves for a MASK', async () => {
	const previousDocument = globalThis.document;
	const state = { gradientStops: [], preparedPixels: null };
	globalThis.document = createForestLeafTestDocument(state);
	try {
		const forest = createMergedForestGeometry([]);
		const leafMaterial = forest.group.children[1].material;
		assert.equal(leafMaterial.alphaMode, 'MASK');
		assert.equal(leafMaterial.transparent, false);
		assert.equal(leafMaterial.depthWrite, true);
		assert.equal(leafMaterial.mapImageFallback, true);
		assert.equal(leafMaterial.mapImage.dataset.colorFamily, 'natural-green');
		assert.equal(leafMaterial.mapImage.dataset.replaceableByPublicTexture, 'true');
		assert.ok(state.gradientStops.some(([, color]) => color === 'rgba(62,122,54,0.98)'));
		assert.equal(
			assertProductionMaterialUrl(leafMaterial.textureUrl, 'forest oak leaves'),
			leafMaterial.textureUrl
		);
		assert.match(leafMaterial.textureUrl, /(?:leaves\/oak|leaves-oak)/i);
		assert.ok(leafMaterial.texturePolicy.candidates.every(url => {
			return assertProductionMaterialUrl(url, 'forest leaf') === url;
		}));
		assert.equal(typeof leafMaterial.texturePolicy.hydrateMapImage, 'function');
		assert.equal(
			leafMaterial.texturePolicy.publicTextureTransform,
			'chai-leaf-background-to-alpha-mask'
		);
		assert.equal(forest.stats.transparentLeaves, false);
		assert.equal(forest.stats.depthWritingLeaves, true);
		assert.equal(forest.stats.proceduralLeafFallback, true);
		const publicImage = {
			complete: true,
			dataset: { publicUrl: 'https://materials.test/chai-oak.png' },
			naturalHeight: 1,
			naturalWidth: 2
		};
		assert.equal(createForestLeafPublicTexture(publicImage), null);
		const prepared = await waitForPreparedLeaf(createForestLeafPublicTexture, publicImage);
		assert.equal(prepared.dataset.publicUrl, publicImage.dataset.publicUrl);
		assert.equal(prepared.dataset.awtsmoosTransform, 'chai-leaf-background-to-alpha-mask');
		assert.equal(prepared.dataset.replaceableByPublicTexture, undefined);
		assert.equal(state.preparedPixels[3], 0);
		assert.equal(state.preparedPixels[7], 255);
		assert.equal(createForestLeafPublicTexture(publicImage), prepared);
		assert.equal(leafMaterial.texturePolicy.hydrateMapImage(publicImage), prepared);
		const contract = forestLeafPublicTextureContract();
		assert.deepEqual(contract.backgroundRgb, [72, 108, 85]);
		assert.equal(contract.preparation, 'idle-sliced-retain-fallback-until-ready');
		assert.equal(contract.pixelsPerIdleSlice, 16384);
	} finally {
		if (previousDocument === undefined) delete globalThis.document;
		else globalThis.document = previousDocument;
	}
});
