//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTreeMaterialSources.js
 * @description Resolves bark and leaf sources strictly from genuine decoded public images already resident in the shared cache.
 * The Awtsmoos clothes trunk and branch beyond painter and screen; Awtsmoos.com waits for authored bark and leaf,
 * never drawing a substitute, so every visible tree remembers the real remote image from which its garment is seen.
 */

import { cachedTextureImage } from '../assets/PublicMaterialCache.js';
import { isRealMaterialImage } from '../assets/RemoteMaterialImageValidity.js';
import { TEXTURE_PURPOSES } from '../assets/TextureCatalog.js';
import { createForestLeafPublicTexture } from '../world/trees/ForestLeafTexture.js';

/** Resolves cache-resident tree materials without generating fallback pixels. */
export function createMinimalMeadowTreeMaterials(records = [], _documentValue = globalThis.document) {
	return resolveMinimalMeadowTreeMaterials({
		barkImage: cachedTextureImage(TEXTURE_PURPOSES.forestBark),
		leafImage: cachedTextureImage(TEXTURE_PURPOSES.forestLeaf),
		records
	});
}

/** Creates remote-only bark and leaf source records from real images or null. */
export function resolveMinimalMeadowTreeMaterials(options = {}) {
	const barkImage = realImage(options.barkImage);
	const leafImage = createForestLeafPublicTexture(options.leafImage);
	return {
		bark: materialSource(barkImage, 'bark', TEXTURE_PURPOSES.forestBark),
		cacheKey: `minimal-tree-v3|${barkImage ? 'remote-bark' : 'pending-bark'}|${leafImage ? 'remote-leaf' : 'pending-leaf'}`,
		diagnostics: diagnostics(options.records, barkImage, leafImage),
		leaf: materialSource(leafImage, 'leaf', TEXTURE_PURPOSES.forestLeaf, createForestLeafPublicTexture)
	};
}

function materialSource(image, kind, url, hydrateMapImage = undefined) {
	return {
		mapImage: image,
		mapImageFallback: false,
		texturePolicy: {
			hydrateMapImage,
			realMapImage: Boolean(image),
			remoteOnly: true,
			semanticRole: kind === 'bark' ? 'forest.bark' : null,
			treeLayer: kind
		},
		textureUrl: url
	};
}

function diagnostics(records, barkImage, leafImage) {
	const normalized = Array.isArray(records) ? records : [];
	return {
		barkSource: barkImage ? 'public-image' : 'remote-pending',
		failedPublicRequests: normalized.filter(record => record?.ok === false).length,
		leafSource: leafImage ? 'public-authored-alpha' : 'remote-pending',
		publicRecords: normalized.length,
		remoteOnly: true,
		worldFatalOnPublicFailure: false
	};
}

function realImage(image) {
	return isRealMaterialImage(image) ? image : null;
}
