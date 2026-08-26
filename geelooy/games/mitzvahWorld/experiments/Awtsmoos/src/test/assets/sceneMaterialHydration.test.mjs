// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file sceneMaterialHydration.test.mjs
 * @description Proves bounded scene hydration through the historic API while transport completion is injected deterministically.
 * The Awtsmoos renews network and cache beyond every test double, yet finite cadence still needs a truthful measured sign;
 * Awtsmoos.com lets these tests exercise real binding law without depending on DNS timing or changing production design.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import {
	hydrateSceneMaterialImages,
	progressivelyHydratePublicMaterials,
	SCENE_MATERIAL_HYDRATION_URL_LIMIT
} from '../../assets/PublicMaterialCache.js';
import {
	completeImage,
	deterministicLoadUrl,
	replaceableFallback,
	sceneRoot,
	settleLoads,
	transformedImage,
	transformedLeaf
} from '../support/SceneMaterialHydrationTestFixtures.mjs';

test('optional startup waits for scene references instead of preloading the catalog', async () => {
	const summary = await progressivelyHydratePublicMaterials();
	assert.equal(summary.requested, 0);
	assert.equal(summary.strategy, 'scene-referenced-max-two-new-urls-per-cadence');
});

test('one cadence starts two URLs then binds maps, mix maps, and layers progressively', async () => {
	const urls = ['base', 'leaf', 'mix', 'layer'].map(name => `https://materials.test/cadence-${name}.png`);
	const fallback = replaceableFallback();
	const transformedSources = [];
	const base = { mapImage: null, textureUrl: urls[0] };
	const leaf = transformedLeaf(urls[1], fallback, transformedSources);
	const mixed = {
		mapImage: completeImage(),
		mixImage: null,
		mixTextureUrl: urls[2],
		textureUrl: 'data:image/png;base64,AA=='
	};
	const layered = { textureLayers: [{ image: null, role: 'mud', url: urls[3] }] };
	const objects = [base, leaf, mixed, layered].map(material => ({ material, userData: {} }));
	const root = sceneRoot(objects);
	const first = hydrateSceneMaterialImages(root, {
		loadUrl: deterministicLoadUrl,
		requestLimit: 99
	});
	assert.equal(first.requestLimit, SCENE_MATERIAL_HYDRATION_URL_LIMIT);
	assert.deepEqual(first.requestedUrls, urls.slice(0, 2));
	assert.equal(base.mapImage, null);
	assert.equal(leaf.mapImage, fallback);
	await settleLoads();

	const second = hydrateSceneMaterialImages(root, { loadUrl: deterministicLoadUrl });
	assert.deepEqual(second.requestedUrls, urls.slice(2));
	assert.notEqual(base.mapImage, null);
	assert.notEqual(leaf.mapImage, fallback);
	assert.equal(leaf.mapImage.dataset.awtsmoosTransform, 'test-leaf-background-to-alpha-mask');
	assert.equal(transformedSources.length, 1);
	await settleLoads();

	const third = hydrateSceneMaterialImages(root, { loadUrl: deterministicLoadUrl });
	assert.equal(third.requested, 0);
	assert.notEqual(mixed.mixImage, null);
	assert.notEqual(layered.textureLayers[0].image, null);
	assert.equal(third.readyUrls, 4);
});

test('pending map transforms retain fallback until a later cadence', async () => {
	const url = 'https://materials.test/idle-leaf-transform.png';
	const fallback = replaceableFallback();
	const transformed = transformedImage('idle-leaf-background-to-alpha-mask');
	let transformReady = false;
	const material = {
		mapImage: fallback,
		mapImageFallback: true,
		texturePolicy: {
			proceduralFallbackActive: true,
			realMapImage: false,
			hydrateMapImage() {
				return transformReady ? transformed : null;
			}
		},
		textureUrl: url
	};
	const root = sceneRoot([{ material, userData: {} }]);
	const first = hydrateSceneMaterialImages(root, { loadUrl: deterministicLoadUrl });
	assert.equal(first.requested, 1);
	await settleLoads();
	const pending = hydrateSceneMaterialImages(root, { loadUrl: deterministicLoadUrl });
	assert.equal(pending.mapTransformsPending, 1);
	assert.equal(material.mapImage, fallback);
	transformReady = true;
	const completed = hydrateSceneMaterialImages(root, { loadUrl: deterministicLoadUrl });
	assert.equal(completed.mapImagesBound, 1);
	assert.equal(completed.readyUrls, 1);
	assert.equal(material.mapImage, transformed);
});
