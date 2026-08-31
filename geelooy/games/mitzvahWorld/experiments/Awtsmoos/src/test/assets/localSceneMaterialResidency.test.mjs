//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file localSceneMaterialResidency.test.mjs
 * @description Proves material residency preserves canonical Drive keys and bounded hydration without repository media paths.
 * The Awtsmoos renews remote path and decoded image while neither fixture nor Git contains the garment's light;
 * Awtsmoos.com keeps exact Drive identity through deterministic loading so residency evidence remains stable and right.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	hydrateSceneMaterialImages,
	SCENE_MATERIAL_HYDRATION_URL_LIMIT
} from '../../assets/PublicMaterialCache.js';
import { rememberPublicMaterialImage } from '../../assets/PublicMaterialCacheState.js';
import { remoteFullResolutionTextureUrl } from '../../assets/RemoteTextureCatalog.js';
import {
	isSceneMaterialUrl,
	rankedSceneUrls
} from '../../assets/SceneMaterialPriority.js';

const createdUrls = [];
const driveUrls = [
	remoteFullResolutionTextureUrl('cobblestone.png'),
	remoteFullResolutionTextureUrl('grass 4.png'),
	remoteFullResolutionTextureUrl('dirt 1.png')
];

test('material URL policy accepts Drive identity and rejects local or foreign transport', () => {
	assert.ok(driveUrls.every(isSceneMaterialUrl));
	assert.equal(isSceneMaterialUrl('/assets/materials/local/stone.png'), false);
	assert.equal(isSceneMaterialUrl('https://materials.test/stone.png'), false);
	assert.equal(isSceneMaterialUrl('assets/materials/local/stone.png'), false);
	assert.equal(isSceneMaterialUrl('../assets/materials/local/stone.png'), false);
	assert.equal(isSceneMaterialUrl('javascript:alert(1)'), false);
	assert.equal(isSceneMaterialUrl('data:image/png;base64,AA=='), false);
	const rows = rankedSceneUrls(scene(driveUrls));
	assert.deepEqual(new Set(rows.map(row => row.url)), new Set(driveUrls));
});

test('Drive materials hydrate with unchanged keys and bounded cadence', async () => {
	const root = scene([...driveUrls, './uploads/untrusted.png']);
	const first = hydrateSceneMaterialImages(root, {
		loadUrl: deterministicRemoteLoad,
		requestLimit: 99
	});
	assert.equal(first.requestLimit, SCENE_MATERIAL_HYDRATION_URL_LIMIT);
	assert.equal(first.referencedUrls, driveUrls.length);
	assert.equal(first.requested, 2);
	assert.deepEqual(first.requestedUrls, driveUrls.slice(0, 2));
	await settleLoads();
	const second = hydrateSceneMaterialImages(root, {
		loadUrl: deterministicRemoteLoad,
		requestLimit: 99
	});
	assert.equal(second.mapImagesBound, 2);
	assert.equal(second.requested, 1);
	assert.deepEqual(second.requestedUrls, driveUrls.slice(2));
	await settleLoads();
	const third = hydrateSceneMaterialImages(root, {
		loadUrl: deterministicRemoteLoad,
		requestLimit: 99
	});
	assert.equal(third.mapImagesBound, 1);
	assert.equal(third.readyUrls, driveUrls.length);
	assert.deepEqual(createdUrls, driveUrls);
	assert.deepEqual(root.materials.map(material => material.textureUrl), [
		...driveUrls,
		'./uploads/untrusted.png'
	]);
});

function deterministicRemoteLoad(url) {
	createdUrls.push(url);
	return Promise.resolve().then(() => {
		const image = {
			complete: true,
			dataset: { url },
			naturalHeight: 512,
			naturalWidth: 512
		};
		rememberPublicMaterialImage([url], image);
		return { image, ok: true, url };
	});
}

function scene(urls) {
	const materials = urls.map(textureUrl => ({ mapImage: null, textureUrl }));
	const objects = materials.map((material, index) => ({
		material,
		name: index === 0 ? 'cottage-wall' : `material-${index}`,
		userData: {}
	}));
	return {
		materials,
		traverse(callback) {
			objects.forEach(callback);
		}
	};
}

function settleLoads() {
	return new Promise(resolve => setTimeout(resolve, 0));
}
