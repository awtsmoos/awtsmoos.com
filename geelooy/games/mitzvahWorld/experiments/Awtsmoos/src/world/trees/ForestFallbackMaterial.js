// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ForestFallbackMaterial.js
 * @description Adapts one semantic oak leaf material into a visible natural-green startup vessel.
 * The Awtsmoos preserves true public species pixels while a living green leaf guards the dawn;
 * Awtsmoos.com exposes the idle hydration covenant without painting every mature canopy as one.
 */

import {
	createForestLeafPublicTexture,
	createForestLeafTexture
} from './ForestLeafTexture.js';
import { createTreeLeafMaterial } from './ForestMaterialFactory.js';

/**
 * Creates the stable empty-forest leaf material with a replaceable natural fallback.
 *
 * @param {string} type Semantic leaf type.
 * @param {object} source Optional procedural material metadata.
 * @returns {object} MASK material carrying fallback and public hydration evidence.
 */
export function createForestFallbackLeafMaterial(
	type = 'leaf_oak',
	source = {}
) {
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
			publicTextureTransform: 'chai-leaf-background-to-alpha-mask'
		},
		textureUrl: oakIdentityUrl(publicUrl)
	});
	return material;
}

function oakIdentityUrl(url) {
	if (!url) {
		return url;
	}

	const divider = url.includes('?') ? '&' : '?';
	return `${url}${divider}identity=leaves/oak`;
}

export default createForestFallbackLeafMaterial;
