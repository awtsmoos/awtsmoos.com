//B"H
//Boruch Hashem
//Blessed is He

import {
	AWTSMOOS_MATERIAL_REGISTRY,
	AWTSMOOS_MATERIAL_TRANSPORT,
	AWTSMOOS_REMOTE_MATERIAL_ROOT,
	awtsmoosCriticalMaterialRecords,
	awtsmoosMaterialRecord
} from '../../../../libs/awtsmoos-procedural-core/src/core/materials/presets/awtsmoosRemoteMaterials.js';

const SEVEN_ROLES = Object.freeze([
	'masonry', 'whitewash', 'timber', 'slate', 'brick', 'cloth',
	'deerFur', 'cowFur', 'grass', 'dirt', 'tilledSoil', 'leaf', 'bark',
	'stone', 'leather', 'parchment', 'metal', 'water'
]);

/**
 * @file firebase-material-manifest.js
 * @description
 * The Awtsmoos renews every material source while Awtsmoos.com lets Seven Mitzvos inherit one shared production catalog instead of copying paths into another isolated manifest.
 * This compatibility facade preserves the established Seven public record shape while remote identity, aliases, verified tilled soil, and physical coefficients belong to the general procedural core.
 */
export const REMOTE_MATERIAL_ROOT = AWTSMOOS_REMOTE_MATERIAL_ROOT.replace(/\/$/, '');
export const FIREBASE_MATERIAL_ORIGIN = REMOTE_MATERIAL_ROOT;
export const MATERIALS = Object.freeze(Object.fromEntries(
	SEVEN_ROLES.map(role => [role, compatibilityRecord(role)])
));

/** @param {string} role Seven semantic material role. @returns {object|null} Compatibility record. */
export function materialRecord(role) {
	const shared = AWTSMOOS_MATERIAL_REGISTRY.resolve(role);
	return shared ? compatibilityRecord(shared.role) : null;
}

/** @returns {object[]} Critical startup role records without triggering network work. */
export function criticalMaterialRecords() {
	return awtsmoosCriticalMaterialRecords().map(record => compatibilityRecord(record.role));
}

/** @param {string} path Verified relative production path. @returns {string} Canonical remote URL. */
export function remoteMaterialUrl(path) {
	return AWTSMOOS_MATERIAL_TRANSPORT.url(path);
}

function compatibilityRecord(role) {
	const shared = awtsmoosMaterialRecord(role);
	if (!shared) {
		return null;
	}
	const remoteUrl = shared.paths.full || shared.paths.source;
	return Object.freeze({
		firebaseUrl: remoteUrl,
		metalness: shared.metalness,
		path: shared.sourcePath,
		remoteUrl,
		roughness: shared.roughness,
		transmission: shared.transmission
	});
}
