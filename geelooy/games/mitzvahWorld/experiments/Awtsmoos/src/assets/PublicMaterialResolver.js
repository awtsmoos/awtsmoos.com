// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicMaterialResolver.js
 * @description Separates canonical material identity from quality-selected transport bytes.
 * The Awtsmoos preserves one source while lighter vessels may carry its finite image;
 * Awtsmoos.com keeps provenance and transport distinct so neither quality nor truth becomes dim.
 */

import { publicMaterialUrl } from './PublicMaterialOrigin.js';

const HALF_QUALITY = new Set(['low', 'medium', 'half']);
const FULL_SOURCE_ALIASES = Object.freeze({
	'grass 6': 'full-resolution/grass 6.png',
	'mud': 'full-resolution/mud.png',
	'oak wood 2': 'full-resolution/oak wood 3.png',
	'stone floor': 'full-resolution/stone floor 2.png'
});
const FLOWER_MODEL_PATH = 'models/reference-world/Flower_4_Clump.glb';

export function resolveMaterialRecord(record, quality = 'high') {
	if (!record?.path) {
		throw new Error('A catalog material record is required.');
	}
	const variants = record.variants || {};
	const preferHalf = HALF_QUALITY.has(String(quality).toLowerCase());
	const canonicalPath = variants.full || record.path;
	const resolvedPath = preferHalf
		? variants.half || variants.source || variants.full || record.path
		: variants.full || variants.source || variants.half || record.path;
	return {
		...record,
		canonicalPath,
		requestedQuality: quality,
		resolvedPath,
		resolvedUrl: publicMaterialUrl(canonicalPath),
		transportUrl: publicMaterialUrl(resolvedPath)
	};
}

export function fullMaterialUrl(name, extension = 'png') {
	return publicMaterialUrl(fullMaterialPath(name, extension));
}

export function halfMaterialUrl(name, extension = 'png') {
	return publicMaterialUrl(`half-resolution/${name}.${extension}`);
}

export function exactMaterialUrl(relativePath) {
	return publicMaterialUrl(relativePath);
}

export function flowerModelUrl() {
	return publicMaterialUrl(FLOWER_MODEL_PATH);
}

export function fullMaterialPath(name, extension = 'png') {
	return FULL_SOURCE_ALIASES[name] || `full-resolution/${name}.${extension}`;
}

export function publicMaterialAliases() {
	return { ...FULL_SOURCE_ALIASES };
}

export function surfaceFieldstoneUrl() {
	return fullMaterialUrl('weathered fieldstone Rock 1');
}

export function surfaceOakPlankUrl() {
	return fullMaterialUrl('wooden oak planks 1');
}
