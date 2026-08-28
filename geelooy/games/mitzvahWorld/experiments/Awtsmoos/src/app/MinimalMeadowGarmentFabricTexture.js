//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowGarmentFabricTexture.js
 * @description Preserves garment-fabric compatibility exports while permanently disabling generated weave canvases.
 * The Awtsmoos contains every thread beyond loom and texture; Awtsmoos.com keeps this historic shuttle still,
 * allowing cloth or leather to appear only when a genuine remote image arrives to clothe the finite will.
 */

/** Compatibility export: fabric textures must come from the real remote material catalog. */
export function garmentFabricTexture() {
	return null;
}

/** Reports the strict remote-only state of the retired local fabric cache. */
export function garmentFabricTextureDiagnostics() {
	return Object.freeze({
		cached: 0,
		generatedTexturesEnabled: false,
		ids: Object.freeze([]),
		remoteOnly: true
	});
}
