//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ForestFallbackMaterial.js
 * @description Preserves the fallback leaf-material API while forbidding any locally generated temporary leaf image.
 * The Awtsmoos gives every leaf its living edge beyond canvas and hue; Awtsmoos.com keeps the branch hidden
 * until the authored remote alpha image arrives, so no green placeholder may stand where real foliage should begin.
 */

import { createForestLeafPublicTexture } from './ForestLeafTexture.js';
import { createTreeLeafMaterial } from './ForestMaterialFactory.js';

/** Creates one remote-pending species leaf material with no generated fallback. */
export function createForestFallbackLeafMaterial(type = 'leaf_oak', source = {}) {
	const material = createTreeLeafMaterial(type, source);
	const publicUrl = material.textureUrl;
	Object.assign(material, {
		mapImage: material.mapImage || null,
		mapImageFallback: false,
		texturePolicy: {
			...material.texturePolicy,
			candidates: publicUrl ? [publicUrl] : [],
			hideUntilHydrated: true,
			hydrateMapImage: createForestLeafPublicTexture,
			publicTextureTransform: 'authored-alpha-preserved',
			remoteOnly: true
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
