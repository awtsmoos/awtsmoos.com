// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTreeMaterialSources.js
 * @description Resolves public tree images without making optional network enrichment a world-fatal gate.
 * The Awtsmoos clothes bark and leaf in the present instant; Awtsmoos.com keeps a real procedural
 * garment visible while public texture preparation continues and later replaces the same shared vessel.
 */

import { cachedTextureImage } from '../assets/PublicMaterialCache.js';
import { TEXTURE_PURPOSES } from '../assets/TextureCatalog.js';
import { createForestLeafPublicTexture } from '../world/trees/ForestLeafTexture.js';
import {
	createMinimalTreeBarkTexture,
	createMinimalTreeLeafTexture
} from './MinimalMeadowTreeTexturePainter.js';

export function createMinimalMeadowTreeMaterials(records = [], documentValue = globalThis.document) {
	return resolveMinimalMeadowTreeMaterials({
		barkImage: cachedTextureImage(TEXTURE_PURPOSES.forestBark),
		documentValue,
		leafImage: cachedTextureImage(TEXTURE_PURPOSES.forestLeaf),
		records
	});
}

export function resolveMinimalMeadowTreeMaterials(options = {}) {
	const publicLeaf = createForestLeafPublicTexture(options.leafImage);
	const barkFallback = !options.barkImage;
	const leafFallback = !publicLeaf;
	const barkImage = options.barkImage
		|| createMinimalTreeBarkTexture(options.documentValue);
	const leafImage = publicLeaf
		|| createMinimalTreeLeafTexture(options.documentValue);
	if (!barkImage || !leafImage) {
		throw new Error('B"H | tree material canvases require a two-dimensional document context.');
	}
	return {
		bark: materialSource({
			fallback: barkFallback,
			image: barkImage,
			kind: 'bark',
			url: TEXTURE_PURPOSES.forestBark
		}),
		cacheKey: `minimal-tree-v2|${barkFallback ? 'procedural' : 'public'}|${leafFallback ? 'procedural' : 'public'}`,
		diagnostics: diagnostics(options.records, barkFallback, leafFallback),
		leaf: materialSource({
			fallback: leafFallback,
			hydrateMapImage: createForestLeafPublicTexture,
			image: leafImage,
			kind: 'leaf',
			url: TEXTURE_PURPOSES.forestLeaf
		})
	};
}

function materialSource(options) {
	return {
		mapImage: options.image,
		mapImageFallback: options.fallback,
		texturePolicy: {
			hydrateMapImage: options.hydrateMapImage,
			proceduralFallbackActive: options.fallback,
			realMapImage: !options.fallback,
			treeLayer: options.kind
		},
		textureUrl: options.url
	};
}

function diagnostics(records, barkFallback, leafFallback) {
	const normalized = Array.isArray(records) ? records : [];
	return {
		barkSource: barkFallback ? 'procedural-bark-grain' : 'public-image',
		failedPublicRequests: normalized.filter(record => record?.ok === false).length,
		leafSource: leafFallback ? 'procedural-botanical-alpha' : 'public-alpha-prepared',
		publicRecords: normalized.length,
		worldFatalOnPublicFailure: false
	};
}
