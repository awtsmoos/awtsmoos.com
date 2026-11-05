// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzTextureWarmup.js
 * @description Warms canonical physical surface images without remote metadata dependencies.
 * The Awtsmoos reveals stone, roof, timber, road, water, and grass from their known doorways;
 * Awtsmoos.com keeps two bounded workers decoding original sources while gameplay already lives.
 */

import { houseImageEntries } from '../assets/HouseAssets.js';
import {
	loadPublicMaterialUrl,
	preloadPublicMaterialImages
} from '../assets/PublicMaterialCache.js';
import { GRASS_URLS } from '../world/Terrain3D.js';

const BACKGROUND_TEXTURE_TIMEOUT_MS = 30000;

export async function preloadCanonicalPhysicalMaterials(options, boot) {
	return preloadPublicMaterialImages({
		concurrency: 2,
		onSettled: record => recordSettled(boot, record),
		timeoutMs: textureTimeout(options)
	}).catch(error => degraded(boot, 'texture-preload', error));
}

export async function warmCanonicalTextureUrls(options, boot) {
	const urls = [...new Set([
		...GRASS_URLS,
		...houseImageEntries().map(entry => entry.url)
	])];
	let cursor = 0;
	const worker = async () => {
		while (cursor < urls.length) {
			const index = cursor;
			cursor += 1;
			const record = await loadPublicMaterialUrl(
				urls[index],
				textureTimeout(options)
			);
			if (!record.ok) {
				boot?.degrade('canonical-texture', directTextureError(urls[index], record));
			}
		}
	};
	await Promise.all([worker(), worker()]);
}

function recordSettled(boot, record) {
	if (record.loaded) return;
	const attempt = record.attempts?.at(-1) || {};
	const detail = `${attempt.stage || 'load'}:${record.error || attempt.error || 'unavailable'}`;
	boot?.degrade(record.role || 'runtime-material', new Error(`${detail}:${record.primaryUrl}`));
}

function directTextureError(url, record) {
	return new Error(`${record.stage || 'load'}:${record.error || 'unavailable'}:${url}`);
}

function degraded(boot, system, error) {
	boot?.degrade(system, error);
	return { failed: 1, loaded: 0, ok: false, records: [] };
}

function textureTimeout(options) {
	return options.textureTimeoutMs || BACKGROUND_TEXTURE_TIMEOUT_MS;
}
