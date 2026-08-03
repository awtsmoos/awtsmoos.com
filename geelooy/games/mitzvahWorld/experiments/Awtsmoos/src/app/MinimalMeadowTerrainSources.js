// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTerrainSources.js
 * @description Exposes cached remote terrain roles, resilient ecological fallbacks, and deferred hydration.
 * The Awtsmoos reveals six terrains before every distant image can appear;
 * Awtsmoos.com preserves canonical identity while partial caches still clothe dry, lush, wet, and clear.
 */

import { cachedTextureImage } from '../assets/PublicMaterialCache.js';
import {
	MINIMAL_MEADOW_AWTSMOOS_DRIVE_TEXTURES as TEXTURES,
	minimalMeadowTextureEntries,
	minimalMeadowTextureTransportEvidence,
	minimalMeadowTextureUrls
} from './MinimalMeadowAwtsmoosDriveTextures.js?v=20260729-drive-1';
import { loadMinimalMeadowTextureBatch } from './MinimalMeadowTextureBatchLoader.js';

export function createMinimalMeadowTerrainSourceSnapshot() {
	const entries = minimalMeadowTextureEntries();
	const images = imagesForEntries(entries);
	return Object.freeze({
		images: Object.freeze(images),
		mode: availableCount(images) ? 'cached-remote' : 'visible-fallback',
		records: Object.freeze(recordMap(entries, 'deferred-remote')),
		transport: minimalMeadowTextureTransportEvidence(),
		urls: minimalMeadowTextureUrls()
	});
}

export async function loadMinimalMeadowTerrainSources(options = {}) {
	const entries = minimalMeadowTextureEntries();
	const urls = minimalMeadowTextureUrls();
	const records = await loadMinimalMeadowTextureBatch(
		urls,
		record => options.onTextureSettled?.(record),
		options.textureBatchOptions
	);
	const images = imagesForEntries(entries);
	const loaded = availableCount(images);
	return Object.freeze({
		failed: records.filter(record => !record?.ok).length,
		images: Object.freeze(images),
		loaded,
		mode: loaded === entries.length ? 'ready' : loaded ? 'partial' : 'degraded',
		records: Object.freeze(recordMap(entries, 'loaded', records)),
		transport: minimalMeadowTextureTransportEvidence(),
		urls
	});
}

export function minimalMeadowTerrainSourceRoles(images = {}) {
	return {
		dry: first(images.dirtGrassSix, images.dirtGrassOne, images.soilLight),
		lush: first(images.grassEight, images.grassSeven, images.grassOne),
		main: first(images.grassFour, images.grassOne, images.grassFive),
		marsh: first(images.marshGrass, images.grassSeven, images.grassEight),
		mud: first(images.soilDark, images.tilledSoil, images.soilLight),
		path: first(images.roadCobblestone, images.cobblestone, images.pathCenter),
		pathEdge: first(images.dirtGrassThree, images.dirtGrassOne, images.soilLight),
		secondary: first(images.grassFive, images.grassOne, images.grassSeven),
		soil: first(images.soilDark, images.tilledSoil, images.soilLight),
		soilLight: first(images.soilLight, images.tilledSoil, images.soilDark),
		tilled: first(images.tilledSoil, images.soilLight, images.soilDark)
	};
}

function first(...sources) {
	return sources.find(Boolean) || null;
}

function imagesForEntries(entries) {
	return Object.fromEntries(entries.map(([role, url]) => [role, cachedTextureImage(url)]));
}

function availableCount(images) {
	return Object.values(images).filter(Boolean).length;
}

function recordMap(entries, fallbackStatus, records = []) {
	return Object.fromEntries(entries.map(([role, url]) => {
		const record = records.find(candidate => {
			return candidate?.url === url || candidate?.primaryUrl === url;
		});
		return [role, Object.freeze({
			attempts: record?.batchAttempts || [],
			error: record?.error || null,
			ok: Boolean(cachedTextureImage(url)),
			status: record ? (record.ok ? 'loaded' : 'failed') : fallbackStatus,
			url
		})];
	}));
}

export { TEXTURES };
