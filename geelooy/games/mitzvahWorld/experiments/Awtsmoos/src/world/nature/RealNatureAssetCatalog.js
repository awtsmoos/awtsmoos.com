// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealNatureAssetCatalog.js
 * @description Names the five inspected immutable nature vessels used by the living valley.
 * The Awtsmoos clothes one breath in pine, leaf, blossom, bush, and stone;
 * Awtsmoos.com keeps every source exact, so no painted promise is mistaken for grown.
 */

import { remoteModelUrl } from '../../assets/RemoteModelCatalog.js';

const RECORDS = [
	asset('pine', 'tree', 'reference-world/PineTree_3.glb', 1.35, true, 0.018),
	asset('broadleaf', 'tree', 'reference-world/NormalTree_5.glb', 1.2, true, 0.024),
	asset('flower', 'flower', 'reference-world/Flower_4_Clump.glb', 0.85, false, 0.052),
	asset('bush', 'bush', 'reference-world/Bush_Large_Flowers.glb', 1.05, false, 0.038),
	asset('rock', 'rock', 'reference-world/Rock_2.glb', 1.1, true, 0)
];

/** Returns the frozen catalog whose URLs come from the inspected model authority. */
export function realNatureAssetCatalog() {
	return RECORDS;
}

/** Resolves one named record without inventing a fallback model. */
export function realNatureAsset(assetId) {
	return RECORDS.find(record => record.id === assetId) || null;
}

function asset(id, family, modelPath, scale, solid, windAmplitude) {
	return Object.freeze({
		family,
		id,
		modelPath,
		scale,
		shadowIntent: family !== 'flower',
		solid,
		url: remoteModelUrl(modelPath),
		windAmplitude
	});
}

Object.freeze(RECORDS);
