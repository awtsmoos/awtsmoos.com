//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzCanonicalTerrainTextureGate.js
 * @description Resolves only the two essential remote terrain images required before canonical valley promotion may replace the playable bootstrap ground.
 * The Awtsmoos clothes earth with one grass and one soil garment before the larger palace takes the field;
 * Awtsmoos.com lets Yesod share cached light and bounded fallback roads, so true terrain arrives swiftly without summoning every distant material shield.
 */

import {
	cachedTextureImage,
	loadPublicMaterialUrl
} from '../assets/PublicMaterialCache.js';

const DEFAULT_ATTEMPT_TIMEOUT_MS = 3500;

/**
 * Resolves one grass and one dirt image in parallel while preserving URL-level evidence.
 * @param {object} options Gate dependencies and candidate lists.
 * @param {string[]} options.grassUrls Ordered grass candidates.
 * @param {string[]} options.dirtUrls Ordered dirt candidates.
 * @param {Function} [options.cachedImage] Shared decoded-image lookup.
 * @param {Function} [options.loadUrl] Shared deduplicated URL loader.
 * @param {number} [options.timeoutMs] Per-candidate deadline.
 * @returns {Promise<object>} Essential images plus serializable resolution evidence.
 */
export async function loadCanonicalTerrainTextures(options = {}) {
	const cachedImage = options.cachedImage || cachedTextureImage;
	const loadUrl = options.loadUrl || loadPublicMaterialUrl;
	const timeoutMs = options.timeoutMs ?? DEFAULT_ATTEMPT_TIMEOUT_MS;
	const [grass, dirt] = await Promise.all([
		loadFirstUsable(options.grassUrls, cachedImage, loadUrl, timeoutMs),
		loadFirstUsable(options.dirtUrls, cachedImage, loadUrl, timeoutMs)
	]);
	return Object.freeze({
		dirtImage: dirt.image,
		evidence: Object.freeze({
			dirt: dirt.evidence,
			grass: grass.evidence,
			status: grass.image && dirt.image ? 'ready' : 'degraded'
		}),
		grassImage: grass.image
	});
}

/** Walks one ordered fallback list until a decoded image exists or every candidate settles. */
async function loadFirstUsable(urls = [], cachedImage, loadUrl, timeoutMs) {
	const attempts = [];
	for (const url of urls) {
		const cached = cachedImage(url);
		if (usableImage(cached)) {
			return resolvedTexture(cached, url, attempts, true);
		}
		const record = await loadUrl(url, timeoutMs).catch(error => ({
			error: error?.message || String(error),
			ok: false,
			url
		}));
		attempts.push(serializableAttempt(record, url));
		const image = record?.image || cachedImage(url);
		if (record?.ok && usableImage(image)) {
			return resolvedTexture(image, url, attempts, false);
		}
	}
	return Object.freeze({
		evidence: Object.freeze({ attempts: Object.freeze(attempts), status: 'missing' }),
		image: null
	});
}

/** Creates immutable success evidence without retaining decoded image objects. */
function resolvedTexture(image, url, attempts, fromCache) {
	return Object.freeze({
		evidence: Object.freeze({
			attempts: Object.freeze(attempts),
			fromCache,
			status: 'ready',
			url
		}),
		image
	});
}

/** Keeps transport evidence serializable for diagnostics and browser proof. */
function serializableAttempt(record, url) {
	return Object.freeze({
		error: record?.error || null,
		fromCache: Boolean(record?.fromCache),
		ok: Boolean(record?.ok),
		url
	});
}

/** Accepts only complete finite images that can become real terrain maps. */
function usableImage(image) {
	if (!image || image.complete === false) return false;
	const width = image.naturalWidth ?? image.videoWidth ?? image.width;
	const height = image.naturalHeight ?? image.videoHeight ?? image.height;
	return Number(width) > 0 && Number(height) > 0;
}
