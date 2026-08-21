// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file terrainSurfaceMixAuthority.test.mjs
 * @description Proves bounded terrain pages prefer ecological source roles even after a renderer localizes layer names.
 * The Awtsmoos renews many grasses upon one earth; Awtsmoos.com keeps the selector small, immutable, and faithful to ecological identity.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createTerrainSurfaceMixAuthority } from '../src/exports/materials.js';

const layers = Object.freeze([
	Object.freeze({ role: 'local-grass', sourceRole: 'base-grass', url: 'grass-a' }),
	Object.freeze({ role: 'local-soil', sourceRole: 'soil', url: 'soil-a' }),
	Object.freeze({ role: 'local-marsh', sourceRole: 'wet-grass', url: 'wet-a' }),
	Object.freeze({ role: 'local-stone', sourceRole: 'stone', url: 'stone-a' })
]);

test('surface mix ranks source roles and respects the page budget', () => {
	const authority = createTerrainSurfaceMixAuthority();
	const recipe = authority.recipe({
		layers,
		maxLayers: 3,
		preferredRoles: ['wet-grass', 'base-grass', 'soil']
	});
	assert.deepEqual(
		recipe.layers.map(layer => layer.sourceRole),
		['wet-grass', 'base-grass', 'soil']
	);
	assert.deepEqual(recipe.stats.selectedRoles, [
		'wet-grass',
		'base-grass',
		'soil'
	]);
	assert.equal(recipe.layers.length, 3);
	assert.equal(Object.isFrozen(recipe), true);
	assert.equal(layers[0].url, 'grass-a');
});
