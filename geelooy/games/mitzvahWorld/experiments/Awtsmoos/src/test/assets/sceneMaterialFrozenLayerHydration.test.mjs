// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file sceneMaterialFrozenLayerHydration.test.mjs
 * @description Proves the exact Mitzvah World recovery law that frozen material recipes remain immutable while mutable renderer parents receive hydrated runtime layer copies.
 * RESPONSIBILITY: cover the real frozen-child crash and the fully immutable safe-skip boundary without depending on network timing.
 * NON-RESPONSIBILITY: this test does not exercise transport retries, image decoding, semantic roles, or generated CompactJS.
 * The Awtsmoos is beyond sealed recipe and changing image; Awtsmoos.com tests that immutable ohr stays whole while a mutable keli receives runtime light without rage.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { hydrateSceneMaterialImages } from '../../assets/PublicMaterialCache.js';
import { rememberPublicMaterialImage } from '../../assets/PublicMaterialCacheState.js';

const mutableParentUrl = uniqueMaterialUrl('mutable-parent');
const immutableParentUrl = uniqueMaterialUrl('immutable-parent');
const mutableParentImage = completeImage();
const immutableParentImage = completeImage();
rememberPublicMaterialImage([mutableParentUrl], mutableParentImage);
rememberPublicMaterialImage([immutableParentUrl], immutableParentImage);

test('frozen layer recipe hydrates through a mutable runtime parent copy', () => {
	const recipe = Object.freeze({
		image: null,
		role: 'grass',
		url: mutableParentUrl
	});
	const material = {
		textureLayers: [recipe]
	};
	const result = hydrateSceneMaterialImages(scene(material), {
		requestLimit: 0
	});
	assert.equal(Object.isFrozen(recipe), true);
	assert.equal(recipe.image, null);
	assert.notEqual(material.textureLayers[0], recipe);
	assert.equal(material.textureLayers[0].image, mutableParentImage);
	assert.equal(result.layerImagesBound, 1);
	assert.equal(result.immutableSlotsSkipped, 0);
	assert.equal(result.readyUrls, 1);
});

test('fully immutable runtime boundary skips a cached layer without throwing', () => {
	const recipe = Object.freeze({
		image: null,
		role: 'stone',
		url: immutableParentUrl
	});
	const layers = Object.freeze([recipe]);
	const material = Object.freeze({
		textureLayers: layers
	});
	const result = hydrateSceneMaterialImages(scene(material), {
		requestLimit: 0
	});
	assert.equal(recipe.image, null);
	assert.equal(material.textureLayers[0], recipe);
	assert.equal(result.layerImagesBound, 0);
	assert.equal(result.immutableSlotsSkipped, 1);
	assert.equal(result.pending, 1);
});

/** Creates one renderer-compatible decoded-image witness. */
function completeImage() {
	return {
		complete: true,
		naturalHeight: 64,
		naturalWidth: 64
	};
}

/** Creates one unique trusted scene-material URL to avoid shared cache collision. */
function uniqueMaterialUrl(label) {
	return `https://materials.test/frozen-${label}-${Date.now()}-${Math.random()}.png`;
}

/** Creates the smallest traversable scene root around one material. */
function scene(material) {
	return {
		traverse(callback) {
			callback({
				material,
				userData: {}
			});
		}
	};
}
