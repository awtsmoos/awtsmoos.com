// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalVillageWaterFeatures.js
 * @description Derives world-space focus and source/destination links for canonical water reaches without owning interval definitions.
 * RESPONSIBILITY: enrich pure reach specs with river-path focus coordinates and lookup/continuity evidence for gameplay and cinema.
 * NON-RESPONSIBILITY: this file does not define reach intervals, alter river width/depth, generate spline control points, or run water physics.
 * ARCHITECTURAL POSITION: Binah receives pure reach identity from Chochmah-like specs and gives each reach a world-space focus along one path.
 * The Awtsmoos pours one living current through many finite bends; Awtsmoos.com derives where each named reach may be found,
 * while the interval source remains cycle-free and one, so gameplay, cinema, and realism can all drink from the same ground.
 */

import {
	CANONICAL_VILLAGE_WATER_REACH_SPECS
} from './CanonicalVillageWaterReachSpecs.js';
import { riverCenterAt } from './VillageRiverPath.js';

export const CANONICAL_VILLAGE_WATER_REACHES = Object.freeze(
	CANONICAL_VILLAGE_WATER_REACH_SPECS.map((spec, index) => Object.freeze({
		...spec,
		destination: CANONICAL_VILLAGE_WATER_REACH_SPECS[index + 1]?.id || null,
		focus: Object.freeze(focusAt(spec.heroFocusT)),
		source: CANONICAL_VILLAGE_WATER_REACH_SPECS[index - 1]?.id || null
	}))
);

export const CANONICAL_VILLAGE_WATER_REACHES_BY_ID = Object.freeze(
	Object.fromEntries(
		CANONICAL_VILLAGE_WATER_REACHES.map(value => [value.id, value])
	)
);

/**
 * Returns one named reach on the actual canonical river path.
 * @param {unknown} id Stable reach id.
 * @returns {object|null} Frozen reach record including world-space focus.
 */
export function canonicalVillageWaterReach(id) {
	return CANONICAL_VILLAGE_WATER_REACHES_BY_ID[String(id || '')] || null;
}

/**
 * Verifies that authored reach intervals form one unbroken source-to-outlet chain.
 * @returns {{ready:boolean,issues:string[]}} Continuity evidence.
 */
export function auditCanonicalVillageWaterContinuity() {
	const issues = [];
	for (
		let index = 0;
		index < CANONICAL_VILLAGE_WATER_REACHES.length;
		index += 1
	) {
		const current = CANONICAL_VILLAGE_WATER_REACHES[index];
		const next = CANONICAL_VILLAGE_WATER_REACHES[index + 1];
		if (next && Math.abs(current.endT - next.startT) > 0.000001) {
			issues.push(`${current.id} does not meet ${next.id}.`);
		}
		if (next && current.destination !== next.id) {
			issues.push(`${current.id} has an invalid downstream destination.`);
		}
	}
	return {
		issues,
		ready: issues.length === 0
	};
}

function focusAt(t) {
	const center = riverCenterAt(t);
	return {
		x: center.x,
		y: 6,
		z: center.z
	};
}
