// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureCapabilityWaterFlow.js
 * @description Describes river runtime, immutable reach, channel, and flow-preset discovery through the mature WaterFlowNatureApi contract.
 * The Awtsmoos renews current, bank, riffle, pool, and channel before a flow name can divide the stream;
 * Awtsmoos.com lets these records map proven water doors while morphology and solver law remain beneath one conserved gleam.
 */

import { createNatureCapabilityInput } from './NatureCapabilityInput.js';
import { NATURE_CAPABILITY_DOMAINS } from './NatureCapabilityDomains.js';
import { createNatureCapabilityRecord } from './NatureCapabilityRecord.js';

const RIVER_PRESET_KLI = createNatureCapabilityInput({
	name: 'preset',
	label: 'Flow preset',
	type: 'string',
	defaultValue: 'river'
});

const WATER_SUPPORT = Object.freeze({
	seed: true,
	quality: true,
	realism: true
});

export const NATURE_CAPABILITY_WATER_FLOW_RECORDS = Object.freeze([
	createNatureCapabilityRecord({
		id: 'water.river',
		label: 'River',
		description: 'Create one physically populated bounded river runtime from a named flow regime.',
		domain: NATURE_CAPABILITY_DOMAINS.WORLD,
		easyMethod: 'river',
		path: 'river',
		pathAliases: ['water.river'],
		advancedPath: 'water.river',
		resultKind: 'runtime',
		tags: ['river', 'water', 'flow', 'runtime'],
		supports: WATER_SUPPORT,
		simpleInputs: [RIVER_PRESET_KLI]
	}),
	createNatureCapabilityRecord({
		id: 'water.reach',
		label: 'River reach',
		description: 'Create immutable centerline, bank, morphology, and flow evidence without renderer geometry.',
		domain: NATURE_CAPABILITY_DOMAINS.WORLD,
		easyMethod: 'reach',
		path: 'water.reach',
		scope: 'nested',
		advancedPath: 'water.reach',
		resultKind: 'plan',
		level: 'advanced',
		tags: ['river', 'reach', 'banks', 'morphology'],
		supports: WATER_SUPPORT,
		simpleInputs: [RIVER_PRESET_KLI]
	}),
	createNatureCapabilityRecord({
		id: 'water.channel',
		label: 'Water channel',
		description: 'Create a generic bounded channel runtime using stream defaults unless another regime is authored.',
		domain: NATURE_CAPABILITY_DOMAINS.WORLD,
		easyMethod: 'channel',
		path: 'water.channel',
		scope: 'nested',
		advancedPath: 'water.channel',
		resultKind: 'runtime',
		level: 'advanced',
		tags: ['stream', 'channel', 'water', 'flow'],
		supports: WATER_SUPPORT
	}),
	createNatureCapabilityRecord({
		id: 'water.flow-presets',
		label: 'Flow presets',
		description: 'List stable named river and stream flow regimes.',
		domain: NATURE_CAPABILITY_DOMAINS.WORLD,
		easyMethod: 'presets',
		path: 'water.presets',
		scope: 'nested',
		advancedPath: 'water.presets',
		resultKind: 'catalog',
		level: 'advanced',
		tags: ['water', 'flow', 'preset', 'catalog']
	}),
	createNatureCapabilityRecord({
		id: 'water.flow-preset',
		label: 'Flow preset',
		description: 'Reveal immutable physical defaults for one named flow regime.',
		domain: NATURE_CAPABILITY_DOMAINS.WORLD,
		easyMethod: 'preset',
		path: 'water.preset',
		scope: 'nested',
		advancedPath: 'water.preset',
		resultKind: 'artifact',
		level: 'expert',
		tags: ['water', 'flow', 'preset', 'physics'],
		simpleInputs: [RIVER_PRESET_KLI]
	})
]);
