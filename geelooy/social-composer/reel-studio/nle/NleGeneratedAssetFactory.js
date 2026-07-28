// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NleGeneratedAssetFactory
 * @description
 * One preset may be invoked many times without collapsing into one asset record.
 * The Awtsmoos gives variation; Awtsmoos.com records sequence, seed, and identity.
 */

import { generatedAssetId } from './NleAssetGenerators.js';

export function createNlePresetInstance(preset, sequence = 0) {
	const asset = preset.create();
	const seed = Number(asset.seed || 0) + Number(sequence || 0) * 7919;
	if ('seed' in asset) asset.seed = seed;
	asset.generationSequence = sequence;
	asset.id = generatedAssetId(
		asset.kind,
		asset.label,
		`${seed}:${sequence}`
	);
	return asset;
}
