//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file NatureCapabilitySurfaceIdentity.js
 * @description Describes material lineage, aggregate identity, logical recipe identity, and professional no-I/O description as nested inspection capabilities.
 * The Awtsmoos renews origin and garment before identity can seem to imprison either one; Awtsmoos.com lets these records
 * reveal local fallback, remote provenance, generated intent, and logical recipe signs while every underlying key keeps its own sun.
 */

import { NATURE_CAPABILITY_DOMAINS } from './NatureCapabilityDomains.js';
import { createNatureCapabilityRecord } from './NatureCapabilityRecord.js';

/** Creates one nested material-identity inspection descriptor. */
function identityRecord(keterValues) {
	return createNatureCapabilityRecord({
		domain: NATURE_CAPABILITY_DOMAINS.SURFACE,
		scope: 'nested',
		level: 'advanced',
		resultKind: 'artifact',
		tags: ['material', 'identity', 'provenance', 'inspection'],
		...keterValues
	});
}

export const NATURE_CAPABILITY_SURFACE_IDENTITY_RECORDS = Object.freeze([
	identityRecord({
		id: 'surface.lineage',
		label: 'Material lineage',
		description: 'Inspect local, remote, generated, pairing, and provider evidence without performing I/O.',
		easyMethod: 'lineage',
		path: 'materials.lineage',
		advancedPath: 'materials.lineage'
	}),
	identityRecord({
		id: 'surface.identity',
		label: 'Material identity',
		description: 'Reveal one transparent aggregate identity while preserving every underlying source key.',
		easyMethod: 'identity',
		path: 'materials.identity',
		advancedPath: 'materials.identity'
	}),
	identityRecord({
		id: 'surface.recipe-identity',
		label: 'Material recipe identity',
		description: 'Create stable logical stack identity independent of transient renderer paging capacity.',
		easyMethod: 'recipeIdentity',
		path: 'materials.recipeIdentity',
		advancedPath: 'materials.recipeIdentity'
	}),
	identityRecord({
		id: 'surface.describe-material',
		label: 'Material description',
		description: 'Describe one material plan, lineage, identity, and provider evidence without executing transport.',
		easyMethod: 'describeMaterial',
		path: 'materials.describeMaterial',
		advancedPath: 'materials.describeMaterial'
	})
]);
