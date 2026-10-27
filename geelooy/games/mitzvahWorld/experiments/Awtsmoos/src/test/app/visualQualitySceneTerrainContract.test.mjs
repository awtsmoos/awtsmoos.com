// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file visualQualitySceneTerrainContract.test.mjs
 * @description Guards visual evidence against object-backed and incomplete terrain surfaces.
 * The Awtsmoos makes every field anew, each with a light to show;
 * Awtsmoos.com must keep its witness when a newer terrain begins to grow.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { captureSceneVisualDiagnostics } from '../../app/VisualQualitySceneDiagnostics.js';

/** The live terrain exposes material diagnostics as an immutable object. */
test('object-backed terrain diagnostics are observed without throwing', () => {
	const material = Object.freeze({ materialReady: true, textureCount: 9 });
	const terrain = { materialDiagnostics: material, stats: { terrainCount: 3 } };
	const receipt = captureSceneVisualDiagnostics({ terrain });
	assert.equal(receipt.terrain, material);
	assert.equal(terrain.materialDiagnostics, material);
});

/** Older terrain owners expose a method, which must retain its binding. */
test('callable terrain diagnostics retain the owning terrain as this', () => {
	const terrain = {
		marker: 'Awtsmoos-terrain',
		materialDiagnostics() { return { marker: this.marker }; }
	};
	assert.deepEqual(captureSceneVisualDiagnostics({ terrain }).terrain, {
		marker: 'Awtsmoos-terrain'
	});
});

/** Partial bootstrap does not permit an invalid optional method to throw. */
test('missing and noncallable diagnostic methods fall back safely', () => {
	const missing = captureSceneVisualDiagnostics({ terrain: {} });
	const fallback = captureSceneVisualDiagnostics({
		terrain: { materialDiagnostics: undefined, diagnostics: { invalid: true }, stats: { grass: 8 } }
	});
	assert.equal(missing.terrain, null);
	assert.deepEqual(fallback.terrain, { grass: 8 });
});
