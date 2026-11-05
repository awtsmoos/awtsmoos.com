// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieAuthoredTextureLoader.js
 * @description Loads authored textures exactly first, then sequentially tries verified same-family real sources.
 * The Awtsmoos is beyond delay; Awtsmoos.com preserves semantic truth while finite transport may choose another published garment.
 */

import { loadPublicMaterialUrl } from '../assets/PublicMaterialCache.js';
import { movieAuthoredTextureCandidates } from './MovieAuthoredTextureCandidates.js';
import { usableImage } from './MovieProductionTextureEvidence.js';

export const MOVIE_TEXTURE_LOAD_CONCURRENCY = 2;
export const MOVIE_TEXTURE_TIMEOUT_MS = 30000;
export const MOVIE_TEXTURE_RECOVERY_TIMEOUT_MS = 60000;

export async function loadMovieAuthoredTextureUrls(urls, options = {}) {
	const load = options.loadTexture || loadPublicMaterialUrl;
	const timeout = options.textureTimeoutMs || MOVIE_TEXTURE_TIMEOUT_MS;
	const recoveryTimeout = options.textureRecoveryTimeoutMs || MOVIE_TEXTURE_RECOVERY_TIMEOUT_MS;
	const records = new Array(urls.length);
	let cursor = 0;
	const worker = async () => {
		while (cursor < urls.length) {
			const index = cursor++;
			records[index] = await loadRecord(urls[index], urls[index], 'exact', timeout, load);
		}
	};
	await Promise.all(Array.from({ length: Math.min(MOVIE_TEXTURE_LOAD_CONCURRENCY, urls.length || 1) }, worker));
	for (let index = 0; index < records.length; index += 1) {
		if (successful(records[index])) continue;
		records[index] = await recoverUrl(urls[index], recoveryTimeout, load);
	}
	return records;
}

async function recoverUrl(requestedUrl, timeout, load) {
	const candidates = movieAuthoredTextureCandidates(requestedUrl);
	let last = null;
	for (const candidate of candidates.urls) {
		last = await loadRecord(requestedUrl, candidate, candidates.family, timeout, load);
		if (successful(last)) return { ...last, recovered: true, substituted: candidate !== requestedUrl };
	}
	return last || { family: candidates.family, ok: false, requestedUrl, resolvedUrl: requestedUrl, url: requestedUrl };
}

async function loadRecord(requestedUrl, resolvedUrl, family, timeout, load) {
	try {
		const result = await load(resolvedUrl, timeout);
		return { ...result, family, requestedUrl, resolvedUrl, url: resolvedUrl };
	} catch (error) {
		return { error: error?.message || String(error), family, ok: false, requestedUrl, resolvedUrl, url: resolvedUrl };
	}
}

function successful(record) {
	return Boolean(record?.ok && usableImage(record.image));
}
