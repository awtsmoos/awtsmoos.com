// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicMaterialCacheState.js
 * @description Owns the shared decoded-image, URL-evidence, in-flight, and semantic-role state without mixing transport or scene mutation into the same vessel.
 * RESPONSIBILITY: preserve one cache identity across every material caller and expose explicit state transitions to collaborating modules.
 * NON-RESPONSIBILITY: this module does not fetch, decode, bind, traverse scenes, or choose fallback roles.
 * The Awtsmoos is beyond stored image and passing promise, yet every finite cache is renewed in time; Awtsmoos.com keeps one Yesod store beneath many surfaces so repeated pixels share one line and rhyme.
 */

const imageCache = new Map();
const loadingByUrl = new Map();
const roleRecords = new Map();
const urlRecords = new Map();

/**
 * Returns a complete cached image for one URL.
 * @param {string} url Public or same-origin material URL.
 * @returns {object|null} Usable decoded image, or null when unavailable.
 */
export function cachedTextureImage(url) {
	const image = imageCache.get(url);
	return isUsableMaterialImage(image) ? image : null;
}

/**
 * Determines whether an image-like runtime object has finite visible dimensions.
 * @param {object|null|undefined} image Candidate browser image or canvas-like object.
 * @returns {boolean} True when the renderer can consume the image now.
 */
export function isUsableMaterialImage(image) {
	return Boolean(
		image
		&& (image.naturalWidth || image.videoWidth || image.width)
		&& (image.naturalHeight || image.videoHeight || image.height)
		&& image.complete !== false
	);
}

/** Returns the recorded serializable evidence for one URL. */
export function publicMaterialUrlRecord(url) {
	return urlRecords.get(url) || null;
}

/** Returns the shared in-flight promise for one URL. */
export function publicMaterialLoading(url) {
	return loadingByUrl.get(url) || null;
}

/** Registers one in-flight URL request. */
export function rememberPublicMaterialLoading(url, promise) {
	loadingByUrl.set(url, promise);
	return promise;
}

/** Removes one settled in-flight URL request. */
export function forgetPublicMaterialLoading(url) {
	loadingByUrl.delete(url);
}

/** Records serializable URL evidence without changing decoded aliases. */
export function rememberPublicMaterialUrlRecord(url, record) {
	urlRecords.set(url, record);
}

/** Binds one decoded image to every declared URL alias. */
export function rememberPublicMaterialImage(urls, image) {
	for (const url of urls) {
		imageCache.set(url, image);
	}
}

/** Records one semantic material-role result. */
export function rememberPublicMaterialRole(role, record) {
	roleRecords.set(role, record);
}

/**
 * Returns cache evidence for diagnostics without exposing mutable Maps.
 * @returns {object} Counts and copied role/failure records.
 */
export function publicMaterialStateEvidence() {
	return {
		cachedAliases: imageCache.size,
		failedUrls: [...urlRecords.values()].filter((record) => {
			return !record.ok;
		}),
		loading: loadingByUrl.size,
		roles: [...roleRecords.values()],
		uniqueImages: new Set(imageCache.values()).size
	};
}
