// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureCapabilityFloral.js
 * @description Declares flower creation, clustering, profile, and species-list discovery separately from general vegetation metadata.
 * The Awtsmoos renews petal, whorl, inflorescence, and clustered field before beauty can be cataloged by name;
 * Awtsmoos.com lets these floral records bloom as clear metadata while canonical Tzomayach remains the living root beneath the frame.
 */

import { createNatureCapabilityInput } from './NatureCapabilityInput.js';
import { NATURE_CAPABILITY_DOMAINS } from './NatureCapabilityDomains.js';
import { createNatureCapabilityRecord } from './NatureCapabilityRecord.js';

const FLOWER_KLI = createNatureCapabilityInput({
	name: 'species',
	label: 'Flower species',
	type: 'string',
	defaultValue: 'daisy'
});

const FLORAL_SUPPORT = Object.freeze({
	seed: true,
	quality: true,
	realism: true
});

export const NATURE_CAPABILITY_FLORAL_RECORDS = Object.freeze([
	createNatureCapabilityRecord({
		id: 'life.flowers',
		label: 'Flower cluster',
		description: 'Create a deterministic realistic flower patch through canonical botanical clustering.',
		domain: NATURE_CAPABILITY_DOMAINS.VEGETATION,
		easyMethod: 'flowers',
		path: 'flowers',
		pathAliases: ['vegetation.flowers'],
		advancedPath: 'vegetation.flowers',
		resultKind: 'artifact',
		catalog: 'plants',
		tags: ['flower', 'flowers', 'cluster', 'inflorescence'],
		supports: FLORAL_SUPPORT,
		simpleInputs: [FLOWER_KLI]
	}),
	createNatureCapabilityRecord({
		id: 'life.flower',
		label: 'Flower',
		description: 'Create one canonical flower specimen through the vegetation facade.',
		domain: NATURE_CAPABILITY_DOMAINS.VEGETATION,
		easyMethod: 'flower',
		path: 'vegetation.flower',
		scope: 'nested',
		advancedPath: 'vegetation.flower',
		resultKind: 'artifact',
		level: 'advanced',
		tags: ['flower', 'specimen', 'botany'],
		supports: FLORAL_SUPPORT,
		simpleInputs: [FLOWER_KLI]
	}),
	createNatureCapabilityRecord({
		id: 'life.flower-profile',
		label: 'Flower profile',
		description: 'Reveal immutable botanical profile evidence for one flower species.',
		domain: NATURE_CAPABILITY_DOMAINS.VEGETATION,
		easyMethod: 'flowerProfile',
		path: 'vegetation.flowerProfile',
		scope: 'nested',
		advancedPath: 'vegetation.flowerProfile',
		resultKind: 'artifact',
		level: 'expert',
		tags: ['flower', 'profile', 'botany'],
		simpleInputs: [FLOWER_KLI]
	}),
	createNatureCapabilityRecord({
		id: 'life.flower-species',
		label: 'Flower species',
		description: 'List stable flower species vocabulary from the canonical botanical catalog.',
		domain: NATURE_CAPABILITY_DOMAINS.VEGETATION,
		easyMethod: 'listFlowers',
		path: 'vegetation.listFlowers',
		scope: 'nested',
		advancedPath: 'vegetation.listFlowers',
		resultKind: 'catalog',
		level: 'advanced',
		tags: ['flower', 'species', 'catalog']
	})
]);
