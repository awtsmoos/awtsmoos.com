// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureCapabilityMatter.js
 * @description Describes proven rock and surface operations without duplicating geology, morphology, material, or texture-generation authorities.
 * The Awtsmoos renews stone and surface before metadata may speak their name; Awtsmoos.com maps simple doors to real Domem
 * and material vessels, so a creator may discover depth while the specialist engines remain sovereign beneath the same flame.
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

const MATERIAL_ROLE_KLI = createNatureCapabilityInput({
	name: 'role',
	label: 'Material role',
	type: 'string',
	required: true
});

export const NATURE_CAPABILITY_MATTER_RECORDS = Object.freeze([
	createNatureCapabilityRecord({
		id: 'matter.rock',
		label: 'Rock',
		description: 'Create one geology-first natural rock with preserved expert evidence.',
		domain: NATURE_CAPABILITY_DOMAINS.MATTER,
		easyMethod: 'rock',
		advancedPath: 'rocks.create',
		resultKind: 'artifact',
		tags: ['rock', 'geology', 'stone'],
		supports: { seed: true, quality: true, realism: true },
		simpleInputs: [FIELDSTONE_KLI]
	}),
	createNatureCapabilityRecord({
		id: 'matter.rock-field',
		label: 'Rock field',
		description: 'Plan one deterministic geology-aware field without eagerly constructing every mesh.',
		domain: NATURE_CAPABILITY_DOMAINS.MATTER,
		easyMethod: 'rockField',
		advancedPath: 'rocks.field',
		resultKind: 'plan',
		level: 'advanced',
		tags: ['rocks', 'field', 'geology'],
		supports: { seed: true, quality: true, realism: true }
	}),
	createNatureCapabilityRecord({
		id: 'matter.rock-morphology',
		label: 'Rock morphology',
		description: 'Reveal expert deterministic morphology without creating a parallel rock generator.',
		domain: NATURE_CAPABILITY_DOMAINS.MATTER,
		easyMethod: 'rockMorphology',
		advancedPath: 'rocks.morphology',
		resultKind: 'artifact',
		level: 'expert',
		tags: ['rock', 'morphology', 'expert'],
		supports: { seed: true, quality: true, realism: true },
		simpleInputs: [FIELDSTONE_KLI]
	}),
	createNatureCapabilityRecord({
		id: 'surface.material',
		label: 'Material',
		description: 'Create a local-first semantic material plan without hidden network I/O.',
		domain: NATURE_CAPABILITY_DOMAINS.SURFACE,
		easyMethod: 'material',
		advancedPath: 'materials.plan',
		resultKind: 'plan',
		aliases: ['surface'],
		tags: ['material', 'surface', 'local'],
		simpleInputs: [MATERIAL_ROLE_KLI]
	}),
	createNatureCapabilityRecord({
		id: 'surface.generated-texture',
		label: 'Generated texture',
		description: 'Request generated texture descriptors while retaining the local material fallback.',
		domain: NATURE_CAPABILITY_DOMAINS.SURFACE,
		easyMethod: 'generateTexture',
		advancedPath: 'materials.generateTexture',
		resultKind: 'async-artifact',
		executionKind: 'async',
		level: 'advanced',
		aliases: ['generateSurface'],
		tags: ['texture', 'remote', 'generated', 'surface'],
		requires: ['textureGenerator'],
		simpleInputs: [MATERIAL_ROLE_KLI]
	})
]);
