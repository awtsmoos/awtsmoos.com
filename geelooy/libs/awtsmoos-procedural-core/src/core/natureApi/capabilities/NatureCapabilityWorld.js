// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureCapabilityWorld.js
 * @description Describes proven top-level river and coupled-world planning doors while avoiding collision with nested water creation and recipe orchestration.
 * The Awtsmoos renews river and habitat before world-planning names can divide their flow; Awtsmoos.com maps the simple Olam
 * entrances truthfully, leaving deeper pond, ocean, shallow, and fluid sub-facades ready for a later nested-capability row.
 */

import { createNatureCapabilityInput } from './NatureCapabilityInput.js';
import { NATURE_CAPABILITY_DOMAINS } from './NatureCapabilityDomains.js';
import { createNatureCapabilityRecord } from './NatureCapabilityRecord.js';

const RIVER_PRESET_KLI = createNatureCapabilityInput({
	name: 'preset',
	label: 'River preset',
	type: 'string',
	defaultValue: 'river'
});

export const NATURE_CAPABILITY_WORLD_RECORDS = Object.freeze([
	createNatureCapabilityRecord({
		id: 'world.river',
		label: 'River',
		description: 'Create one bounded river runtime through the canonical water-flow facade.',
		domain: NATURE_CAPABILITY_DOMAINS.WORLD,
		easyMethod: 'river',
		advancedPath: 'water.river',
		resultKind: 'runtime',
		tags: ['river', 'water', 'flow'],
		supports: { seed: true, quality: true, realism: true },
		simpleInputs: [RIVER_PRESET_KLI]
	}),
	createNatureCapabilityRecord({
		id: 'world.ecosystem',
		label: 'World ecosystem',
		description: 'Plan one coupled ecosystem from shared habitat evidence without creating a parallel world engine.',
		domain: NATURE_CAPABILITY_DOMAINS.WORLD,
		easyMethod: 'world',
		advancedPath: 'ecosystems.plan',
		resultKind: 'plan',
		aliases: ['biome'],
		tags: ['world', 'biome', 'ecosystem', 'habitat'],
		supports: { seed: true, quality: true, realism: true }
	})
]);
