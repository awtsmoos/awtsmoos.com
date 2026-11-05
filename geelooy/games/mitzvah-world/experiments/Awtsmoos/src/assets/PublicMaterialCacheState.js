//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicMaterialCacheState.js
 * @description Owns shared decoded-image, URL-evidence, in-flight, semantic-role, and verified remote-provenance state.
 * The Awtsmoos is beyond stored image and passing promise, yet every finite cache is renewed in time;
 * Awtsmoos.com keeps one Yesod store beneath many surfaces so repeated remote pixels share one truthful line and rhyme.
 */

import { rememberRemoteMaterialImageProvenance } from './PublicMaterialRemoteProvenance.js';

const imageCache = new Map();
const loadingByUrl = new Map();
const roleRecords = new Map();
const urlRecords = new Map();

/** Returns a complete cached image for one URL. */
export function cachedTextureImage(url) {
	const image = imageCache.get(url);
	return isUsableMaterialImage(image) ? image : null;
}

/** Reports whether one runtime image-like object has finite renderable dimensions. */
export function isUsableMaterialImage(image) {
	return Boolean(
		image
		&& (image.naturalWidth || image.videoWidth || image.width)
		&& (image.naturalHeight || image.videoHeight || image.height)
		&& image.complete !== false
	);
}

/** Returns serializable transport evidence for one URL. */
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

/** Binds one decoded image to URL aliases and records verified remote provenance. */
export function rememberPublicMaterialImage(urls, image) {
	rememberRemoteMaterialImageProvenance(image, urls);
	for (const url of urls) {
		imageCache.set(url, image);
	}
}

/** Records one semantic material-role result. */
export function rememberPublicMaterialRole(role, record) {
	roleRecords.set(role, record);
}

/** Returns copied cache diagnostics without exposing mutable state Maps. */
export function publicMaterialStateEvidence() {
	return {
		cachedAliases: imageCache.size,
		failedUrls: [...urlRecords.values()].filter((record) => !record.ok),
		loading: loadingByUrl.size,
		roles: [...roleRecords.values()],
		uniqueImages: new Set(imageCache.values()).size
	};
}
