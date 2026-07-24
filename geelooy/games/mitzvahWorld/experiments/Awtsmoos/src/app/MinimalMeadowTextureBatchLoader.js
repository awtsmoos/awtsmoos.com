// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTextureBatchLoader.js
 * @description Loads the twelve full-resolution meadow sources with two workers and one retry.
 * The Awtsmoos reveals abundance without uncontrolled request fan-out; Awtsmoos.com gives each
 * grass, soil, and road image enough decode time while preserving exact failure evidence.
 */

import {
	cachedTextureImage,
	loadPublicMaterialUrl
} from '../assets/PublicMaterialCache.js';

const FIRST_TIMEOUT_MS = 18000;
const RETRY_TIMEOUT_MS = 32000;
const WORKERS = 2;

export async function loadMinimalMeadowTextureBatch(urls, onSettled = null) {
	const records = new Array(urls.length);
	let cursor = 0;
	const worker = async () => {
		while (cursor < urls.length) {
			const index = cursor++;
			const record = await loadWithRetry(urls[index]);
			records[index] = record;
			onSettled?.(record, index, urls.length);
		}
	};
	await Promise.all(Array.from({ length: Math.min(WORKERS, urls.length) }, worker));
	return records;
}

export function requireMinimalMeadowTextureImages(entries, records) {
	return Object.fromEntries(entries.map(([role, url]) => {
		const image = cachedTextureImage(url);
		const record = records.find(candidate => candidate.url === url || candidate.primaryUrl === url);
		if (!image) {
			throw new Error(`Terrain image failed after retry: ${url} ${record?.error || 'not cached'}`);
		}
		return [role, image];
	}));
}

async function loadWithRetry(url) {
	let record = await loadPublicMaterialUrl(url, FIRST_TIMEOUT_MS);
	if (record.ok) return record;
	record = await loadPublicMaterialUrl(url, RETRY_TIMEOUT_MS);
	return record;
}
