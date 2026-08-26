// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureCapabilityRock.js
 * @description Declares readable geology-first rock creation, field planning, and expert morphology capability records without duplicating Domem engines.
 * The Awtsmoos renews every stone before fracture, field, or form receives a name; Awtsmoos.com lets these descriptors reveal
 * the existing geological doors while mesh realization remains below, where matter may keep its own authority and flame.
 */

import { createNatureCapabilityInput } from './NatureCapabilityInput.js';
import { NATURE_CAPABILITY_DOMAINS } from './NatureCapabilityDomains.js';
import { createNatureCapabilityRecord } from './NatureCapabilityRecord.js';

const FIELDSTONE_KLI = createNatureCapabilityInput({
	name: 'preset',
	label: 'Rock preset',
	type: 'string',
	defaultValue: 'fieldstone'
});

const GEOLOGY_SUPPORT = Object.freeze({
	seed: true,
	quality: true,
	realism: true
});

export const NATURE_CAPABILITY_ROCK_RECORDS = Object.freeze([
	createNatureCapabilityRecord({
		id: 'matter.rock',
		label: 'Rock',
		description: 'Create one geology-first natural rock with preserved expert evidence.',
		domain: NATURE_CAPABILITY_DOMAINS.MATTER,
		easyMethod: 'rock',
		path: 'rock',
		advancedPath: 'rocks.create',
		resultKind: 'artifact',
		tags: ['rock', 'geology', 'stone'],
		supports: GEOLOGY_SUPPORT,
		simpleInputs: [FIELDSTONE_KLI]
	}),
	createNatureCapabilityRecord({
		id: 'matter.rock-field',
		label: 'Rock field',
		description: 'Plan one deterministic geology-aware field without eagerly realizing every rock mesh.',
		domain: NATURE_CAPABILITY_DOMAINS.MATTER,
		easyMethod: 'rockField',
		path: 'rockField',
		advancedPath: 'rocks.field',
		resultKind: 'plan',
		level: 'advanced',
		tags: ['rocks', 'field', 'geology', 'placement'],
		supports: GEOLOGY_SUPPORT
	}),
	createNatureCapabilityRecord({
		id: 'matter.rock-morphology',
		label: 'Rock morphology',
		description: 'Reveal expert deterministic morphology without creating a parallel rock generator.',
		domain: NATURE_CAPABILITY_DOMAINS.MATTER,
		easyMethod: 'rockMorphology',
		path: 'rockMorphology',
		advancedPath: 'rocks.morphology',
		resultKind: 'artifact',
		level: 'expert',
		tags: ['rock', 'morphology', 'expert'],
		supports: GEOLOGY_SUPPORT,
		simpleInputs: [FIELDSTONE_KLI]
	})
]);
