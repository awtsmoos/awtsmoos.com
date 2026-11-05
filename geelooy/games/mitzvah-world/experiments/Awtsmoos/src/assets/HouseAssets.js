// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HouseAssets.js
 * @description Loads verified house textures with conservative concurrency and a sequential semantic recovery pass.
 * The Awtsmoos renews wall, stone, wood, and earth beyond every finite delay;
 * Awtsmoos.com first opens two distant doors, then revisits any missing real surface alone so contention never masquerades as absence.
 */

import { HOUSE_TEXTURE_CANDIDATES, houseTextureCandidateEntries } from './HouseTextureCandidates.js';

export const HOUSE_TEXTURE_LOAD_CONCURRENCY = 2;
export const HOUSE_TEXTURE_CANDIDATE_TIMEOUT_MS = 30000;
export const HOUSE_TEXTURE_RECOVERY_TIMEOUT_MS = 45000;

export async function loadHouseAssets(loadFirstImage) {
	if (typeof loadFirstImage !== 'function') throw new TypeError('House asset loading requires an image loader function.');
	const firstPass = await mapWithConcurrency(
		HOUSE_TEXTURE_CANDIDATES,
		HOUSE_TEXTURE_LOAD_CONCURRENCY,
		definition => loadPreferredEntry(definition, loadFirstImage, HOUSE_TEXTURE_CANDIDATE_TIMEOUT_MS)
	);
	const records = await recoverMissingEntries(firstPass, loadFirstImage);
	const assets = Object.fromEntries(records.map(record => [record.key, record.image]));
	assets.brickImage = assets.whiteBrickImage;
	assets.lavaImage = assets.redBrickImage;
	assets.terrainDirtImages = [assets.dirt1Image, assets.dirt2Image, assets.dirtGrass1Image, assets.dirtGrass2Image, assets.terrainMixImage];
	assets.houseMaterialDegradation = records.filter(record => !record.image).map(({ error, key, kind, url, urls }) => ({ error, key, kind, url, urls }));
	assets.houseMaterialRecovery = records.filter(record => record.recovered).map(({ key, kind, url }) => ({ key, kind, url }));
	assets.publicUrls = Object.fromEntries(HOUSE_TEXTURE_CANDIDATES.map(definition => [definition.kind, definition.url]));
	return assets;
}

export function houseImageEntries() {
	return houseTextureCandidateEntries();
}

async function recoverMissingEntries(records, loadFirstImage) {
	const output = [...records];
	for (let index = 0; index < output.length; index += 1) {
		if (output[index].image) continue;
		const recovered = await loadPreferredEntry(HOUSE_TEXTURE_CANDIDATES[index], loadFirstImage, HOUSE_TEXTURE_RECOVERY_TIMEOUT_MS);
		output[index] = recovered.image ? { ...recovered, recovered: true } : recovered;
	}
	return output;
}

async function loadPreferredEntry(definition, loadFirstImage, timeoutMs) {
	let image = null;
	let error = null;
	try {
		image = await loadFirstImage(definition.urls, timeoutMs);
	} catch (caught) {
		error = caught?.message || String(caught);
	}
	if (!validImage(image)) image = null;
	if (image) tagImage(image, definition);
	return { ...definition, error: image ? null : error || 'unavailable', image };
}

async function mapWithConcurrency(values, concurrency, action) {
	const results = new Array(values.length);
	let cursor = 0;
	const worker = async () => {
		while (cursor < values.length) {
			const index = cursor++;
			results[index] = await action(values[index]);
		}
	};
	await Promise.all(Array.from({ length: Math.min(concurrency, values.length) }, worker));
	return results;
}

function validImage(image) {
	if (!image) return false;
	const width = image.naturalWidth ?? image.videoWidth ?? image.width;
	const height = image.naturalHeight ?? image.videoHeight ?? image.height;
	return Number(width) > 0 && Number(height) > 0;
}

function tagImage(image, definition) {
	try {
		if (!image.dataset) return;
		image.dataset.AwtsmoosTextureKind = definition.kind;
		image.dataset.requestedAlias = definition.url;
	} catch {}
}
