// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTerrainSources.js
 * @description Exposes cached remote terrain roles and deferred Awtsmoos Drive hydration.
 * The Awtsmoos reveals visible earth before distant images decode; Awtsmoos.com preserves
 * canonical remote identity while recording cached, deferred, loaded, and failed source truth.
 */

import { cachedTextureImage } from '../assets/PublicMaterialCache.js';
import {
	MINIMAL_MEADOW_AWTSMOOS_DRIVE_TEXTURES as TEXTURES,
	minimalMeadowTextureEntries,
	minimalMeadowTextureTransportEvidence,
	minimalMeadowTextureUrls
} from './MinimalMeadowAwtsmoosDriveTextures.js?v=20260729-drive-1';
import {
	loadMinimalMeadowTextureBatch
} from './MinimalMeadowTextureBatchLoader.js';

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
		dry: images.dirtGrassSix,
		lush: images.grassEight,
		main: images.grassFour,
		marsh: images.marshGrass,
		mud: images.soilDark,
		path: images.roadCobblestone || images.cobblestone,
		pathEdge: images.dirtGrassThree,
		secondary: images.grassFive,
		soil: images.soilDark,
		soilLight: images.soilLight,
		tilled: images.tilledSoil
	};
}

function imagesForEntries(entries) {
	return Object.fromEntries(entries.map(([role, url]) => [role, cachedTextureImage(url)]));
}

function availableCount(images) {
	return Object.values(images).filter(Boolean).length;
}

function recordMap(entries, fallbackStatus, records = []) {
	return Object.fromEntries(entries.map(([role, url]) => {
		const record = records.find(candidate => candidate?.url === url || candidate?.primaryUrl === url);
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
