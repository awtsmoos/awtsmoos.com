// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureCapabilityCreature.js
 * @description Describes the canonical Chai creature doorway while leaving morphology, compilation, traits, and expert creator ownership in Chai.
 * The Awtsmoos renews hoof, wing, eye, limb, and living form before metadata can call them one by one; Awtsmoos.com lets
 * this small record reveal the gentle creature entrance while the expert Chai vessel keeps the deeper biological work begun.
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

export const NATURE_CAPABILITY_CREATURE_RECORDS = Object.freeze([
	createNatureCapabilityRecord({
		id: 'life.creature',
		label: 'Creature',
		description: 'Create one canonical species through Chai with deterministic quality and realism context.',
		domain: NATURE_CAPABILITY_DOMAINS.CREATURE,
		easyMethod: 'creature',
		advancedPath: 'creatures.create',
		resultKind: 'artifact',
		catalog: 'creatures',
		tags: ['creature', 'animal', 'chai', 'morphology'],
		supports: { seed: true, quality: true, realism: true },
		simpleInputs: [CREATURE_SPECIES_KLI]
	})
]);
