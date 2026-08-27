// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowTreeMaterials.test.mjs
 * @description Proves public texture latency cannot erase the real procedural-core forest.
 * The Awtsmoos reveals a leaf before a network reply; Awtsmoos.com verifies that the same
 * material remains replaceable by public richness without inventing cards, cubes, or fake state.
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import { resolveMinimalMeadowTreeMaterials } from '../../app/MinimalMeadowTreeMaterialSources.js';

function createDocumentVessel() {
	const canvases = [];
	const context = {
		beginPath() {},
		bezierCurveTo() {},
		clearRect() {},
		createLinearGradient: gradient,
		createRadialGradient: gradient,
		ellipse() {},
		fill() {},
		fillRect() {},
		moveTo() {},
		stroke() {}
	};
	return {
		canvases,
		createElement(name) {
			assert.equal(name, 'canvas');
			const canvas = {
				dataset: {},
				getContext: () => context,
				height: 0,
				width: 0
			};
			canvases.push(canvas);
			return canvas;
		}
	};
}

function gradient() {
	return { addColorStop() {} };
}

test('procedural canvases keep both tree layers visible when public records fail', () => {
	const documentValue = createDocumentVessel();
	const materials = resolveMinimalMeadowTreeMaterials({
		barkImage: null,
		documentValue,
		leafImage: null,
		records: [{ ok: false }, { ok: false }]
	});

	assert.equal(materials.bark.mapImageFallback, true);
	assert.equal(materials.leaf.mapImageFallback, true);
	assert.deepEqual([materials.bark.mapImage.width, materials.bark.mapImage.height], [128, 128]);
	assert.deepEqual([materials.leaf.mapImage.width, materials.leaf.mapImage.height], [128, 128]);
	assert.equal(materials.diagnostics.failedPublicRequests, 2);
	assert.equal(materials.diagnostics.worldFatalOnPublicFailure, false);
	assert.match(materials.cacheKey, /procedural\|procedural$/);
});

test('public bark binds immediately while a pending leaf conversion retains botanical alpha', () => {
	const documentValue = createDocumentVessel();
	const publicBark = { complete: true, height: 512, width: 512 };
	const publicLeaf = { complete: true, height: 512, width: 512 };
	const materials = resolveMinimalMeadowTreeMaterials({
		barkImage: publicBark,
		documentValue,
		leafImage: publicLeaf,
		records: [{ ok: true }, { ok: true }]
	});

	assert.equal(materials.bark.mapImage, publicBark);
	assert.equal(materials.bark.mapImageFallback, false);
	assert.equal(materials.leaf.mapImageFallback, true);
	assert.equal(typeof materials.leaf.texturePolicy.hydrateMapImage, 'function');
	assert.equal(materials.diagnostics.barkSource, 'public-image');
	assert.equal(materials.diagnostics.leafSource, 'procedural-botanical-alpha');
});
