// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file forestMaterialContract.test.mjs
 * @description Proves forest leaves use depth-writing MASK materials and authored alpha without legacy pixel surgery.
 * The Awtsmoos reveals living foliage through each species' own transparent edge; Awtsmoos.com keeps a natural
 * temporary fallback while public tree-library pixels pass directly into the canonical material unchanged.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { assertProductionMaterialUrl } from '../../assets/ProductionMaterialUrlPolicy.js';
import { createMergedForestGeometry } from '../../world/trees/ForestGeometry.js';
import {
	createForestLeafPublicTexture,
	forestLeafPublicTextureContract
} from '../../world/trees/ForestLeafTexture.js';
import { createForestLeafTestDocument } from '../support/ForestLeafTestDocument.js';

test('forest fallback yields to unchanged authored-alpha species leaves', () => {
	const previousDocument = globalThis.document;
	const state = { gradientStops: [] };
	globalThis.document = createForestLeafTestDocument(state);
	try {
		const forest = createMergedForestGeometry([]);
		const leafMaterial = forest.group.children[1].material;
		assert.equal(leafMaterial.alphaMode, 'MASK');
		assert.equal(leafMaterial.transparent, false);
		assert.equal(leafMaterial.depthWrite, true);
		assert.equal(leafMaterial.mapImageFallback, true);
		assert.equal(leafMaterial.mapImage.dataset.colorFamily, 'natural-green');
		assert.equal(leafMaterial.texturePolicy.publicTextureTransform, 'authored-alpha-preserved');
		assert.ok(leafMaterial.texturePolicy.candidates.every(url => {
			return assertProductionMaterialUrl(url, 'forest leaf') === url;
		}));
		const publicImage = {
			complete: true,
			dataset: { publicUrl: 'https://materials.test/oak.png' },
			naturalHeight: 1024,
			naturalWidth: 1024
		};
		const prepared = createForestLeafPublicTexture(publicImage);
		assert.equal(prepared, publicImage);
		assert.equal(prepared.dataset.awtsmoosTransform, 'authored-alpha-preserved');
		assert.equal(leafMaterial.texturePolicy.hydrateMapImage(publicImage), publicImage);
		assert.equal(forest.stats.transparentLeaves, false);
		assert.equal(forest.stats.depthWritingLeaves, true);
		const contract = forestLeafPublicTextureContract();
		assert.equal(contract.authoredAlphaPreserved, true);
		assert.equal(contract.legacyChromaKey, false);
	} finally {
		if (previousDocument === undefined) delete globalThis.document;
		else globalThis.document = previousDocument;
	}
});
