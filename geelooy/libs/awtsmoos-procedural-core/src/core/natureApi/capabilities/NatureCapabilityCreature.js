// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureCapabilityCreature.js
 * @description Describes canonical Chai creation, population creation, species evidence, catalog listing, and expert creator access without duplicating creature compilation.
 * The Awtsmoos renews hoof, wing, eye, limb, trait, and living variation before a species can be named;
 * Awtsmoos.com lets these records reveal simple and expert Chai doors while the canonical creature authority remains one flame.
 */

import { createNatureCapabilityInput } from './NatureCapabilityInput.js';
import { NATURE_CAPABILITY_DOMAINS } from './NatureCapabilityDomains.js';
import { createNatureCapabilityRecord } from './NatureCapabilityRecord.js';

const CREATURE_SPECIES_KLI = createNatureCapabilityInput({
	name: 'speciesId',
	label: 'Creature species',
	type: 'string',
	required: true
});

const CHAI_SUPPORT = Object.freeze({
	seed: true,
	quality: true,
	realism: true
});

export const NATURE_CAPABILITY_CREATURE_RECORDS = Object.freeze([
	createNatureCapabilityRecord({
		id: 'life.creature',
		label: 'Creature',
		description: 'Create one canonical species through Chai with deterministic quality and realism context.',
		domain: NATURE_CAPABILITY_DOMAINS.CREATURE,
		easyMethod: 'creature',
		path: 'creature',
		pathAliases: ['creatures.create'],
		advancedPath: 'creatures.create',
		resultKind: 'artifact',
		catalog: 'creatures',
		tags: ['creature', 'animal', 'chai', 'morphology'],
		supports: CHAI_SUPPORT,
		simpleInputs: [CREATURE_SPECIES_KLI]
	}),
	createNatureCapabilityRecord({
		id: 'life.creature-many',
		label: 'Creature population',
		description: 'Create an ordered group of canonical creatures from explicit deterministic requests.',
		domain: NATURE_CAPABILITY_DOMAINS.CREATURE,
		easyMethod: 'createMany',
		path: 'creatures.createMany',
		scope: 'nested',
		advancedPath: 'creatures.createMany',
		resultKind: 'artifact[]',
		level: 'advanced',
		tags: ['creature', 'population', 'variation'],
		supports: CHAI_SUPPORT
	}),
	createNatureCapabilityRecord({
		id: 'life.creature-species',
		label: 'Creature species profile',
		description: 'Reveal canonical species evidence without creating a creature instance.',
		domain: NATURE_CAPABILITY_DOMAINS.CREATURE,
		easyMethod: 'species',
		path: 'creatures.species',
		scope: 'nested',
		advancedPath: 'creatures.species',
		resultKind: 'artifact',
		level: 'advanced',
		tags: ['creature', 'species', 'traits'],
		simpleInputs: [CREATURE_SPECIES_KLI]
	}),
	createNatureCapabilityRecord({
		id: 'life.creature-catalog',
		label: 'Creature catalog',
		description: 'List stable creature species identifiers from canonical Chai.',
		domain: NATURE_CAPABILITY_DOMAINS.CREATURE,
		easyMethod: 'listSpecies',
		path: 'creatures.listSpecies',
		scope: 'nested',
		advancedPath: 'creatures.listSpecies',
		resultKind: 'catalog',
		level: 'advanced',
		tags: ['creature', 'species', 'catalog']
	}),
	createNatureCapabilityRecord({
		id: 'life.creature-expert',
		label: 'Creature expert creator',
		description: 'Access the canonical expert CreatureCreator without creating a second compilation path.',
		domain: NATURE_CAPABILITY_DOMAINS.CREATURE,
		easyMethod: 'expert',
		path: 'creatures.expert',
		scope: 'nested',
		advancedPath: 'creatures.expert',
		resultKind: 'runtime',
		level: 'expert',
		tags: ['creature', 'creator', 'expert', 'morphology']
	})
]);
