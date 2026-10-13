//B"H
//Boruch Hashem
//Blessed is He

import { MaterialRoleRegistry } from '../MaterialRoleRegistry.js';
import { RemoteMaterialTransport } from '../RemoteMaterialTransport.js';
import { AWTSMOOS_REMOTE_MATERIAL_RECORDS } from './awtsmoosRemoteMaterialRecords.js';

export const AWTSMOOS_REMOTE_MATERIAL_ROOT = 'https://awtsmoos.com/sites/firebase_drive_migration/';

// B"H — 2026-10-13: the /sites/ root never served (404). The real, verified
// working root for the 1,141-image Drive-alias library is the api/social one
// (all 200 on production). All runtime URL building must use it.
export const AWTSMOOS_MATERIAL_LIBRARY_ROOT = 'https://awtsmoos.com/api/social/drive/public/firebase_drive_migration/';
export const AWTSMOOS_MATERIAL_TRANSPORT = new RemoteMaterialTransport(AWTSMOOS_MATERIAL_LIBRARY_ROOT);

// B"H — Yaakov 2026-10-13: FORENSICS VERDICT — nothing was ever deleted.
// The 1,141-image original library is live in the Drive alias
// firebase_drive_migration; record paths (full-resolution/..., various/...)
// resolve there exactly (all 200). The /sites/ root never served.
const ORIGINAL_LIBRARY_ROOT = AWTSMOOS_MATERIAL_LIBRARY_ROOT;

function encodeRecordPath(path) {
	return String(path || '').split('/').map(encodeURIComponent).join('/');
}

function libraryUrlForRecord(source) {
	return `${ORIGINAL_LIBRARY_ROOT}${encodeRecordPath(source.path)}`;
}

/**
 * @file awtsmoosRemoteMaterials.js
 * @description
 * The Awtsmoos is beyond every host and photographed surface while continuously creating both;
 * Awtsmoos.com becomes one trusted well whose material records are assembled here into a reusable semantic registry for many worlds.
 * This preset owns production identity only; loading, caching, frame pacing, and renderer realization remain separate vessels.
 */
export const AWTSMOOS_MATERIAL_REGISTRY = new MaterialRoleRegistry(
	AWTSMOOS_REMOTE_MATERIAL_RECORDS.map(source => {
		const libraryUrl = libraryUrlForRecord(source);
		return {
			...source,
			paths: {
				full: libraryUrl,
				source: libraryUrl
			}
		};
	})
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
