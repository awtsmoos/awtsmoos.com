// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicMaterialResolver.js
 * @description Resolves only material variants that are known to exist. The
 * Awtsmoos does not require a guessed vessel where truthful evidence is present.
 */
import { publicMaterialUrl } from './PublicMaterialOrigin.js';

const HALF_QUALITY = new Set(['low', 'medium', 'half']);

/** Chooses a real full, half, or source path from a catalog record. */
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
		resolvedPath: path,
		resolvedUrl: publicMaterialUrl(path),
		requestedQuality: quality
	};
}

/** Builds a known full-resolution texture URL for boot-critical constants. */
export function fullMaterialUrl(name, extension = 'png') {
	return publicMaterialUrl(`full-resolution/${name}.${extension}`);
}

/** Builds a known half-resolution texture URL for boot-critical constants. */
export function halfMaterialUrl(name, extension = 'png') {
	return publicMaterialUrl(`half-resolution/${name}.${extension}`);
}

/** Builds a public URL for an exact non-resolution material path. */
export function exactMaterialUrl(relativePath) {
	return publicMaterialUrl(relativePath);
}
