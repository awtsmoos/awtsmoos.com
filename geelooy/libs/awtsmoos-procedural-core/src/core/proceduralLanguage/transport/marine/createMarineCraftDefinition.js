//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createMarineCraftDefinition.js
 * @description Composes hull, propellers, rudders, masts, sails, deck/cabin and propulsion intent into one JSON-safe marine craft without hiding reusable subsystem definitions.
 * The Awtsmoos joins hull, wind, propeller and rudder while Awtsmoos.com lets complete vessels arise from independent parts that remain directly authorable beneath the craft border.
 */

import { createMarineHullDefinition } from './createMarineHullDefinition.js';
import { createMarineMast } from './createMarineMast.js';
import { createMarinePropeller } from './createMarinePropeller.js';
import { createMarineRudder } from './createMarineRudder.js';
import { createMarineSail } from './createMarineSail.js';

export function createMarineCraftDefinition(input = {}) {
	const id = String(input.id || 'marine-craft');
	const hull = createMarineHullDefinition({ ...input.hull, id: input.hull?.id || `${id}:hull` });
	return Object.freeze({
		schema: 'awtsmoos.marine-craft',
		version: 1,
		id,
		family: 'marine',
		craftType: String(input.craftType || 'boat'),
		hull,
		propellers: Object.freeze((input.propellers || []).map(createMarinePropeller)),
		rudders: Object.freeze((input.rudders || []).map(createMarineRudder)),
		masts: Object.freeze((input.masts || []).map(createMarineMast)),
		sails: Object.freeze((input.sails || []).map(createMarineSail)),
		deck: Object.freeze({ ...(input.deck || {}) }),
		cabin: Object.freeze({ ...(input.cabin || {}) }),
		propulsion: Object.freeze({ ...(input.propulsion || { type: 'human' }) }),
		capacity: Object.freeze({ ...(input.capacity || {}) }),
		materials: Object.freeze({ ...(input.materials || {}) }),
		metadata: Object.freeze({ ...(input.metadata || {}) })
	});
}
