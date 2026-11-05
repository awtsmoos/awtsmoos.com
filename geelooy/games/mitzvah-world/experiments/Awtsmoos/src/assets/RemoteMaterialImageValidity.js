//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RemoteMaterialImageValidity.js
 * @description Enforces decoded, non-generated material imagery with genuine HTTP(S) provenance, including verified blob transport from the remote loader.
 * The Awtsmoos is beyond source and pixel while Awtsmoos.com keeps this Gevurah gate bright;
 * data, canvas, generated, and local images remain concealed, yet a temporary blob may pass only when distant origin is proven right.
 */

import {
	hasRemoteMaterialImageProvenance,
	isRemoteMaterialUrl
} from './PublicMaterialRemoteProvenance.js';

const REJECTED_CONSTRUCTORS = /canvas|offscreen|datatexture|canvastexture|procedural/i;
const HARD_REJECTED_SCHEMES = /^(procedural|generated|canvas|data):/i;

/** Returns true only for decoded image-like sources proven to originate from genuine HTTP(S) material transport. */
export function isRealMaterialImage(image) {
	return isDecodedMaterialImage(image) && hasRemoteOrigin(image);
}

/** Returns true for a texture wrapper whose decoded image has genuine remote provenance. */
export function isRealMaterialTexture(texture) {
	if (!texture || typeof texture !== 'object') {
		return false;
	}
	const constructorName = texture.constructor?.name || '';
	if (REJECTED_CONSTRUCTORS.test(constructorName) || texture.isDataTexture) {
		return false;
	}
	return isRealMaterialImage(texture.image || texture.source?.data || null);
}

/** Returns true only when the visible base-color slot is backed by remote-proven image. */
export function materialHasRealMap(material = {}) {
	return isRealMaterialImage(material.mapImage)
		|| isRealMaterialTexture(material.map);
}

/** Classifies any present base map that fails the strict remote-only covenant. */
export function materialHasRejectedGeneratedMap(material = {}) {
	const image = material.mapImage || material.map?.image || material.map?.source?.data || null;
	return Boolean(image) && !materialHasRealMap(material);
}

/** Reports decoded image shape without granting remote-only readiness. */
export function isDecodedMaterialImage(image) {
	if (!image || typeof image !== 'object') {
		return false;
	}
	const constructorName = image.constructor?.name || '';
	if (REJECTED_CONSTRUCTORS.test(constructorName) || String(image.tagName || '').toUpperCase() === 'CANVAS') {
		return false;
	}
	if (hasHardRejectedMarker(image)) {
		return false;
	}
	const width = Number(image.naturalWidth || image.videoWidth || image.width || 0);
	const height = Number(image.naturalHeight || image.videoHeight || image.height || 0);
	return width > 0 && height > 0 && image.complete !== false;
}

function hasRemoteOrigin(image) {
	if (hasRemoteMaterialImageProvenance(image)) {
		return true;
	}
	return imageUrls(image).some(isRemoteMaterialUrl);
}

function imageUrls(image) {
	return [
		image.dataset?.publicUrl,
		image.dataset?.url,
		image.currentSrc,
		image.src
	].filter(Boolean);
}

function hasHardRejectedMarker(image) {
	return imageUrls(image).some((url) => HARD_REJECTED_SCHEMES.test(String(url)))
		|| image.dataset?.proceduralMaterialTexture === 'true'
		|| image.dataset?.generatedTexture === 'true';
}
