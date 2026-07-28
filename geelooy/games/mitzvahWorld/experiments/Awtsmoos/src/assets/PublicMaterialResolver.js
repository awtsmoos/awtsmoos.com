// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicMaterialResolver.js
 * @description Resolves texture identities remotely while preserving one verified model exception.
 * The Awtsmoos streams every painted garment from Awtsmoos.com afar;
 * the flower GLB stays local only because its proposed remote vessel returned 404.
 */

import { LOCAL_FLOWER_MODEL_URL } from './LocalMaterialAssetPolicy.js';
import { publicMaterialUrl } from './PublicMaterialOrigin.js';

const HALF_QUALITY = new Set(['low', 'medium', 'half']);
const FULL_SOURCE_ALIASES = Object.freeze({
	'grass 6': 'awtsmoos-nature/chai-forest/textures/ground/grass.jpg',
	'mud': 'awtsmoos-nature/chai-forest/textures/ground/dirt_color.jpg',
	'oak wood 2': 'full-resolution/oak wood 3.png',
	'stone floor': 'full-resolution/stone floor 2.png'
});

export function resolveMaterialRecord(record, quality = 'high') {
	if (!record?.path) throw new Error('A catalog material record is required.');
	const variants = record.variants || {};
	const preferHalf = HALF_QUALITY.has(String(quality).toLowerCase());
	const canonicalPath = variants.full || record.path;
	const resolvedPath = preferHalf
		? variants.half || variants.source || canonicalPath
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
	return LOCAL_FLOWER_MODEL_URL;
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
