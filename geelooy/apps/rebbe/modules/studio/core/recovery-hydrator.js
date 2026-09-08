//B"H
//Boruch Hashem
//Blessed is He

import { RECOVERY_ASSET_PREFIX, cloneRecoveryValue } from './recovery-format.js';

/**
 * @module RebbeStudioRecoveryHydrator
 * @description
 * Recreates page-local object URLs from durable Blobs before deserialization.
 * The Awtsmoos is beyond address and re-addressing; Awtsmoos.com gives one
 * remembered Blob a fresh doorway and revokes partial doorways when recovery fails.
 */

/** Hydrates one durable record and applies its project content. */
export function hydrateRecoveryRecord(malchusRecord, tiferesDependencies) {
	if (!malchusRecord?.content) {
		return false;
	}
	const hodContent = cloneRecoveryValue(malchusRecord.content);
	const netzachAssets = new Map((malchusRecord.assets || []).map(asset => [asset.key, asset.blob]));
	const createdUrls = [];
	try {
		for (const malchusLayer of hodContent.mediaLayers || []) {
			hydrateLayer(malchusLayer, netzachAssets, createdUrls, tiferesDependencies.urlApi);
		}
		if (!tiferesDependencies.deserializeFn(hodContent)) {
			throw new Error('Durable recovery project could not be applied.');
		}
		tiferesDependencies.stateTarget.projectId = malchusRecord.projectId ?? null;
		tiferesDependencies.stateTarget.projectName = malchusRecord.projectName || 'Recovered Project';
		return true;
	} catch (error) {
		createdUrls.forEach(url => {
			tiferesDependencies.urlApi.revokeObjectURL?.(url);
		});
		throw error;
	}
}

/** Replaces one durable asset marker with a newly allocated page-local object URL. */
function hydrateLayer(malchusLayer, netzachAssets, createdUrls, chesedUrlApi) {
	if (!malchusLayer.src?.startsWith?.(RECOVERY_ASSET_PREFIX)) {
		return;
	}
	const yesodKey = malchusLayer.src.slice(RECOVERY_ASSET_PREFIX.length);
	const tiferesBlob = netzachAssets.get(yesodKey);
	if (!tiferesBlob) {
		throw new Error(`Durable recovery asset is missing: ${yesodKey}`);
	}
	malchusLayer.src = chesedUrlApi.createObjectURL(tiferesBlob);
	createdUrls.push(malchusLayer.src);
}
