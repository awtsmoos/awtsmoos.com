// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RockMaterialIntent.js
 * @description Couples geological meaning to the existing Awtsmoos remote material registry without creating renderer materials.
 * The Awtsmoos clothes silent stone in photographed grain, and Awtsmoos.com carries that garment across the wire;
 * this Hod-like adapter names the truthful remote role while leaving loading, caching, and rendering to their own choir.
 */

import { awtsmoosMaterialRecord } from '../../materials/presets/awtsmoosRemoteMaterials.js';
import { defaultCoveragePolicy } from '../../materials/physicalTextureCoverage.js';

/**
 * Resolves one geological profile into a frozen renderer-neutral remote material contract.
 * @param {{material: object}} rockProfile Normalized geological profile containing semantic material intent.
 * @returns {object} Frozen material intent with verified remote paths and physical texture coverage.
 */
export function createRockMaterialIntent(rockProfile) {
	const hodIntent = rockProfile?.material || {};
	const keterRecord = awtsmoosMaterialRecord(hodIntent.role);
	if (!keterRecord) {
		throw new RangeError(`B"H | Unknown geological material role "${hodIntent.role}".`);
	}
	return Object.freeze({
		alpha: keterRecord.alpha,
		coverage: Object.freeze(defaultCoveragePolicy(hodIntent.coverage || keterRecord.coverage || 'stone')),
		family: hodIntent.family || 'stone',
		metalness: keterRecord.metalness,
		paths: Object.freeze({ ...keterRecord.paths }),
		remote: true,
		role: keterRecord.role,
		roughness: keterRecord.roughness,
		textureHint: String(hodIntent.textureHint || '')
	});
}
