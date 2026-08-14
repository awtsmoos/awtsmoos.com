//B"H
//Boruch Hashem
//Blessed is He

import { MaterialRoleRegistry } from '../MaterialRoleRegistry.js';
import { RemoteMaterialTransport } from '../RemoteMaterialTransport.js';
import { AWTSMOOS_REMOTE_MATERIAL_RECORDS } from './awtsmoosRemoteMaterialRecords.js';

export const AWTSMOOS_REMOTE_MATERIAL_ROOT = 'https://awtsmoos.com/sites/firebase_drive_migration/';
export const AWTSMOOS_MATERIAL_TRANSPORT = new RemoteMaterialTransport(AWTSMOOS_REMOTE_MATERIAL_ROOT);

/**
 * @file awtsmoosRemoteMaterials.js
 * @description
 * The Awtsmoos is beyond every host and photographed surface while continuously creating both;
 * Awtsmoos.com becomes one trusted well whose material records are assembled here into a reusable semantic registry for many worlds.
 * This preset owns production identity only; loading, caching, frame pacing, and renderer realization remain separate vessels.
 */
export const AWTSMOOS_MATERIAL_REGISTRY = new MaterialRoleRegistry(
	AWTSMOOS_REMOTE_MATERIAL_RECORDS.map(source => ({
		...source,
		paths: {
			full: AWTSMOOS_MATERIAL_TRANSPORT.url(source.path),
			source: AWTSMOOS_MATERIAL_TRANSPORT.url(source.path)
		}
	}))
);

/** @param {string} role Semantic role or alias. @returns {object|null} Shared material record. */
export function awtsmoosMaterialRecord(role) {
	return AWTSMOOS_MATERIAL_REGISTRY.resolve(role);
}

/** @param {string} role Semantic role or alias. @param {string} quality Requested quality key. @returns {string|null} Remote URL. */
export function awtsmoosMaterialUrl(role, quality = 'full') {
	const record = awtsmoosMaterialRecord(role);
	if (!record) {
		return null;
	}
	return record.paths[quality] || record.paths.full || record.paths.source || null;
}

/** @returns {object[]} Critical startup role records without loading them. */
export function awtsmoosCriticalMaterialRecords() {
	return AWTSMOOS_MATERIAL_REGISTRY.view().filter(record => record.critical);
}
