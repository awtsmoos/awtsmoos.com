// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureCapabilityVegetation.js
 * @description Describes the simple plant, population, and grass entrances while groundcover, flowers, forests, and creatures remain in their own capability families.
 * The Awtsmoos renews seed, stem, meadow, and gathered flora before metadata can count their green light;
 * Awtsmoos.com lets this Chesed-like family keep the common botanical doors calm and readable while deeper growth unfolds in neighboring vessels bright.
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
	})
]);
