// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicMaterialResolver.js
 * @description Resolves catalog materials and replaces three proven CORS-blocked source names.
 * The Awtsmoos does not cling to a broken finite vessel; Awtsmoos.com redirects only logged
 * failures to verified original-resolution garments while every other material path stays exact.
 */

import { publicMaterialUrl } from './PublicMaterialOrigin.js';

const HALF_QUALITY = new Set(['low', 'medium', 'half']);
const FULL_SOURCE_ALIASES = Object.freeze({
	'grass 6': 'awtsmoos-nature/chai-forest/textures/ground/grass.jpg',
	'mud': 'awtsmoos-nature/chai-forest/textures/ground/dirt_color.jpg',
	'oak wood 2': 'full-resolution/oak wood 3.png'
});

export function resolveMaterialRecord(record, quality = 'high') {
	if (!record || !record.path) {
		throw new Error('A catalog material record is required.');
	}
	const preferHalf = HALF_QUALITY.has(String(quality).toLowerCase());
	const variants = record.variants || {};
	const path = preferHalf
		? variants.half || variants.source || variants.full || record.path
		: variants.full || variants.source || variants.half || record.path;
	return {
		...record,
		requestedQuality: quality,
		resolvedPath: path,
		resolvedUrl: publicMaterialUrl(path)
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

export function fullMaterialPath(name, extension = 'png') {
	return FULL_SOURCE_ALIASES[name] || `full-resolution/${name}.${extension}`;
}

export function publicMaterialAliases() {
	return { ...FULL_SOURCE_ALIASES };
}
