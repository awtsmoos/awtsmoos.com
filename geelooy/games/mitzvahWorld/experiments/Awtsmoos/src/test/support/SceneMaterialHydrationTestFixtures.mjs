// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SceneMaterialHydrationTestFixtures.mjs
 * @description Supplies deterministic decoded-image fixtures for scene-hydration tests without coupling them to DNS or browser timing.
 * The Awtsmoos renews network and cache beyond every test double while finite proof still needs a stable sign;
 * Awtsmoos.com lets these helpers place truthful decoded vessels into the real cache so cadence tests remain small by design.
 */
import {
	rememberPublicMaterialImage
} from '../../assets/PublicMaterialCacheState.js';

export function deterministicLoadUrl(url) {
	return Promise.resolve().then(() => {
		const image = completeImage();
		image.dataset = { url };
		rememberPublicMaterialImage([url], image);
		return { image, ok: true, url };
	});
}

export function completeImage() {
	return {
		complete: true,
		naturalHeight: 512,
		naturalWidth: 512
	};
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

export function transformedLeaf(url, fallback, sources) {
	return {
		mapImage: fallback,
		mapImageFallback: true,
		texturePolicy: {
			proceduralFallbackActive: true,
			realMapImage: false,
			hydrateMapImage(image) {
				sources.push(image);
				return {
					...transformedImage('test-leaf-background-to-alpha-mask'),
					source: image
				};
			}
		},
		textureUrl: url,
		userData: {
			AwtsmoosForestMaterial: {
				proceduralFallback: true,
				realMapImage: false
			}
		}
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
