//B"H
//Boruch Hashem
//Blessed is He

import { archiveFileUrls, archiveMetadataUrl } from './archive-url.js';

/**
 * @module RebbeArchiveOrigin
 * @description
 * Resolves Archive.org JSON through bounded public routes with metadata caching
 * and in-flight file deduplication. The Awtsmoos is one beyond replica and
 * request; Awtsmoos.com prevents repeated taps from multiplying identical IO
 * while still recovering automatically when one storage machine is unavailable.
 */

const DEFAULT_TIMEOUT_MS = 4500;
const metadataCache = new Map();
const fileInflight = new Map();

export { archiveFileUrls };

/** Fetches and caches one item's metadata without permanently caching failure. */
export async function fetchArchiveMetadata(itemId) {
	const key = String(itemId || '');
	if (!key) throw new Error('Archive item id is required');
	if (metadataCache.has(key)) return metadataCache.get(key);
	const request = fetchJSONWithTimeout(archiveMetadataUrl(key), 6500);
	metadataCache.set(key, request);
	try {
		return await request;
	} catch (error) {
		metadataCache.delete(key);
		throw error;
	}
}

/** Fetches one archive JSON file while coalescing identical concurrent requests. */
export async function fetchArchiveFileJSON(itemId, relativePath) {
	const key = `${itemId}/${relativePath}`;
	if (fileInflight.has(key)) return fileInflight.get(key);
	const request = resolveArchiveFileJSON(itemId, relativePath);
	fileInflight.set(key, request);
	try {
		return await request;
	} finally {
		fileInflight.delete(key);
	}
}

/** Tries the public download route quickly before resolving advertised replicas. */
async function resolveArchiveFileJSON(itemId, relativePath) {
	const standard = archiveFileUrls(itemId, relativePath)[0];
	try {
		return await fetchFirstJSON([standard], 2500);
	} catch {}
	let metadata = null;
	try {
		metadata = await fetchArchiveMetadata(itemId);
	} catch (error) {
		console.warn(`B"H archive metadata unavailable for ${itemId}; retrying public route.`, error);
	}
	return fetchFirstJSON(archiveFileUrls(itemId, relativePath, metadata));
}

/** Reads the first responsive JSON source with a hard per-origin deadline. */
export async function fetchFirstJSON(urls, timeoutMs = DEFAULT_TIMEOUT_MS) {
	let lastError = null;
	for (const url of unique(urls)) {
		try {
			return await fetchJSONWithTimeout(url, timeoutMs);
		} catch (error) {
			lastError = error;
		}
	}
	const error = new Error('Archive JSON unavailable from all known replicas');
	error.cause = lastError;
	throw error;
}

/** Fetches JSON with redirect support and an AbortController deadline. */
async function fetchJSONWithTimeout(url, timeoutMs) {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), timeoutMs);
	try {
		const response = await fetch(url, {
			signal: controller.signal,
			redirect: 'follow'
		});
		if (!response.ok) {
			throw new Error(`Archive transport ${response.status}: ${response.statusText}`);
		}
		return await response.json();
	} finally {
		clearTimeout(timer);
	}
}

/** Removes empty and duplicate URLs while preserving caller priority. */
function unique(values = []) {
	return values.filter(Boolean).filter((value, index, all) => all.indexOf(value) === index);
}
