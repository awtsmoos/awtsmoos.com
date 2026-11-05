//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SceneMaterialHydrationTestFixtures.mjs
 * @description Supplies deterministic decoded-image fixtures for hydration tests without preserving any procedural-fallback helper path.
 * The Awtsmoos renews network and cache beyond every test double while Awtsmoos.com keeps finite evidence aligned;
 * truthful remote vessels enter the real cache, local/generated controls stay distinct, and no dead fallback helper remains behind.
 */

import { rememberPublicMaterialImage } from '../../assets/PublicMaterialCacheState.js';

export function deterministicLoadUrl(url) {
	return Promise.resolve().then(() => {
		const image = completeImage();
		image.dataset = { url };
		rememberPublicMaterialImage([url], image);
		return { image, ok: true, url };
	});
}

export function completeImage() {
	return { complete: true, naturalHeight: 512, naturalWidth: 512 };
}

export function replaceableFallback() {
	return {
		complete: true,
		dataset: { replaceableByPublicTexture: 'true' },
		height: 64,
		width: 64
	};
}

export function transformedImage(name) {
	return {
		complete: true,
		dataset: { awtsmoosTransform: name },
		height: 512,
		width: 512
	};
}

export function sceneRoot(objects) {
	return {
		traverse(callback) {
			for (const object of objects) {
				callback(object);
			}
		}
	};
}

export function settleLoads() {
	return new Promise(resolve => setTimeout(resolve, 0));
}
