// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureCapabilityGroundcover.js
 * @description Describes plant patches, moss, vines, and renderer-neutral vegetation motion separately from the core plant/population/grass catalog.
 * The Awtsmoos renews groundcover, climbing vine, mossy stone, and wind-bent stem before any small green thing can seem alone;
 * Awtsmoos.com lets this Yesod-like family reveal low vegetation powers while Tzomayach remains the rooted authority from which they are grown.
 */

import { createNatureCapabilityInput } from './NatureCapabilityInput.js';
import { NATURE_CAPABILITY_DOMAINS } from './NatureCapabilityDomains.js';
import { createNatureCapabilityRecord } from './NatureCapabilityRecord.js';

const SPECIES_KLI = createNatureCapabilityInput({
	name: 'species',
	label: 'Species',
	type: 'string',
	required: true
});

const BOTANY_SUPPORT = Object.freeze({
	seed: true,
	quality: true,
	realism: true
});

/** Creates one nested low-vegetation record with shared deterministic support evidence. */
function groundcoverRecord(keliValues) {
	return createNatureCapabilityRecord({
		domain: NATURE_CAPABILITY_DOMAINS.VEGETATION,
		scope: 'nested',
		level: 'advanced',
		supports: BOTANY_SUPPORT,
		...keliValues
	});
}

export const NATURE_CAPABILITY_GROUNDCOVER_RECORDS = Object.freeze([
	groundcoverRecord({
		id: 'life.patch',
		label: 'Plant patch',
		description: 'Create one deterministic clustered patch of a canonical plant species.',
		easyMethod: 'patch',
		path: 'vegetation.patch',
		advancedPath: 'vegetation.patch',
		resultKind: 'artifact',
		tags: ['plant', 'patch', 'cluster', 'groundcover'],
		simpleInputs: [SPECIES_KLI]
	}),
	groundcoverRecord({
		id: 'life.moss',
		label: 'Moss patch',
		description: 'Create ecological moss coverage through the canonical vegetation facade.',
		easyMethod: 'moss',
		path: 'vegetation.moss',
		advancedPath: 'vegetation.moss',
		resultKind: 'artifact',
		tags: ['moss', 'groundcover', 'moisture', 'ecology']
	}),
	groundcoverRecord({
		id: 'life.vine',
		label: 'Vine',
		description: 'Create one canonical vine using the existing botanical climbing authority.',
		easyMethod: 'vine',
		path: 'vegetation.vine',
		pathAliases: ['vegetation.vines'],
		advancedPath: 'vegetation.vine',
		resultKind: 'artifact',
		tags: ['vine', 'climbing', 'plant', 'growth']
	}),
	groundcoverRecord({
		id: 'life.motion',
		label: 'Vegetation motion',
		description: 'Describe wind and plant motion intent without coupling botany to a renderer.',
		easyMethod: 'motion',
		path: 'vegetation.motion',
		advancedPath: 'vegetation.motion',
		resultKind: 'artifact',
		tags: ['plant', 'motion', 'wind', 'animation']
	})
]);
