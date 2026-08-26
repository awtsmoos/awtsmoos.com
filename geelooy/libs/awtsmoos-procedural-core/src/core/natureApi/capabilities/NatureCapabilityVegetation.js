// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureCapabilityVegetation.js
 * @description Describes proven plant, grass, tree, forest, and flower-cluster doors above canonical Tzomayach and forest authorities.
 * The Awtsmoos renews root, blade, trunk, blossom, and forest before a catalog can divide their shade; Awtsmoos.com lets
 * progressive discovery reveal the existing botanical pathways while biology, ecology, motion, quality, and realism remain deeply made.
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

const TREE_PRESET_KLI = createNatureCapabilityInput({
	name: 'preset',
	label: 'Tree preset',
	type: 'string',
	required: true
});

const FLOWER_KLI = createNatureCapabilityInput({
	name: 'species',
	label: 'Flower species',
	type: 'string',
	defaultValue: 'daisy'
});

const BOTANY_SUPPORT = Object.freeze({ seed: true, quality: true, realism: true });

export const NATURE_CAPABILITY_VEGETATION_RECORDS = Object.freeze([
	createNatureCapabilityRecord({
		id: 'life.plant', label: 'Plant', domain: NATURE_CAPABILITY_DOMAINS.VEGETATION,
		description: 'Create one canonical botanical organism through Tzomayach.', easyMethod: 'plant',
		advancedPath: 'vegetation.plant', resultKind: 'artifact', catalog: 'plants', tags: ['plant', 'botany'],
		supports: BOTANY_SUPPORT, simpleInputs: [SPECIES_KLI]
	}),
	createNatureCapabilityRecord({
		id: 'life.flora', label: 'Flora population', domain: NATURE_CAPABILITY_DOMAINS.VEGETATION,
		description: 'Plan one deterministic botanical population with ecological patch structure.', easyMethod: 'flora',
		advancedPath: 'vegetation.population', resultKind: 'plan', catalog: 'plants', tags: ['flora', 'population', 'ecology'],
		supports: BOTANY_SUPPORT
	}),
	createNatureCapabilityRecord({
		id: 'life.grass', label: 'Grass field', domain: NATURE_CAPABILITY_DOMAINS.VEGETATION,
		description: 'Plan one ecological grass field through the canonical vegetation facade.', easyMethod: 'grass',
		advancedPath: 'vegetation.grass', resultKind: 'plan', catalog: 'plants', tags: ['grass', 'field', 'meadow'],
		supports: BOTANY_SUPPORT
	}),
	createNatureCapabilityRecord({
		id: 'life.tree', label: 'Tree', domain: NATURE_CAPABILITY_DOMAINS.VEGETATION,
		description: 'Generate one canonical tree through the one-skeleton forest facade.', easyMethod: 'tree',
		advancedPath: 'forests.tree', resultKind: 'artifact', catalog: 'trees', tags: ['tree', 'forest', 'canopy'],
		supports: BOTANY_SUPPORT, simpleInputs: [TREE_PRESET_KLI]
	}),
	createNatureCapabilityRecord({
		id: 'life.forest', label: 'Forest', domain: NATURE_CAPABILITY_DOMAINS.VEGETATION,
		description: 'Plan one habitat-aware forest with deterministic succession evidence.', easyMethod: 'forest',
		advancedPath: 'forests.plan', resultKind: 'plan', catalog: 'trees', tags: ['forest', 'habitat', 'succession'],
		supports: BOTANY_SUPPORT
	}),
	createNatureCapabilityRecord({
		id: 'life.flowers', label: 'Flower cluster', domain: NATURE_CAPABILITY_DOMAINS.VEGETATION,
		description: 'Create a deterministic realistic flower patch through canonical botanical clustering.', easyMethod: 'flowers',
		advancedPath: 'vegetation.flowers', resultKind: 'artifact', catalog: 'plants', tags: ['flower', 'flowers', 'cluster'],
		supports: BOTANY_SUPPORT, simpleInputs: [FLOWER_KLI]
	})
]);
