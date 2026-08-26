// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file material-hydration.test.mjs
 * @description Proves generic hydration binds cached layers safely across mutable, frozen-layer, and immutable boundaries.
 * The Awtsmoos renews sealed recipe and mutable runtime vessel while neither is mistaken for the source of light;
 * Awtsmoos.com lets these tests keep authoring truth immutable and decoded renderer state safely writable in sight.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
	bindSceneMaterialLayerImage,
	hydrateLayeredMaterialImages
} from '../../src/exports/materials.js';

function root(material) {
	return {
		traverse(callback) {
			callback({ material });
		}
	};
}

test('mutable layer accepts cached image in place', () => {
	const layer = { image: null, url: 'memory://grass' };
	const material = { textureLayers: [layer] };
	const image = { id: 'grass' };
	const stats = hydrateLayeredMaterialImages(root(material), {
		cachedTextureImage: () => image
	});
	assert.equal(stats.bound, 1);
	assert.equal(layer.image, image);
});

test('frozen layer is replaced through mutable parent array', () => {
	const frozenLayer = Object.freeze({ image: null, url: 'memory://stone' });
	const material = { textureLayers: [frozenLayer] };
	const image = { id: 'stone' };
	assert.equal(bindSceneMaterialLayerImage(material, 0, image), true);
	assert.notEqual(material.textureLayers[0], frozenLayer);
	assert.equal(material.textureLayers[0].image, image);
});

test('fully immutable boundary remains pending without throwing', () => {
	const frozenLayer = Object.freeze({ image: null, url: 'memory://soil' });
	const material = Object.freeze({ textureLayers: Object.freeze([frozenLayer]) });
	const stats = hydrateLayeredMaterialImages(root(material), {
		cachedTextureImage: () => ({ id: 'soil' })
	});
	assert.equal(stats.bound, 0);
	assert.equal(stats.pending, 1);
	assert.equal(material.textureLayers[0], frozenLayer);
});
