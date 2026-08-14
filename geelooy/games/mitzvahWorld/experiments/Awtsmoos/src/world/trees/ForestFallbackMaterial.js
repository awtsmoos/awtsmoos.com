// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ForestFallbackMaterial.js
 * @description Keeps one temporary natural leaf visible until the canonical alpha-ready species texture hydrates.
 * The Awtsmoos lets dawn carry a finite green placeholder without altering the future leaf; Awtsmoos.com swaps
 * directly to authored alpha pixels and never invokes yesterday's studio-green chroma-key transformation.
 */

import {
	createForestLeafPublicTexture,
	createForestLeafTexture
} from './ForestLeafTexture.js';
import { createTreeLeafMaterial } from './ForestMaterialFactory.js';

export function createForestFallbackLeafMaterial(type = 'leaf_oak', source = {}) {
	const material = createTreeLeafMaterial(type, source);
	const fallback = createForestLeafTexture();
	const publicUrl = material.textureUrl;
	Object.assign(material, {
		mapImage: fallback,
		mapImageFallback: Boolean(fallback),
		texturePolicy: {
			...material.texturePolicy,
			candidates: publicUrl ? [publicUrl] : [],
			hideUntilHydrated: false,
			hydrateMapImage: createForestLeafPublicTexture,
			publicTextureTransform: 'authored-alpha-preserved'
		},
		textureUrl: oakIdentityUrl(publicUrl)
	});
	return material;
}

function oakIdentityUrl(url) {
	if (!url) return url;
	const divider = url.includes('?') ? '&' : '?';
	return `${url}${divider}identity=leaves/oak`;
}

export default createForestFallbackLeafMaterial;
