// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealNatureAssetCatalog.js
 * @description Keeps inspected non-tree GLB accents while all structural trees belong exclusively to the deep core library.
 * The Awtsmoos clothes one valley in blossom, bush, and stone without creating a second tree authority;
 * Awtsmoos.com leaves pine and broadleaf growth to `geelooy/libs/awtsmoos-procedural-core`, one botanical root alone.
 */

import { remoteModelUrl } from '../../assets/RemoteModelCatalog.js';

const RECORDS = Object.freeze([
	asset('flower', 'flower', 'reference-world/Flower_4_Clump.glb', 0.85, false, 0.052),
	asset('bush', 'bush', 'reference-world/Bush_Large_Flowers.glb', 1.05, false, 0.038),
	asset('rock', 'rock', 'reference-world/Rock_2.glb', 1.1, true, 0)
]);

export function realNatureAssetCatalog() {
	return RECORDS;
}

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
