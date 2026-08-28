//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file sceneMaterialHydration.test.mjs
 * @description Proves bounded remote hydration replaces local/generated placeholders with original remote decoded images and never accepts generated transforms.
 * The Awtsmoos renews cache and network beyond every test double; Awtsmoos.com measures two requests per cadence,
 * while remote truth survives transformation hooks and every false local garment remains pending until replaced.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	hydrateSceneMaterialImages,
	progressivelyHydratePublicMaterials,
	SCENE_MATERIAL_HYDRATION_URL_LIMIT
} from '../../assets/PublicMaterialCache.js';
import { remoteMaterialImageUrls } from '../../assets/PublicMaterialRemoteProvenance.js';
import {
	deterministicLoadUrl,
	replaceableFallback,
	sceneRoot,
	settleLoads,
	transformedImage
} from '../support/SceneMaterialHydrationTestFixtures.mjs';

test('optional startup performs no catalog preload', async () => {
	const summary = await progressivelyHydratePublicMaterials();
	assert.equal(summary.requested, 0);
	assert.equal(summary.strategy, 'remote-only-scene-referenced-max-two-new-urls-per-cadence');
});

test('cadence remains capped at two and binds only remote-proven images', async () => {
	const urls = ['base', 'leaf', 'mix'].map(name => `https://materials.test/${name}.png`);
	const fallback = replaceableFallback();
	const base = { mapImage: null, textureUrl: urls[0] };
	const leaf = {
		mapImage: fallback,
		mapImageFallback: true,
		texturePolicy: { hydrateMapImage: () => transformedImage('generated-local-transform') },
		textureUrl: urls[1]
	};
	const mixed = { mixImage: null, mixTextureUrl: urls[2] };
	const root = sceneRoot([base, leaf, mixed].map(material => ({ material, userData: {} })));
	const first = hydrateSceneMaterialImages(root, { loadUrl: deterministicLoadUrl, requestLimit: 99 });
	assert.equal(first.requestLimit, SCENE_MATERIAL_HYDRATION_URL_LIMIT);
	assert.deepEqual(first.requestedUrls, urls.slice(0, 2));
	assert.equal(leaf.mapImage, fallback);
	await settleLoads();
	const second = hydrateSceneMaterialImages(root, { loadUrl: deterministicLoadUrl });
	assert.notEqual(base.mapImage, null);
	assert.notEqual(leaf.mapImage, fallback);
	assert.notEqual(leaf.mapImage.dataset?.awtsmoosTransform, 'generated-local-transform');
	assert.deepEqual(second.requestedUrls, [urls[2]]);
	await settleLoads();
	const third = hydrateSceneMaterialImages(root, { loadUrl: deterministicLoadUrl });
	assert.equal(third.requested, 0);
	assert.notEqual(mixed.mixImage, null);
	assert.equal(third.readyUrls, 3);
});

test('generated transform output never replaces the downloaded remote image', async () => {
	const url = 'https://materials.test/transform.png';
	const generated = transformedImage('local-generated-transform');
	const material = {
		mapImage: replaceableFallback(),
		texturePolicy: { hydrateMapImage: () => generated },
		textureUrl: url
	};
	const root = sceneRoot([{ material, userData: {} }]);
	hydrateSceneMaterialImages(root, { loadUrl: deterministicLoadUrl });
	await settleLoads();
	const complete = hydrateSceneMaterialImages(root, { loadUrl: deterministicLoadUrl });
	assert.equal(complete.readyUrls, 1);
	assert.notEqual(material.mapImage, generated);
	assert.ok(remoteMaterialImageUrls(material.mapImage).includes(url));
});
