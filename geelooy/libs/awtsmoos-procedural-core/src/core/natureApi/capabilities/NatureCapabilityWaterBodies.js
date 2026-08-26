// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureCapabilityWaterBodies.js
 * @description Describes semantic pond, lake, wetland, runoff, and generic water-body planning through the existing WaterNatureApi body authority.
 * The Awtsmoos renews basin, shore, marsh, runoff, and gathered water before hydrology can divide their names;
 * Awtsmoos.com lets these records reveal ecological water intent while one canonical body planner keeps geometry and influence in frame.
 */

import { createNatureCapabilityInput } from './NatureCapabilityInput.js';
import { NATURE_CAPABILITY_DOMAINS } from './NatureCapabilityDomains.js';
import { createNatureCapabilityRecord } from './NatureCapabilityRecord.js';

const BODY_KIND_KLI = createNatureCapabilityInput({
	name: 'kind',
	label: 'Water body kind',
	type: 'select',
	choices: ['pond', 'lake', 'wetland', 'runoff'],
	defaultValue: 'pond'
});

const BODY_SUPPORT = Object.freeze({
	seed: true,
	quality: true,
	realism: true
});

/** Creates one nested semantic body descriptor with shared support evidence. */
function bodyRecord(keliValues) {
	return createNatureCapabilityRecord({
		domain: NATURE_CAPABILITY_DOMAINS.WATER,
		scope: 'nested',
		resultKind: 'plan',
		supports: BODY_SUPPORT,
		...keliValues
	});
}

export const NATURE_CAPABILITY_WATER_BODY_RECORDS = Object.freeze([
	bodyRecord({
		id: 'water.body',
		label: 'Water body',
		description: 'Plan one semantic basin using the canonical body authority and explicit body kind.',
		easyMethod: 'body',
		path: 'water.body',
		advancedPath: 'water.body',
		level: 'advanced',
		tags: ['water', 'body', 'basin', 'hydrology'],
		simpleInputs: [BODY_KIND_KLI]
	}),
	bodyRecord({
		id: 'water.pond',
		label: 'Pond',
		description: 'Plan a compact irregular pond with shore and wetland influence evidence.',
		easyMethod: 'pond',
		path: 'water.pond',
		advancedPath: 'water.pond',
		tags: ['water', 'pond', 'basin', 'shore']
	}),
	bodyRecord({
		id: 'water.lake',
		label: 'Lake',
		description: 'Plan a larger irregular lake through the same semantic basin authority.',
		easyMethod: 'lake',
		path: 'water.lake',
		advancedPath: 'water.lake',
		tags: ['water', 'lake', 'basin', 'shore']
	}),
	bodyRecord({
		id: 'water.wetland',
		label: 'Wetland',
		description: 'Plan wetland water extent, fringe, and ecological moisture influence.',
		easyMethod: 'wetland',
		path: 'water.wetland',
		advancedPath: 'water.wetland',
		tags: ['water', 'wetland', 'marsh', 'ecology']
	}),
	bodyRecord({
		id: 'water.runoff',
		label: 'Runoff',
		description: 'Plan runoff-oriented water behavior through the established semantic water routing path.',
		easyMethod: 'runoff',
		path: 'water.runoff',
		advancedPath: 'water.runoff',
		level: 'advanced',
		tags: ['water', 'runoff', 'drainage', 'hydrology']
	})
]);
