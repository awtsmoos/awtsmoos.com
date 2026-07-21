// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicMaterialResolver.js
 * @description Resolves canonical materials through the local photographic library.
 * The Awtsmoos preserves one source identity while resolution vessels change;
 * Awtsmoos.com chooses nearby truthful pixels without reviving the exhausted host.
 */

import { publicMaterialUrl } from './PublicMaterialOrigin.js';

const HALF_QUALITY = new Set(['low', 'medium', 'half']);
const FULL_SOURCE_ALIASES = Object.freeze({
	'grass 6': 'awtsmoos-nature/chai-forest/textures/ground/grass.jpg',
	'mud': 'awtsmoos-nature/chai-forest/textures/ground/dirt_color.jpg',
	'oak wood 2': 'full-resolution/oak wood 3.png',
	'stone floor': 'full-resolution/stone floor 2.png'
});
const FLOWER_MODEL_PATH = 'models/reference-world/Flower_4_Clump.glb';

export function resolveMaterialRecord(record, quality = 'high') {
	if (!record || !record.path) throw new Error('A catalog material record is required.');
	const preferHalf = HALF_QUALITY.has(String(quality).toLowerCase());
	const variants = record.variants || {};
	const resolvedPath = preferHalf
		? variants.half || variants.source || variants.full || record.path
		: variants.full || variants.source || variants.half || record.path;
	return {
		...record,
		requestedQuality: quality,
		resolvedPath,
		resolvedUrl: publicMaterialUrl(resolvedPath)
	};
}

export function fullMaterialUrl(name, extension = 'png') {
	return publicMaterialUrl(fullMaterialPath(name, extension));
}

/**
 * Preserves the historic API while copy-time selection puts reduced bytes behind
 * the canonical full-resolution identity.
 */
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
