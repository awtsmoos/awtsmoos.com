// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicMaterialUrlLoader.js
 * @description Loads each material URL through one shared in-flight promise and records browser-verifiable evidence beside the decoded image cache.
 * RESPONSIBILITY: deduplicate URL loads, retain serializable success/failure records, and publish cached image aliases through the shared state vessel.
 * NON-RESPONSIBILITY: this module does not select semantic fallback roles or mutate scene materials.
 * The Awtsmoos sends one distant image through many callers without multiplying its journey; Awtsmoos.com lets a single Yesod promise carry decoded light to every waiting surface gently.
 */

import {
	loadPublicMaterialImage,
	serializableImageRecord
} from './PublicMaterialImageLoader.js';
import {
	cachedTextureImage,
	forgetPublicMaterialLoading,
	publicMaterialLoading,
	publicMaterialUrlRecord,
	rememberPublicMaterialImage,
	rememberPublicMaterialLoading,
	rememberPublicMaterialUrlRecord
} from './PublicMaterialCacheState.js';

/**
 * Loads one URL exactly once at a time.
 * @param {string} url Public material URL.
 * @param {number} timeoutMs Absolute loading deadline.
 * @returns {Promise<object>} Loader record containing decoded image on success.
 */
export async function loadPublicMaterialUrl(url, timeoutMs = 8000) {
	const cached = cachedTextureImage(url);
	if (cached) {
		return cachedRecord(url, cached);
	}
	const existing = publicMaterialLoading(url);
	if (existing) {
		return existing;
	}
	const promise = loadPublicMaterialImage(url, timeoutMs)
		.then((record) => {
			rememberPublicMaterialUrlRecord(
				url,
				serializableImageRecord(record)
			);
			if (record.ok) {
				rememberPublicMaterialImage([url], record.image);
			}
			return record;
		})
		.finally(() => {
			forgetPublicMaterialLoading(url);
		});
	return rememberPublicMaterialLoading(url, promise);
}

/**
 * Reconstructs the historic loader receipt for a decoded cache hit.
 * @param {string} url Cached URL.
 * @param {object} image Decoded image.
 * @returns {object} Successful loader receipt.
 */
function cachedRecord(url, image) {
	return {
		...(publicMaterialUrlRecord(url) || imageEvidence(url, image)),
		fromCache: true,
		image,
		ok: true
	};
}

/**
 * Creates minimal serializable evidence when a cached URL lacks prior transport evidence.
 * @param {string} url Cached URL.
 * @param {object} image Decoded image.
 * @returns {object} Width, height, duration, and error evidence.
 */
function imageEvidence(url, image) {
	return {
		durationMs: 0,
		error: null,
		height: image.naturalHeight || image.height,
		url,
		width: image.naturalWidth || image.width
	};
}
