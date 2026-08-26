// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureCapabilityVegetation.js
 * @description Describes canonical plant, population, grass, patch, moss, vine, and motion operations without duplicating Tzomayach generation authority.
 * The Awtsmoos renews root, blade, moss, vine, and wind-touched stem before metadata can divide their green light;
 * Awtsmoos.com lets these records reveal the existing botanical doors while ecology and geometry remain beneath one truthful rite.
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

/** Creates one nested Tzomayach capability record with shared deterministic support evidence. */
function nestedVegetationRecord(keliValues) {
	return createNatureCapabilityRecord({
		domain: NATURE_CAPABILITY_DOMAINS.VEGETATION,
		scope: 'nested',
		level: 'advanced',
		supports: BOTANY_SUPPORT,
		...keliValues
	});
}

export const NATURE_CAPABILITY_VEGETATION_RECORDS = Object.freeze([
	createNatureCapabilityRecord({
		id: 'life.plant',
		label: 'Plant',
		description: 'Create one canonical botanical organism through Tzomayach.',
		domain: NATURE_CAPABILITY_DOMAINS.VEGETATION,
		easyMethod: 'plant',
		path: 'plant',
		pathAliases: ['vegetation.plant'],
		advancedPath: 'vegetation.plant',
		resultKind: 'artifact',
		catalog: 'plants',
		tags: ['plant', 'botany', 'tzomayach'],
		supports: BOTANY_SUPPORT,
		simpleInputs: [SPECIES_KLI]
	}),
	createNatureCapabilityRecord({
		id: 'life.flora',
		label: 'Flora population',
		description: 'Plan one deterministic botanical population with ecological patch structure.',
		domain: NATURE_CAPABILITY_DOMAINS.VEGETATION,
		easyMethod: 'flora',
		path: 'flora',
		pathAliases: ['vegetation.population'],
		advancedPath: 'vegetation.population',
		resultKind: 'plan',
		catalog: 'plants',
		tags: ['flora', 'population', 'ecology'],
		supports: BOTANY_SUPPORT
	}),
	createNatureCapabilityRecord({
		id: 'life.grass',
		label: 'Grass field',
		description: 'Plan one ecological grass field through the canonical vegetation facade.',
		domain: NATURE_CAPABILITY_DOMAINS.VEGETATION,
		easyMethod: 'grass',
		path: 'grass',
		pathAliases: ['vegetation.grass'],
		advancedPath: 'vegetation.grass',
		resultKind: 'plan',
		catalog: 'plants',
		tags: ['grass', 'field', 'meadow', 'ecology'],
		supports: BOTANY_SUPPORT
	}),
	nestedVegetationRecord({
		id: 'life.patch',
		label: 'Plant patch',
		description: 'Create one deterministic clustered patch of a canonical plant species.',
		easyMethod: 'patch',
		path: 'vegetation.patch',
		advancedPath: 'vegetation.patch',
		resultKind: 'artifact',
		simpleInputs: [SPECIES_KLI]
	}),
	nestedVegetationRecord({
		id: 'life.moss',
		label: 'Moss patch',
		description: 'Create ecological moss coverage through the canonical vegetation facade.',
		easyMethod: 'moss',
		path: 'vegetation.moss',
		advancedPath: 'vegetation.moss',
		resultKind: 'artifact'
	}),
	nestedVegetationRecord({
		id: 'life.vine',
		label: 'Vine',
		description: 'Create one canonical vine using the existing botanical climbing authority.',
		easyMethod: 'vine',
		path: 'vegetation.vine',
		pathAliases: ['vegetation.vines'],
		advancedPath: 'vegetation.vine',
		resultKind: 'artifact'
	}),
	nestedVegetationRecord({
		id: 'life.motion',
		label: 'Vegetation motion',
		description: 'Describe wind and plant motion intent without coupling botany to a renderer.',
		easyMethod: 'motion',
		path: 'vegetation.motion',
		advancedPath: 'vegetation.motion',
		resultKind: 'artifact'
	})
]);
