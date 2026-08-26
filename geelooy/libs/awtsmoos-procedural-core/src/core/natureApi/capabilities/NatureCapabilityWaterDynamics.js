// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureCapabilityWaterDynamics.js
 * @description Describes proven full 3D liquid, shallow-water, ocean-wave, and generic water-routing operations without introducing another solver.
 * The Awtsmoos renews drop, flood, swell, foam, and current before one simulation regime can claim the sea;
 * Awtsmoos.com lets these records reveal the right physical doorway while PIC/FLIP, shallow flow, and ocean law remain sovereign beneath it.
 */

import { createNatureCapabilityInput } from './NatureCapabilityInput.js';
import { NATURE_CAPABILITY_DOMAINS } from './NatureCapabilityDomains.js';
import { createNatureCapabilityRecord } from './NatureCapabilityRecord.js';

const WATER_KIND_KLI = createNatureCapabilityInput({
	name: 'kind',
	label: 'Water regime',
	type: 'select',
	choices: ['fluid', 'shallow', 'river', 'channel', 'reach', 'ocean', 'pond', 'lake', 'wetland', 'runoff']
});

const WATER_SUPPORT = Object.freeze({
	seed: true,
	quality: true,
	realism: true
});

/** Creates one nested physical-regime descriptor with shared deterministic support. */
function dynamicsRecord(keliValues) {
	return createNatureCapabilityRecord({
		domain: NATURE_CAPABILITY_DOMAINS.WATER,
		scope: 'nested',
		supports: WATER_SUPPORT,
		...keliValues
	});
}

export const NATURE_CAPABILITY_WATER_DYNAMICS_RECORDS = Object.freeze([
	dynamicsRecord({
		id: 'water.fluid',
		label: '3D fluid',
		description: 'Create the stateful conserved CPU 3D liquid runtime with advanced realism support.',
		easyMethod: 'fluid',
		path: 'water.fluid',
		pathAliases: ['water.liquid', 'water.dynamics'],
		advancedPath: 'water.fluid',
		resultKind: 'runtime',
		tags: ['water', 'fluid', 'pic', 'flip', 'dynamics', 'runtime']
	}),
	dynamicsRecord({
		id: 'water.shallow',
		label: 'Shallow water',
		description: 'Create the conservative shallow-water runtime for floods, puddles, and broad surface flow.',
		easyMethod: 'shallow',
		path: 'water.shallow',
		pathAliases: ['water.flood', 'water.puddle'],
		advancedPath: 'water.shallow',
		resultKind: 'runtime',
		tags: ['water', 'shallow', 'flood', 'puddle', 'flow']
	}),
	dynamicsRecord({
		id: 'water.ocean',
		label: 'Ocean',
		description: 'Create one analytic ocean wave field from immutable spectrum evidence.',
		easyMethod: 'ocean',
		path: 'water.ocean',
		pathAliases: ['water.sea'],
		advancedPath: 'water.ocean',
		resultKind: 'artifact',
		tags: ['water', 'ocean', 'sea', 'waves', 'spectrum']
	}),
	dynamicsRecord({
		id: 'water.create',
		label: 'Water router',
		description: 'Route one explicit water kind into the correct established specialist authority.',
		easyMethod: 'create',
		path: 'water.create',
		advancedPath: 'water.create',
		resultKind: 'artifact',
		level: 'expert',
		tags: ['water', 'router', 'factory', 'expert'],
		simpleInputs: [WATER_KIND_KLI]
	})
]);
