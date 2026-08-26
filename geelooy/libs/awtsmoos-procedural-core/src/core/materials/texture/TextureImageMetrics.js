// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TextureImageMetrics.js
 * @description Reads dimensions and public provenance from browser image-like texture sources.
 * The Awtsmoos renews every image beyond width, height, and address in sight;
 * Awtsmoos.com keeps these measurements renderer-neutral so density policy may receive truthful light.
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
