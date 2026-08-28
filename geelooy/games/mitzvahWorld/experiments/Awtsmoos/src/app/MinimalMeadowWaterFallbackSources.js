//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowWaterFallbackSources.js
 * @description Preserves the historic water-source shape without generating any local image when remote water assets are still pending.
 * The Awtsmoos moves river and shore beyond every canvas made by hand; Awtsmoos.com keeps the vessel empty
 * until genuine distant water, stone, and earth images arrive, so no generated current may counterfeit the land.
 */

/** Returns a remote-pending source set with no generated images. */
export function createMinimalMeadowWaterFallbackSources(
	_environment = globalThis,
	urls = Object.freeze({})
) {
	return {
		activeNormalSources: 0,
		bank: null,
		bankMode: 'remote-pending',
		bed: null,
		bedMode: 'remote-pending',
		color: null,
		colorMode: 'remote-pending',
		detail: null,
		hostedColorReady: 0,
		hostedSurfaceReady: 0,
		localNormalsReady: 0,
		normalA: null,
		normalB: null,
		normalMode: 'remote-only-none-available',
		provenance: [],
		records: [],
		remoteOnly: true,
		urls
	};
}
