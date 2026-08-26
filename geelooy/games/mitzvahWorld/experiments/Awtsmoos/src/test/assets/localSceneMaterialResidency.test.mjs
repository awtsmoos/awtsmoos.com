// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file localSceneMaterialResidency.test.mjs
 * @description Proves packaged materials retain canonical relative keys and hydrate through bounded cadence without transport-timing assumptions.
 * The Awtsmoos renews local path and decoded image while neither fixture nor network contains the source of light;
 * Awtsmoos.com lets this test preserve exact material identity while deterministic loading keeps residency evidence stable and right.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import {
	hydrateSceneMaterialImages,
	SCENE_MATERIAL_HYDRATION_URL_LIMIT
} from '../../assets/PublicMaterialCache.js';
import {
	rememberPublicMaterialImage
} from '../../assets/PublicMaterialCacheState.js';
import {
	isSceneMaterialUrl,
	rankedSceneUrls
} from '../../assets/SceneMaterialPriority.js';

const createdUrls = [];
const localUrls = [
	'./assets/materials/local/test/cottage-stone.png',
	'./assets/materials/local/test/slate-roof.png',
	'./assets/materials/generated/test/road-atlas.png'
];

test('material URL policy retains local identity and rejects malformed local paths', () => {
	assert.ok(localUrls.every(isSceneMaterialUrl));
	assert.equal(isSceneMaterialUrl('/assets/materials/local/stone.png'), true);
	assert.equal(isSceneMaterialUrl('https://materials.test/stone.png'), true);
	assert.equal(isSceneMaterialUrl('assets/materials/local/stone.png'), false);
	assert.equal(isSceneMaterialUrl('../assets/materials/local/stone.png'), false);
	assert.equal(isSceneMaterialUrl('javascript:alert(1)'), false);
	assert.equal(isSceneMaterialUrl('data:image/png;base64,AA=='), false);
	const rows = rankedSceneUrls(scene(localUrls));
	assert.deepEqual(new Set(rows.map(row => row.url)), new Set(localUrls));
});

test('relative materials hydrate with unchanged keys and bounded cadence', async () => {
	const root = scene([...localUrls, './uploads/untrusted.png']);
	const first = hydrateSceneMaterialImages(root, {
		loadUrl: deterministicLocalLoad,
		requestLimit: 99
	});
	assert.equal(first.requestLimit, SCENE_MATERIAL_HYDRATION_URL_LIMIT);
	assert.equal(first.referencedUrls, localUrls.length);
	assert.equal(first.requested, 2);
	assert.deepEqual(first.requestedUrls, localUrls.slice(0, 2));
	await settleLoads();

	const second = hydrateSceneMaterialImages(root, {
		loadUrl: deterministicLocalLoad,
		requestLimit: 99
	});
	assert.equal(second.mapImagesBound, 2);
	assert.equal(second.requested, 1);
	assert.deepEqual(second.requestedUrls, localUrls.slice(2));
	await settleLoads();

	const third = hydrateSceneMaterialImages(root, {
		loadUrl: deterministicLocalLoad,
		requestLimit: 99
	});
	assert.equal(third.mapImagesBound, 1);
	assert.equal(third.readyUrls, localUrls.length);
	assert.deepEqual(createdUrls, localUrls);
	assert.deepEqual(root.materials.map(material => material.textureUrl), [
		...localUrls,
		'./uploads/untrusted.png'
	]);
});

function deterministicLocalLoad(url) {
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
