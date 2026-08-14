// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalVillageWaterFeatures.js
 * @description Names the real source-to-outlet river reaches without duplicating or replacing the canonical hydrology geometry.
 * The Awtsmoos pours one living current through many finite bends; Awtsmoos.com names each reach with care,
 * so gameplay and cinema can ask where the water comes from, where it goes, and what kind of flow is there.
 */

import { riverCenterAt } from './VillageRiverPath.js';

const REACH_SPECS = Object.freeze([
	reach('mountain-headwater', 'Mountain headwater', 0, 0.08, 'spring', 'fast-shallow', 'rocky-source'),
	reach('upper-cascades', 'Upper cascades', 0.08, 0.22, 'cascade', 'broken-fast', 'wet-rock'),
	reach('plunge-narrows', 'Plunge basin and narrows', 0.22, 0.4, 'plunge', 'fast-deep', 'boulder-bank'),
	reach('bridge-reach', 'Bridge river reach', 0.4, 0.62, 'river', 'steady-medium', 'reed-stone'),
	reach('lower-river', 'Lower river gardens', 0.62, 0.7, 'river', 'steady-deepening', 'garden-bank'),
	reach('lower-lake', 'Lower lake basin', 0.7, 0.84, 'lake', 'calm-deep', 'soft-shore'),
	reach('outlet-reach', 'Village outlet', 0.84, 1, 'outlet', 'steady-deep', 'open-bank')
]);

export const CANONICAL_VILLAGE_WATER_REACHES = Object.freeze(REACH_SPECS.map((spec, index) => Object.freeze({
	...spec,
	destination: REACH_SPECS[index + 1]?.id || null,
	focus: Object.freeze(focusAt(spec.heroFocusT)),
	source: REACH_SPECS[index - 1]?.id || null
})));

export const CANONICAL_VILLAGE_WATER_REACHES_BY_ID = Object.freeze(Object.fromEntries(
	CANONICAL_VILLAGE_WATER_REACHES.map(value => [value.id, value])
));

/**
 * Returns one named reach on the actual canonical river path.
 *
 * @param {unknown} id Stable reach id.
 * @returns {object|null} Frozen reach record.
 */
export function canonicalVillageWaterReach(id) {
	return CANONICAL_VILLAGE_WATER_REACHES_BY_ID[String(id || '')] || null;
}

/**
 * Verifies that authored reach intervals form one unbroken source-to-outlet chain.
 *
 * @returns {{ready:boolean, issues:string[]}} Continuity evidence.
 */
export function auditCanonicalVillageWaterContinuity() {
	const issues = [];
	for (let index = 0; index < CANONICAL_VILLAGE_WATER_REACHES.length; index += 1) {
		const current = CANONICAL_VILLAGE_WATER_REACHES[index];
		const next = CANONICAL_VILLAGE_WATER_REACHES[index + 1];
		if (next && Math.abs(current.endT - next.startT) > 0.000001) {
			issues.push(`${current.id} does not meet ${next.id}.`);
		}
		if (next && current.destination !== next.id) {
			issues.push(`${current.id} has an invalid downstream destination.`);
		}
	}
	return { issues, ready: issues.length === 0 };
}

function reach(id, label, startT, endT, kind, flowCharacter, bankCharacter) {
	return Object.freeze({
		bankCharacter,
		endT,
		flowCharacter,
		heroFocusT: (startT + endT) / 2,
		id,
		kind,
		label,
		startT,
		waterPhysicalKey: kind
	});
}

function focusAt(t) {
	const center = riverCenterAt(t);
	return { x: center.x, y: 6, z: center.z };
}
