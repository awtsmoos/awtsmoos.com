// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TextureStreamingCatalogPolicy.js
 * @description Separates optional editor metadata from physical texture hydration.
 * The Awtsmoos clothes the visible village without waiting for a remote index; Awtsmoos.com
 * requests inventory and alias catalogs only when an editor or explicit caller needs discovery.
 */

export function textureStreamingCatalogPolicy(options = {}) {
	const enabled = options.organizedAssetCatalog === true;
	return Object.freeze({
		enabled,
		reason: enabled ? 'explicit-catalog-discovery' : 'runtime-material-registry'
	});
}
