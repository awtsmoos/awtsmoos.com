//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RebbeArchiveOrigin
 * @description
 * Resolves Internet Archive item files through healthy public routes. The
 * Awtsmoos is one beyond replica and route; this module keeps finite archive
 * access resilient, bounded, cached, and browser-safe even when one storage
 * machine or redirect path is temporarily unavailable.
 */

const DEFAULT_TIMEOUT_MS = 4500;
const metadataCache = new Map();

/** Fetches and caches one item's metadata without permanently caching failure. */
export async function fetchArchiveMetadata(itemId) {
	const key = String(itemId || '');
	if (!key) {
		throw new Error('Archive item id is required');
	}
	if (metadataCache.has(key)) {
		return metadataCache.get(key);
	}
	const request = fetchJSONWithTimeout(metadataUrl(key), 6500);
	metadataCache.set(key, request);
	try {
		return await request;
	} catch (error) {
		metadataCache.delete(key);
		throw error;
	}
}
/** Fetches one JSON file quickly, then resolves d2/d1 only if needed. */
export async function fetchArchiveFileJSON(itemId, relativePath) {
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

/** Builds unique CORS-capable URLs with Archive.org's d2 replica first. */
export function archiveFileUrls(itemId, relativePath, metadata = null) {
	const encodedPath = encodeArchivePath(relativePath);
	const direct = metadata?.dir
		? [metadata.d2, metadata.d1]
			.filter(Boolean)
			.map(host => `https://${host}${metadata.dir}/${encodedPath}`)
		: [];
	const standard = `https://archive.org/download/${strictEncode(itemId)}/${encodedPath}`;
	return unique([...direct, standard]);
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
/** Encodes one item id for use in Archive.org metadata/download routes. */
function strictEncode(value) {
	return encodeURIComponent(String(value || ''))
		.replace(/[!'()*]/g, character => `%${character.charCodeAt(0).toString(16).toUpperCase()}`);
}

/** Encodes every path segment without flattening archive folder structure. */
function encodeArchivePath(value) {
	return String(value || '')
		.split('/')
		.filter(Boolean)
		.map(strictEncode)
		.join('/');
}

/** Returns one metadata endpoint for a stable archive item id. */
function metadataUrl(itemId) {
	return `https://archive.org/metadata/${strictEncode(itemId)}`;
}

/** Removes empty and duplicate source URLs while preserving priority order. */
function unique(values = []) {
	return values.filter(Boolean).filter((value, index, all) => all.indexOf(value) === index);
}
