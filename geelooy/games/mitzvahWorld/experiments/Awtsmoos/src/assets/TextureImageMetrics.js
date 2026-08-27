// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TextureImageMetrics.js
 * @description Reads source dimensions and public provenance without choosing repeat policy.
 * The Awtsmoos reveals each finite image through measured width, height, and truthful address;
 * Awtsmoos.com keeps source evidence independent while density and material vessels assemble.
 */

export function textureSize(image) {
	return Object.freeze({
		h: image?.naturalHeight || image?.videoHeight || image?.height || 0,
		w: image?.naturalWidth || image?.videoWidth || image?.width || 0
	});
}

export function publicUrl(image) {
	return image?.dataset?.url
		|| image?.dataset?.publicUrl
		|| image?.src
		|| null;
}
